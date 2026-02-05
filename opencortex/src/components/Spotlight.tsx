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
      <div className="text-center mb-12 pt-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--warning-light)] border border-amber-200/50 text-amber-800 text-[13px] mb-5" style={{ fontFamily: "var(--font-crimson), 'Crimson Pro', Georgia, serif" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
          Curated Collection
        </div>
        <h2 className="text-3xl mb-3" style={{ fontFamily: "var(--font-playfair), 'Playfair Display', Georgia, serif", fontWeight: 600, fontStyle: "italic" }}>
          Spotlight
        </h2>
        <p className="text-[16px] text-[var(--muted)] max-w-lg mx-auto leading-relaxed" style={{ fontFamily: "var(--font-crimson), 'Crimson Pro', Georgia, serif" }}>
          The most impactful, well-crafted papers emerging from the OpenCortex
          community. Selected by both human reviewers and AI analysis.
        </p>
      </div>

      {/* Scoring explanation */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        <div className="border border-[var(--border)] rounded-2xl p-5 bg-[var(--surface)] text-center shadow-sm">
          <div className="text-3xl mb-1.5 text-[var(--success)]" style={{ fontFamily: "var(--font-playfair), 'Playfair Display', Georgia, serif", fontWeight: 600 }}>
            {papers.length}
          </div>
          <div className="text-[11px] text-[var(--muted)] uppercase tracking-[0.15em]" style={{ fontFamily: "var(--font-mono), monospace" }}>
            Spotlight Papers
          </div>
        </div>
        <div className="border border-[var(--border)] rounded-2xl p-5 bg-[var(--surface)] text-center shadow-sm">
          <div className="text-3xl mb-1.5 text-[var(--accent)]" style={{ fontFamily: "var(--font-playfair), 'Playfair Display', Georgia, serif", fontWeight: 600 }}>
            {papers.reduce(
              (acc, p) => acc + new Set(p.authors.map((a) => a.user.id)).size,
              0
            )}
          </div>
          <div className="text-[11px] text-[var(--muted)] uppercase tracking-[0.15em]" style={{ fontFamily: "var(--font-mono), monospace" }}>
            Contributors
          </div>
        </div>
        <div className="border border-[var(--border)] rounded-2xl p-5 bg-[var(--surface)] text-center shadow-sm">
          <div className="text-3xl mb-1.5 text-amber-700" style={{ fontFamily: "var(--font-playfair), 'Playfair Display', Georgia, serif", fontWeight: 600 }}>
            {papers.length > 0
              ? (
                  papers.reduce((acc, p) => acc + p.score, 0) / papers.length
                ).toFixed(1)
              : "—"}
          </div>
          <div className="text-[11px] text-[var(--muted)] uppercase tracking-[0.15em]" style={{ fontFamily: "var(--font-mono), monospace" }}>
            Avg Score
          </div>
        </div>
      </div>

      {/* Leaderboard */}
      {loading ? (
        <div className="space-y-5">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="border border-[var(--border)] rounded-2xl p-6 animate-pulse bg-[var(--surface)]"
            >
              <div className="h-5 bg-[var(--border)] rounded-full w-2/3 mb-4" />
              <div className="h-4 bg-[var(--border)] rounded-full w-full" />
            </div>
          ))}
        </div>
      ) : papers.length === 0 ? (
        <div className="border-2 border-dashed border-[var(--border)] rounded-2xl p-14 text-center bg-[var(--surface-warm)]">
          <div className="text-[var(--muted-soft)] mb-5">
            <svg
              width="56"
              height="56"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              className="mx-auto"
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </div>
          <h3 className="text-xl mb-3" style={{ fontFamily: "var(--font-playfair), 'Playfair Display', Georgia, serif", fontWeight: 600 }}>
            No spotlight papers yet
          </h3>
          <p className="text-[15px] text-[var(--muted)] max-w-sm mx-auto leading-relaxed" style={{ fontFamily: "var(--font-crimson), 'Crimson Pro', Georgia, serif" }}>
            Papers will be promoted to the Spotlight once they achieve sufficient quality scores
            from community review. Start by posting ideas and writing papers.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {papers
            .sort((a, b) => b.score - a.score)
            .map((paper, index) => (
              <div
                key={paper.id}
                className="border border-[var(--border)] rounded-2xl p-6 bg-[var(--surface)] hover:border-[var(--accent-muted)] transition-all duration-300 relative overflow-hidden shadow-sm hover:shadow-md"
              >
                {/* Rank badge */}
                <div className="absolute top-5 right-5">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-lg ${
                      index === 0
                        ? "bg-[var(--warning-light)] text-amber-700 border-2 border-amber-300"
                        : index === 1
                        ? "bg-stone-100 text-stone-500 border-2 border-stone-300"
                        : "bg-orange-50 text-orange-600 border-2 border-orange-200"
                    }`}
                    style={{ fontFamily: "var(--font-playfair), 'Playfair Display', Georgia, serif", fontWeight: 600, fontStyle: "italic" }}
                  >
                    #{index + 1}
                  </div>
                </div>

                {/* Score bar */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex-1 h-2 bg-[var(--border-light)] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[var(--accent)] to-amber-600 rounded-full transition-all"
                      style={{ width: `${paper.score}%` }}
                    />
                  </div>
                  <span className="text-[15px] text-[var(--accent)]" style={{ fontFamily: "var(--font-playfair), 'Playfair Display', Georgia, serif", fontWeight: 600 }}>
                    {paper.score}
                  </span>
                </div>

                <h3 className="text-lg leading-snug pr-16" style={{ fontFamily: "var(--font-playfair), 'Playfair Display', Georgia, serif", fontWeight: 600 }}>
                  {paper.title}
                </h3>
                <p className="mt-3 text-[15px] text-[var(--foreground-soft)] leading-[1.7] line-clamp-2" style={{ fontFamily: "var(--font-crimson), 'Crimson Pro', Georgia, serif" }}>
                  {paper.abstract}
                </p>

                <div className="mt-4 flex items-center gap-3">
                  <div className="flex -space-x-2">
                    {paper.authors.map((a) => (
                      <Avatar
                        key={a.user.id}
                        initials={a.user.avatar || a.user.name.charAt(0)}
                        name={a.user.name}
                        size="sm"
                      />
                    ))}
                  </div>
                  <span className="text-[14px] text-[var(--muted)]" style={{ fontFamily: "var(--font-crimson), 'Crimson Pro', Georgia, serif", fontStyle: "italic" }}>
                    {paper.authors.map((a) => a.user.name).join(", ")}
                  </span>
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Open Datasets section */}
      <div className="mt-14 border border-[var(--border)] rounded-2xl p-7 bg-[var(--surface)] shadow-sm">
        <h3 className="text-lg flex items-center gap-3 mb-2" style={{ fontFamily: "var(--font-playfair), 'Playfair Display', Georgia, serif", fontWeight: 600 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <ellipse cx="12" cy="5" rx="9" ry="3" />
            <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
            <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
          </svg>
          Open Datasets
        </h3>
        <p className="text-[14px] text-[var(--muted)] mb-5" style={{ fontFamily: "var(--font-crimson), 'Crimson Pro', Georgia, serif" }}>
          Access these open neuroscience datasets programmatically for your research.
        </p>
        <div className="grid grid-cols-2 gap-4">
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
              className="border border-[var(--border)] rounded-xl p-4 hover:border-[var(--accent-muted)] transition-all duration-300 bg-[var(--surface-warm)]"
            >
              <div className="text-[15px] mb-1" style={{ fontFamily: "var(--font-playfair), 'Playfair Display', Georgia, serif", fontWeight: 500 }}>{ds.name}</div>
              <p className="text-[12px] text-[var(--muted)] leading-relaxed mb-2" style={{ fontFamily: "var(--font-crimson), 'Crimson Pro', Georgia, serif" }}>
                {ds.desc}
              </p>
              <code className="text-[11px] text-[var(--accent)] block" style={{ fontFamily: "var(--font-mono), monospace" }}>
                {ds.api}
              </code>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
