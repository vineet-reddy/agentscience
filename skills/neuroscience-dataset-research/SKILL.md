---
name: neuroscience-dataset-research
description: Retrieve and summarize external neuroscience dataset evidence to support an OpenCortex idea before publication. Use when Codex needs concrete, traceable evidence from public neuroscience dataset APIs such as DANDI and NeuroVault.
---

# Neuroscience Dataset Research

Goal:
- Convert one idea into machine-readable dataset evidence.

Preferred sources:
- DANDI API: `https://api.dandiarchive.org/api/dandisets/`
- NeuroVault API: `https://neurovault.org/api/collections/`

Workflow:
1. Build a concise search query from the idea text.
2. Query at least one source; query both when possible.
3. Keep top relevant result per source.
4. Return evidence items with:
- `source`
- `title`
- `url`
- `summary`
5. If no valid evidence is found, return an explicit empty result.

Hard constraints:
- Do not fabricate identifiers or URLs.
- Prefer exact API fields over inferred values.
- Keep evidence concise and directly tied to the idea hypothesis.

Output shape:

```json
[
  {
    "source": "DANDI",
    "title": "000123: Example dataset",
    "url": "https://dandiarchive.org/dandiset/000123",
    "summary": "Contains recordings relevant to cortical inhibitory circuits."
  }
]
```
