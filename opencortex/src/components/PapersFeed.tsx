"use client";

import { useState, useEffect, useCallback } from "react";
import Avatar from "./Avatar";
import TimeAgo from "./TimeAgo";
import PaperEditor from "./PaperEditor";

interface Author {
  user: {
    id: string;
    name: string;
    handle: string;
    avatar: string | null;
  };
}

interface Paper {
  id: string;
  title: string;
  abstract: string;
  status: string;
  score: number;
  createdAt: string;
  updatedAt: string;
  authors: Author[];
  _count: { comments: number; edits: number };
}

const statusColors: Record<string, string> = {
  draft: "bg-[var(--warning-light)] text-amber-800 border-amber-200/50",
  submitted: "bg-[var(--info-light)] text-[var(--info)] border-[var(--info)]/20",
  spotlight: "bg-[var(--success-light)] text-[var(--success)] border-[var(--success)]/20",
};

export default function PapersFeed() {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPaper, setSelectedPaper] = useState<string | null>(null);

  const fetchPapers = useCallback(async () => {
    const res = await fetch("/api/papers");
    const data = await res.json();
    setPapers(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchPapers();
  }, [fetchPapers]);

  if (selectedPaper) {
    return (
      <PaperEditor
        paperId={selectedPaper}
        onBack={() => {
          setSelectedPaper(null);
          fetchPapers();
        }}
      />
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl" style={{ fontFamily: "var(--font-playfair), 'Playfair Display', Georgia, serif", fontWeight: 600 }}>
            Papers
          </h2>
          <p className="text-[14px] text-[var(--muted)] mt-1" style={{ fontFamily: "var(--font-crimson), 'Crimson Pro', Georgia, serif" }}>
            Collaborative LaTeX papers — click to view and edit
          </p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border border-[var(--border)] rounded-2xl p-6 animate-pulse bg-[var(--surface)]">
              <div className="h-5 bg-[var(--border)] rounded-full w-2/3 mb-4" />
              <div className="h-4 bg-[var(--border)] rounded-full w-full mb-2" />
              <div className="h-4 bg-[var(--border)] rounded-full w-4/5" />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-5">
          {papers.map((paper) => (
            <article
              key={paper.id}
              onClick={() => setSelectedPaper(paper.id)}
              className="border border-[var(--border)] rounded-2xl p-6 bg-[var(--surface)] hover:border-[var(--accent-muted)] cursor-pointer transition-all duration-300 shadow-sm hover:shadow-md group"
            >
              <div className="flex items-start justify-between gap-5">
                <div className="flex-1 min-w-0">
                  {/* Status badge */}
                  <div className="flex items-center gap-3 mb-3">
                    <span
                      className={`px-3 py-1 rounded-full text-[11px] font-medium uppercase tracking-wider border ${statusColors[paper.status]}`}
                      style={{ fontFamily: "var(--font-mono), monospace" }}
                    >
                      {paper.status}
                    </span>
                    {paper.score > 0 && (
                      <span className="text-[12px] text-[var(--muted)]" style={{ fontFamily: "var(--font-mono), monospace" }}>
                        Score: {paper.score}
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3 
                    className="text-lg group-hover:text-[var(--accent)] transition-colors duration-300 leading-snug"
                    style={{ fontFamily: "var(--font-playfair), 'Playfair Display', Georgia, serif", fontWeight: 600 }}
                  >
                    {paper.title}
                  </h3>

                  {/* Abstract */}
                  <p 
                    className="mt-3 text-[15px] text-[var(--foreground-soft)] leading-[1.7] line-clamp-3"
                    style={{ fontFamily: "var(--font-crimson), 'Crimson Pro', Georgia, serif" }}
                  >
                    {paper.abstract}
                  </p>

                  {/* Authors */}
                  <div className="mt-4 flex items-center gap-3 flex-wrap">
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
                    <span 
                      className="text-[14px] text-[var(--muted)]"
                      style={{ fontFamily: "var(--font-crimson), 'Crimson Pro', Georgia, serif", fontStyle: "italic" }}
                    >
                      {paper.authors.map((a) => a.user.name).join(", ")}
                    </span>
                  </div>

                  {/* Meta */}
                  <div className="mt-4 flex items-center gap-5 text-[13px] text-[var(--muted)]" style={{ fontFamily: "var(--font-crimson), 'Crimson Pro', Georgia, serif" }}>
                    <TimeAgo date={paper.updatedAt} />
                    <span className="flex items-center gap-1.5">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      </svg>
                      {paper._count.comments} comments
                    </span>
                    <span className="flex items-center gap-1.5">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                      {paper._count.edits} edits
                    </span>
                  </div>
                </div>

                {/* Click to edit indicator */}
                <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 text-[var(--accent)] translate-x-0 group-hover:translate-x-1">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M5 12h14" />
                    <path d="M12 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
