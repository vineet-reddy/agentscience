from __future__ import annotations

import json
import os
import re
import time
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Dict, List, Optional

import requests
from dotenv import load_dotenv

try:
    from openai import OpenAI
except Exception:  # pragma: no cover
    OpenAI = None


load_dotenv()


def _env_bool(name: str, default: bool) -> bool:
    value = os.getenv(name)
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


BASE_URL = os.getenv("OPENCORTEX_BASE_URL", "http://127.0.0.1:3000").rstrip("/")
API_KEY = os.getenv("OPENCORTEX_API_KEY", "")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-5-mini")
POLL_SECONDS = int(os.getenv("POLL_SECONDS", "120"))
IDEA_FETCH_LIMIT = int(os.getenv("IDEA_FETCH_LIMIT", "30"))
MIN_IDEA_LENGTH = int(os.getenv("MIN_IDEA_LENGTH", "80"))
POST_SUMMARY_IDEA = _env_bool("POST_SUMMARY_IDEA", True)
DRY_RUN = _env_bool("DRY_RUN", False)
STATE_FILE = Path(os.getenv("STATE_FILE", "./agent_state.json"))
REQUEST_TIMEOUT = int(os.getenv("REQUEST_TIMEOUT_SECONDS", "20"))


if not API_KEY:
    raise SystemExit("OPENCORTEX_API_KEY is required.")


HEADERS = {
    "x-api-key": API_KEY,
    "content-type": "application/json",
}


@dataclass
class DatasetEvidence:
    source: str
    title: str
    url: str
    summary: str


def _request(method: str, path: str, **kwargs: Any) -> requests.Response:
    return requests.request(
        method,
        f"{BASE_URL}{path}",
        timeout=REQUEST_TIMEOUT,
        **kwargs,
    )


def _load_state() -> Dict[str, Any]:
    if not STATE_FILE.exists():
        return {"processed_idea_ids": [], "published_paper_ids": []}
    return json.loads(STATE_FILE.read_text(encoding="utf-8"))


def _save_state(state: Dict[str, Any]) -> None:
    STATE_FILE.write_text(json.dumps(state, indent=2), encoding="utf-8")


def fetch_ideas() -> List[Dict[str, Any]]:
    res = _request("GET", "/api/ideas")
    res.raise_for_status()
    ideas = res.json()
    return ideas[:IDEA_FETCH_LIMIT]


def _strip_ws(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip()


def idea_is_interesting(content: str) -> bool:
    text = _strip_ws(content.lower())
    if len(text) < MIN_IDEA_LENGTH:
        return False
    keywords = [
        "brain",
        "neural",
        "neuron",
        "cortex",
        "memory",
        "hippocamp",
        "fmri",
        "eeg",
        "synapse",
        "plasticity",
        "neuroscience",
    ]
    return any(k in text for k in keywords)


def choose_idea(ideas: List[Dict[str, Any]], processed_ids: set[str]) -> Optional[Dict[str, Any]]:
    for idea in ideas:
        idea_id = idea.get("id")
        content = idea.get("content", "")
        if not idea_id or idea_id in processed_ids:
            continue
        if idea_is_interesting(content):
            return idea
    return None


def fetch_dandi(query: str) -> Optional[DatasetEvidence]:
    url = "https://api.dandiarchive.org/api/dandisets/"
    try:
        r = requests.get(url, params={"search": query, "page_size": 1}, timeout=REQUEST_TIMEOUT)
        r.raise_for_status()
        payload = r.json()
        results = payload.get("results") or []
        if not results:
            return None
        top = results[0]
        identifier = top.get("identifier", "unknown")
        name = top.get("name", "DANDI dataset")
        return DatasetEvidence(
            source="DANDI",
            title=f"{identifier}: {name}",
            url=f"https://dandiarchive.org/dandiset/{identifier}",
            summary="Matched DANDI dataset metadata relevant to the selected OpenCortex idea.",
        )
    except Exception:
        return None


def fetch_neurovault(query: str) -> Optional[DatasetEvidence]:
    url = "https://neurovault.org/api/collections/"
    try:
        r = requests.get(url, params={"limit": 1, "offset": 0, "name": query[:60]}, timeout=REQUEST_TIMEOUT)
        r.raise_for_status()
        payload = r.json()
        results = payload.get("results") or []
        if not results:
            return None
        top = results[0]
        cid = top.get("id")
        name = top.get("name", "NeuroVault collection")
        return DatasetEvidence(
            source="NeuroVault",
            title=name,
            url=f"https://neurovault.org/collections/{cid}" if cid else "https://neurovault.org",
            summary="Matched NeuroVault collection metadata related to the idea topic.",
        )
    except Exception:
        return None


def dataset_enrichment(idea_text: str) -> List[DatasetEvidence]:
    evidence: List[DatasetEvidence] = []
    for fn in (fetch_dandi, fetch_neurovault):
        hit = fn(idea_text)
        if hit:
            evidence.append(hit)
    return evidence


def _fallback_paper(idea_text: str, evidence: List[DatasetEvidence]) -> Dict[str, str]:
    e_lines = "\n".join([f"- {e.source}: {e.title} ({e.url})" for e in evidence]) or "- External datasets unavailable"
    title = f"Dataset-grounded hypothesis from OpenCortex idea"
    abstract = (
        "This paper formalizes a neuroscience hypothesis derived from an OpenCortex idea and "
        "grounds it in external dataset metadata for rapid validation planning."
    )
    latex = f"""\\documentclass{{article}}
\\usepackage[margin=1in]{{geometry}}
\\title{{{title}}}
\\author{{OpenCortex Neuro Agent}}
\\date{{\\today}}
\\begin{{document}}
\\maketitle
\\begin{{abstract}}
{abstract}
\\end{{abstract}}
\\section*{{Originating idea}}
{idea_text}
\\section*{{External dataset evidence}}
\\begin{{itemize}}
{''.join([f'\\item {e.source}: {e.title}. URL: {e.url}\n' for e in evidence]) if evidence else '\\item No dataset returned; publish blocked in strict mode.'}
\\end{{itemize}}
\\section*{{Testable predictions}}
The hypothesis predicts measurable signal differences in task-relevant neural features under controlled perturbations.
\\section*{{Methods sketch}}
Use pre-registered analyses and hold-out validation with dataset-specific covariates.
\\end{{document}}
"""
    return {"title": title, "abstract": abstract, "latexSource": latex, "datasetBullets": e_lines}


def _llm_paper(idea_text: str, evidence: List[DatasetEvidence]) -> Optional[Dict[str, str]]:
    if not OPENAI_API_KEY or OpenAI is None:
        return None

    client = OpenAI(api_key=OPENAI_API_KEY)
    evidence_text = "\n".join([f"- {e.source}: {e.title} ({e.url})" for e in evidence])
    prompt = f"""
You are writing a concise neuroscience paper draft.
Use the OpenCortex idea and dataset evidence below.
Return only valid JSON with keys: title, abstract, latexSource.

Idea:
{idea_text}

Dataset evidence:
{evidence_text}

Rules:
- Do not invent fake dataset IDs.
- Mention dataset URLs in latexSource methods section.
- Keep abstract under 140 words.
- Output strict JSON only.
""".strip()

    try:
        resp = client.responses.create(model=OPENAI_MODEL, input=prompt)
        text = resp.output_text
        data = json.loads(text)
        if not all(k in data for k in ("title", "abstract", "latexSource")):
            return None
        return {
            "title": str(data["title"]),
            "abstract": str(data["abstract"]),
            "latexSource": str(data["latexSource"]),
        }
    except Exception:
        return None


def build_paper(idea_text: str, evidence: List[DatasetEvidence]) -> Dict[str, str]:
    generated = _llm_paper(idea_text, evidence)
    if generated:
        return generated
    return _fallback_paper(idea_text, evidence)


def publish_paper(paper: Dict[str, str]) -> Dict[str, Any]:
    if DRY_RUN:
        print("[DRY_RUN] Paper payload prepared.")
        return {"id": "dry-run-paper"}
    res = _request("POST", "/api/papers", headers=HEADERS, data=json.dumps(paper))
    res.raise_for_status()
    return res.json()


def post_summary_idea(idea_id: str, paper_id: str, title: str) -> None:
    if not POST_SUMMARY_IDEA:
        return
    content = f"Published paper from idea {idea_id}: {title} (paper_id={paper_id})"
    payload = {"content": content}
    if DRY_RUN:
        print("[DRY_RUN] Summary idea payload prepared.")
        return
    res = _request("POST", "/api/ideas", headers=HEADERS, data=json.dumps(payload))
    res.raise_for_status()


def run_once() -> None:
    state = _load_state()
    processed_ids = set(state.get("processed_idea_ids", []))

    ideas = fetch_ideas()
    idea = choose_idea(ideas, processed_ids)
    if not idea:
        print("No new interesting ideas.")
        return

    idea_id = idea["id"]
    idea_text = _strip_ws(idea["content"])
    evidence = dataset_enrichment(idea_text)
    if not evidence:
        print(f"Skipping idea {idea_id}: no dataset evidence.")
        processed_ids.add(idea_id)
        state["processed_idea_ids"] = sorted(processed_ids)
        _save_state(state)
        return

    paper_payload = build_paper(idea_text, evidence)
    created = publish_paper(paper_payload)
    paper_id = created.get("id", "unknown-paper")
    post_summary_idea(idea_id, paper_id, paper_payload["title"])

    processed_ids.add(idea_id)
    published = set(state.get("published_paper_ids", []))
    published.add(str(paper_id))

    state["processed_idea_ids"] = sorted(processed_ids)
    state["published_paper_ids"] = sorted(published)
    _save_state(state)

    print(f"Published paper {paper_id} from idea {idea_id}")


def main() -> None:
    print(f"Worker started. Poll every {POLL_SECONDS}s. Base URL={BASE_URL}")
    while True:
        try:
            run_once()
        except Exception as exc:
            print(f"Worker error: {exc}")
        time.sleep(POLL_SECONDS)


if __name__ == "__main__":
    main()
