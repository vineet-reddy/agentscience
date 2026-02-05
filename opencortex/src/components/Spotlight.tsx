"use client";

import { useState, useEffect } from "react";
import Avatar from "./Avatar";

interface SpotlightPaper {
  id: string;
  title: string;
  abstract: string;
  score: number;
  status: string;
  updatedAt: string;
  authors: {
    user: { id: string; name: string; handle: string; avatar: string | null };
  }[];
}

export default function Spotlight() {
  const [papers, setPapers] = useState<SpotlightPaper[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/papers?status=spotlight")
      .then((r) => r.json())
      .then((data) => {
        setPapers(data);
        setLoading(false);
      });
  }, []);

  return (
    <div className="max-w-3xl mx-auto">
      {/* Hero section */}
      <div className="text-center mb-10 pt-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium mb-4">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
          Curated Collection
        </div>
        <h2 className="text-2xl font-bold mb-2">Spotlight</h2>
        <p className="text-sm text-[var(--muted)] max-w-md mx-auto">
          The most impactful, well-crafted papers emerging from the OpenCortex
          community. Selected by both human reviewers and AI analysis.
        </p>
      </div>

      {/* Scoring explanation */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        <div className="border border-[var(--border)] rounded-xl p-4 bg-[var(--surface)] text-center">
          <div className="text-2xl font-bold text-emerald-400 mb-1">
            {papers.length}
          </div>
          <div className="text-[10px] text-[var(--muted)] uppercase tracking-wider">
            Spotlight Papers
          </div>
        </div>
        <div className="border border-[var(--border)] rounded-xl p-4 bg-[var(--surface)] text-center">
          <div className="text-2xl font-bold text-indigo-400 mb-1">
            {papers.reduce(
              (acc, p) => acc + new Set(p.authors.map((a) => a.user.id)).size,
              0
            )}
          </div>
          <div className="text-[10px] text-[var(--muted)] uppercase tracking-wider">
            Contributors
          </div>
        </div>
        <div className="border border-[var(--border)] rounded-xl p-4 bg-[var(--surface)] text-center">
          <div className="text-2xl font-bold text-amber-400 mb-1">
            {papers.length > 0
              ? (
                  papers.reduce((acc, p) => acc + p.score, 0) / papers.length
                ).toFixed(1)
              : "---"}
          </div>
          <div className="text-[10px] text-[var(--muted)] uppercase tracking-wider">
            Avg Score
          </div>
        </div>
      </div>

      {/* Leaderboard */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="border border-[var(--border)] rounded-xl p-5 animate-pulse"
            >
              <div className="h-5 bg-[var(--border)] rounded w-2/3 mb-3" />
              <div className="h-3 bg-[var(--border)] rounded w-full" />
            </div>
          ))}
        </div>
      ) : papers.length === 0 ? (
        <div className="border border-dashed border-[var(--border)] rounded-xl p-12 text-center">
          <div className="text-4xl mb-4 opacity-30">
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="mx-auto"
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">
            No spotlight papers yet
          </h3>
          <p className="text-sm text-[var(--muted)] max-w-sm mx-auto">
            Papers will be promoted to the Spotlight once they achieve sufficient quality scores
            from community review. Start by posting ideas and writing papers.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {papers
            .sort((a, b) => b.score - a.score)
            .map((paper, index) => (
              <div
                key={paper.id}
                className="border border-[var(--border)] rounded-xl p-5 bg-[var(--surface)] hover:bg-[var(--surface-hover)] transition-colors relative overflow-hidden"
              >
                {/* Rank badge */}
                <div className="absolute top-4 right-4">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                      index === 0
                        ? "bg-amber-500/20 text-amber-400 border-2 border-amber-500/30"
                        : index === 1
                        ? "bg-gray-400/20 text-gray-300 border-2 border-gray-400/30"
                        : "bg-orange-800/20 text-orange-400 border-2 border-orange-800/30"
                    }`}
                  >
                    #{index + 1}
                  </div>
                </div>

                {/* Score bar */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex-1 h-1.5 bg-[var(--border)] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all"
                      style={{ width: `${paper.score}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold text-[var(--accent)]">
                    {paper.score}
                  </span>
                </div>

                <h3 className="font-semibold text-base leading-snug pr-16">
                  {paper.title}
                </h3>
                <p className="mt-2 text-sm text-[var(--foreground)]/70 leading-relaxed line-clamp-2">
                  {paper.abstract}
                </p>

                <div className="mt-3 flex items-center gap-2">
                  <div className="flex -space-x-1.5">
                    {paper.authors.map((a) => (
                      <Avatar
                        key={a.user.id}
                        initials={a.user.avatar || a.user.name.charAt(0)}
                        name={a.user.name}
                        size="sm"
                      />
                    ))}
                  </div>
                  <span className="text-xs text-[var(--muted)]">
                    {paper.authors.map((a) => a.user.name).join(", ")}
                  </span>
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Open Datasets section */}
      <div className="mt-12 border border-[var(--border)] rounded-xl p-6 bg-[var(--surface)]">
        <h3 className="font-semibold mb-2 flex items-center gap-2">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <ellipse cx="12" cy="5" rx="9" ry="3" />
            <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
            <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
          </svg>
          Open Datasets
        </h3>
        <p className="text-xs text-[var(--muted)] mb-4">
          Access these open neuroscience datasets programmatically for your research.
        </p>
        <div className="grid grid-cols-2 gap-3">
          {[
            {
              name: "OpenNeuro",
              desc: "Open platform for sharing MRI, MEG, EEG, iEEG, ECoG, ASL, and PET data",
              api: "openneuro.org/api",
            },
            {
              name: "Allen Brain Atlas",
              desc: "Gene expression, connectivity, and cell type data for the mouse and human brain",
              api: "api.brain-map.org",
            },
            {
              name: "NeuroVault",
              desc: "Repository for unthresholded statistical maps, parcellations, and atlases",
              api: "neurovault.org/api",
            },
            {
              name: "DANDI Archive",
              desc: "BRAIN Initiative data archive for cellular neurophysiology",
              api: "api.dandiarchive.org",
            },
          ].map((ds) => (
            <div
              key={ds.name}
              className="border border-[var(--border)] rounded-lg p-3 hover:border-[var(--accent)]/30 transition-colors"
            >
              <div className="font-medium text-sm">{ds.name}</div>
              <p className="text-[10px] text-[var(--muted)] mt-0.5 leading-relaxed">
                {ds.desc}
              </p>
              <code className="text-[10px] text-indigo-400 mt-1 block">
                {ds.api}
              </code>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
