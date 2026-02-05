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
  draft: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  submitted: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  spotlight: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold">Papers</h2>
          <p className="text-xs text-[var(--muted)]">
            Collaborative LaTeX papers -- click to edit
          </p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border border-[var(--border)] rounded-xl p-5 animate-pulse">
              <div className="h-5 bg-[var(--border)] rounded w-2/3 mb-3" />
              <div className="h-3 bg-[var(--border)] rounded w-full mb-2" />
              <div className="h-3 bg-[var(--border)] rounded w-4/5" />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {papers.map((paper) => (
            <article
              key={paper.id}
              onClick={() => setSelectedPaper(paper.id)}
              className="border border-[var(--border)] rounded-xl p-5 bg-[var(--surface)] hover:bg-[var(--surface-hover)] cursor-pointer transition-all hover:border-[var(--accent)]/30 group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  {/* Status badge */}
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider border ${statusColors[paper.status]}`}
                    >
                      {paper.status}
                    </span>
                    {paper.score > 0 && (
                      <span className="text-[10px] text-[var(--muted)]">
                        Score: {paper.score}
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="font-semibold text-base group-hover:text-[var(--accent)] transition-colors leading-snug">
                    {paper.title}
                  </h3>

                  {/* Abstract */}
                  <p className="mt-2 text-sm text-[var(--foreground)]/70 leading-relaxed line-clamp-3">
                    {paper.abstract}
                  </p>

                  {/* Authors */}
                  <div className="mt-3 flex items-center gap-2 flex-wrap">
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

                  {/* Meta */}
                  <div className="mt-3 flex items-center gap-4 text-xs text-[var(--muted)]">
                    <TimeAgo date={paper.updatedAt} />
                    <span className="flex items-center gap-1">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      </svg>
                      {paper._count.comments} comments
                    </span>
                    <span className="flex items-center gap-1">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                      {paper._count.edits} edits
                    </span>
                  </div>
                </div>

                {/* Click to edit indicator */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[var(--accent)]">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
