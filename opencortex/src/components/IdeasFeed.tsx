"use client";

import { useState, useEffect, useCallback } from "react";
import Avatar from "./Avatar";
import TimeAgo from "./TimeAgo";

interface Author {
  id: string;
  name: string;
  handle: string;
  avatar: string | null;
}

interface Comment {
  id: string;
  content: string;
  author: Author;
  createdAt: string;
}

interface LinkedPaper {
  paper: {
    id: string;
    title: string;
    status: string;
  };
}

interface Idea {
  id: string;
  content: string;
  author: Author;
  createdAt: string;
  comments: Comment[];
  linkedPapers: LinkedPaper[];
  _count: { comments: number };
}

export default function IdeasFeed() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [newIdea, setNewIdea] = useState("");
  const [posting, setPosting] = useState(false);
  const [expandedIdea, setExpandedIdea] = useState<string | null>(null);
  const [commentTexts, setCommentTexts] = useState<Record<string, string>>({});

  const fetchIdeas = useCallback(async () => {
    const res = await fetch("/api/ideas");
    const data = await res.json();
    setIdeas(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchIdeas();
  }, [fetchIdeas]);

  const postIdea = async () => {
    if (!newIdea.trim()) return;
    setPosting(true);
    await fetch("/api/ideas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: newIdea }),
    });
    setNewIdea("");
    setPosting(false);
    fetchIdeas();
  };

  const postComment = async (ideaId: string) => {
    const content = commentTexts[ideaId];
    if (!content?.trim()) return;
    await fetch(`/api/ideas/${ideaId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    setCommentTexts((prev) => ({ ...prev, [ideaId]: "" }));
    fetchIdeas();
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Compose box */}
      <div className="border border-[var(--border)] rounded-xl p-4 mb-6 bg-[var(--surface)]">
        <textarea
          value={newIdea}
          onChange={(e) => setNewIdea(e.target.value)}
          placeholder="Share a scientific idea... What if we tried X for Y?"
          className="w-full bg-transparent text-[var(--foreground)] placeholder-[var(--muted)] resize-none outline-none text-sm leading-relaxed min-h-[80px]"
          onKeyDown={(e) => {
            if (e.key === "Enter" && e.metaKey) postIdea();
          }}
        />
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-[var(--border)]">
          <span className="text-xs text-[var(--muted)]">
            {newIdea.length > 0 && `${newIdea.length} chars`}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-[var(--muted)]">Cmd+Enter</span>
            <button
              onClick={postIdea}
              disabled={posting || !newIdea.trim()}
              className="px-4 py-1.5 bg-[var(--accent)] text-white text-sm font-medium rounded-lg hover:bg-[var(--accent-dim)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {posting ? "Posting..." : "Post Idea"}
            </button>
          </div>
        </div>
      </div>

      {/* Ideas stream */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border border-[var(--border)] rounded-xl p-4 animate-pulse">
              <div className="flex gap-3">
                <div className="w-9 h-9 rounded-full bg-[var(--border)]" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-[var(--border)] rounded w-1/3" />
                  <div className="h-3 bg-[var(--border)] rounded w-full" />
                  <div className="h-3 bg-[var(--border)] rounded w-2/3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {ideas.map((idea) => (
            <article
              key={idea.id}
              className="border border-[var(--border)] rounded-xl p-4 bg-[var(--surface)] hover:bg-[var(--surface-hover)] transition-colors"
            >
              {/* Author row */}
              <div className="flex items-start gap-3">
                <Avatar
                  initials={idea.author.avatar || idea.author.name.charAt(0)}
                  name={idea.author.name}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm">{idea.author.name}</span>
                    <span className="text-[var(--muted)] text-xs">@{idea.author.handle}</span>
                    <span className="text-[var(--muted)] text-xs">·</span>
                    <TimeAgo date={idea.createdAt} />
                  </div>
                  <p className="mt-1.5 text-sm leading-relaxed whitespace-pre-wrap">
                    {idea.content}
                  </p>

                  {/* Linked papers */}
                  {idea.linkedPapers.length > 0 && (
                    <div className="mt-3 flex gap-2 flex-wrap">
                      {idea.linkedPapers.map((lp) => (
                        <span
                          key={lp.paper.id}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 text-xs border border-indigo-500/20"
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                          </svg>
                          {lp.paper.title.substring(0, 40)}...
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="mt-3 flex items-center gap-4">
                    <button
                      onClick={() =>
                        setExpandedIdea(expandedIdea === idea.id ? null : idea.id)
                      }
                      className="flex items-center gap-1.5 text-xs text-[var(--muted)] hover:text-[var(--accent)] transition-colors"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      </svg>
                      {idea._count.comments} {idea._count.comments === 1 ? "reply" : "replies"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Comments thread */}
              {expandedIdea === idea.id && (
                <div className="mt-4 ml-12 space-y-3 border-l-2 border-[var(--border)] pl-4">
                  {idea.comments.map((comment) => (
                    <div key={comment.id} className="flex items-start gap-2">
                      <Avatar
                        initials={comment.author.avatar || comment.author.name.charAt(0)}
                        name={comment.author.name}
                        size="sm"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-xs">
                            {comment.author.name}
                          </span>
                          <span className="text-[var(--muted)] text-[10px]">
                            @{comment.author.handle}
                          </span>
                          <TimeAgo date={comment.createdAt} />
                        </div>
                        <p className="text-xs text-[var(--foreground)]/80 mt-0.5 leading-relaxed">
                          {comment.content}
                        </p>
                      </div>
                    </div>
                  ))}
                  {/* Reply box */}
                  <div className="flex gap-2 pt-2">
                    <input
                      value={commentTexts[idea.id] || ""}
                      onChange={(e) =>
                        setCommentTexts((prev) => ({
                          ...prev,
                          [idea.id]: e.target.value,
                        }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") postComment(idea.id);
                      }}
                      placeholder="Add a reply..."
                      className="flex-1 bg-[var(--background)] border border-[var(--border)] rounded-lg px-3 py-1.5 text-xs outline-none focus:border-[var(--accent)] transition-colors"
                    />
                    <button
                      onClick={() => postComment(idea.id)}
                      className="px-3 py-1.5 bg-[var(--accent)] text-white text-xs rounded-lg hover:bg-[var(--accent-dim)] transition-colors"
                    >
                      Reply
                    </button>
                  </div>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
