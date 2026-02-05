"use client";

import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";

export default function Home() {
  const apiBase = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000").replace(/\/$/, "");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [texFile, setTexFile] = useState<File | null>(null);
  const [extractResponse, setExtractResponse] = useState<string>("");
  const [leaderboardPayload, setLeaderboardPayload] = useState(
    JSON.stringify(
      {
        papers: [
          {
            paper_id: "paper-a",
            title: "Neural Dynamics A",
            doi: "10.1000/example.a",
            novelty_score: 0.62,
            evidence_score: 0.71,
            citations: {
              openalex: 25,
              semantic_scholar: 22,
              scholar_csv: 24,
            },
          },
          {
            paper_id: "paper-b",
            title: "Neural Dynamics B",
            doi: "10.1000/example.b",
            novelty_score: 0.43,
            evidence_score: 0.66,
            citations: {
              openalex: 40,
            },
          },
        ],
        edges: [
          { source_id: "paper-a", target_id: "paper-b", kind: "citation", confidence: 1.0 },
          { source_id: "paper-b", target_id: "paper-a", kind: "llm_inferred", confidence: 0.6 },
        ],
        citation_policy: "max",
      },
      null,
      2
    )
  );
  const [leaderboardResponse, setLeaderboardResponse] = useState<string>("");
  const [extractError, setExtractError] = useState<string>("");
  const [leaderboardError, setLeaderboardError] = useState<string>("");
  const [extractLoading, setExtractLoading] = useState<boolean>(false);
  const [leaderboardLoading, setLeaderboardLoading] = useState<boolean>(false);

  const handlePdfChange = (event: ChangeEvent<HTMLInputElement>) => {
    setPdfFile(event.target.files?.[0] ?? null);
  };

  const handleTexChange = (event: ChangeEvent<HTMLInputElement>) => {
    setTexFile(event.target.files?.[0] ?? null);
  };

  const handleExtract = async (event: FormEvent) => {
    event.preventDefault();
    setExtractError("");
    setExtractResponse("");

    if (!pdfFile) {
      setExtractError("Please provide a PDF file.");
      return;
    }

    setExtractLoading(true);
    try {
      const formData = new FormData();
      formData.append("pdf", pdfFile);
      if (texFile) {
        formData.append("tex", texFile);
      }

      const response = await fetch(`${apiBase}/extract`, {
        method: "POST",
        body: formData,
      });
      const body = await response.json();
      if (!response.ok) {
        setExtractError(body?.detail || `Request failed with status ${response.status}`);
        return;
      }

      setExtractResponse(JSON.stringify(body, null, 2));
    } catch (error) {
      setExtractError(error instanceof Error ? error.message : "Unexpected network error.");
    } finally {
      setExtractLoading(false);
    }
  };

  const handleLeaderboard = async (event: FormEvent) => {
    event.preventDefault();
    setLeaderboardError("");
    setLeaderboardResponse("");

    let payload: unknown;
    try {
      payload = JSON.parse(leaderboardPayload);
    } catch {
      setLeaderboardError("Leaderboard payload must be valid JSON.");
      return;
    }

    setLeaderboardLoading(true);
    try {
      const response = await fetch(`${apiBase}/leaderboard`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await response.json();
      if (!response.ok) {
        setLeaderboardError(body?.detail || `Request failed with status ${response.status}`);
        return;
      }
      setLeaderboardResponse(JSON.stringify(body, null, 2));
    } catch (error) {
      setLeaderboardError(error instanceof Error ? error.message : "Unexpected network error.");
    } finally {
      setLeaderboardLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <main className="mx-auto max-w-5xl px-6 py-10">
        <header className="mb-8 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6">
          <h1 className="text-3xl">AgentScience API Console</h1>
          <p className="mt-2 text-[var(--foreground-soft)]">
            Frontend deployed on Vercel, calling your FastAPI endpoints directly.
          </p>
          <p className="mt-4 text-sm">
            API Base URL: <code>{apiBase}</code>
          </p>
        </header>

        <section className="mb-8 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6">
          <h2 className="text-2xl">POST /extract</h2>
          <form className="mt-4 space-y-4" onSubmit={handleExtract}>
            <div>
              <label className="mb-1 block text-sm">PDF file (required)</label>
              <input
                type="file"
                accept="application/pdf"
                onChange={handlePdfChange}
                className="w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm">LaTeX file (optional)</label>
              <input
                type="file"
                accept=".tex,text/plain"
                onChange={handleTexChange}
                className="w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2"
              />
            </div>
            <button
              type="submit"
              disabled={extractLoading}
              className="rounded-lg bg-[var(--accent)] px-4 py-2 text-white disabled:opacity-60"
            >
              {extractLoading ? "Running extraction..." : "Run extraction"}
            </button>
          </form>

          {extractError && (
            <p className="mt-4 rounded-lg border border-[var(--warning)] bg-[var(--warning-light)] p-3 text-sm">
              {extractError}
            </p>
          )}

          {extractResponse && (
            <pre className="mt-4 max-h-96 overflow-auto rounded-lg border border-[var(--border)] bg-[var(--surface-warm)] p-4 text-sm">
              {extractResponse}
            </pre>
          )}
        </section>

        <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6">
          <h2 className="text-2xl">POST /leaderboard</h2>
          <form className="mt-4 space-y-4" onSubmit={handleLeaderboard}>
            <div>
              <label className="mb-1 block text-sm">JSON payload</label>
              <textarea
                value={leaderboardPayload}
                onChange={(event) => setLeaderboardPayload(event.target.value)}
                rows={16}
                className="w-full rounded-lg border border-[var(--border)] bg-white p-3 font-mono text-sm"
              />
            </div>
            <button
              type="submit"
              disabled={leaderboardLoading}
              className="rounded-lg bg-[var(--accent)] px-4 py-2 text-white disabled:opacity-60"
            >
              {leaderboardLoading ? "Computing leaderboard..." : "Run leaderboard"}
            </button>
          </form>

          {leaderboardError && (
            <p className="mt-4 rounded-lg border border-[var(--warning)] bg-[var(--warning-light)] p-3 text-sm">
              {leaderboardError}
            </p>
          )}

          {leaderboardResponse && (
            <pre className="mt-4 max-h-96 overflow-auto rounded-lg border border-[var(--border)] bg-[var(--surface-warm)] p-4 text-sm">
              {leaderboardResponse}
            </pre>
          )}
        </section>
      </main>
    </div>
  );
}
