"use client";

import { useState, useEffect, useCallback } from "react";
import Avatar from "./Avatar";
import TimeAgo from "./TimeAgo";

interface Author {
  user: { id: string; name: string; handle: string; avatar: string | null };
}

interface Comment {
  id: string;
  content: string;
  lineNumber: number | null;
  resolved: boolean;
  author: { name: string; handle: string; avatar: string | null };
  createdAt: string;
}

interface Edit {
  id: string;
  oldContent: string;
  newContent: string;
  description: string | null;
  status: string;
  author: { name: string; handle: string; avatar: string | null };
  createdAt: string;
}

interface PaperDetail {
  id: string;
  title: string;
  abstract: string;
  latexSource: string;
  status: string;
  score: number;
  createdAt: string;
  updatedAt: string;
  authors: Author[];
  comments: Comment[];
  edits: Edit[];
}

interface PaperEditorProps {
  paperId: string;
  onBack: () => void;
}

export default function PaperEditor({ paperId, onBack }: PaperEditorProps) {
  const [paper, setPaper] = useState<PaperDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editedLatex, setEditedLatex] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [commentText, setCommentText] = useState("");
  const [activePanel, setActivePanel] = useState<"source" | "comments" | "edits">("source");
  const [saving, setSaving] = useState(false);

  const fetchPaper = useCallback(async () => {
    const res = await fetch(`/api/papers/${paperId}`);
    const data = await res.json();
    setPaper(data);
    setEditedLatex(data.latexSource);
    setLoading(false);
  }, [paperId]);

  useEffect(() => {
    fetchPaper();
  }, [fetchPaper]);

  const submitEdit = async () => {
    if (!paper || editedLatex === paper.latexSource) return;
    setSaving(true);
    await fetch(`/api/papers/${paperId}/edits`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        oldContent: paper.latexSource,
        newContent: editedLatex,
        description: editDescription || "Updated paper content",
      }),
    });
    setSaving(false);
    setEditMode(false);
    setEditDescription("");
    fetchPaper();
  };

  const addComment = async () => {
    if (!commentText.trim()) return;
    await fetch(`/api/papers/${paperId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: commentText }),
    });
    setCommentText("");
    fetchPaper();
  };

  if (loading || !paper) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-[var(--border)] rounded w-1/3" />
          <div className="h-96 bg-[var(--border)] rounded" />
        </div>
      </div>
    );
  }

  // Simple diff visualization
  const hasDiff = editMode && editedLatex !== paper.latexSource;
  const originalLines = paper.latexSource.split("\n");
  const editedLines = editedLatex.split("\n");

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5" />
            <path d="M12 19l-7-7 7-7" />
          </svg>
          Back to Papers
        </button>
        <div className="flex items-center gap-2">
          {!editMode ? (
            <button
              onClick={() => setEditMode(true)}
              className="px-3 py-1.5 bg-[var(--accent)] text-white text-sm rounded-lg hover:bg-[var(--accent-dim)] transition-colors"
            >
              Edit Paper
            </button>
          ) : (
            <>
              <button
                onClick={() => {
                  setEditMode(false);
                  setEditedLatex(paper.latexSource);
                }}
                className="px-3 py-1.5 border border-[var(--border)] text-sm rounded-lg hover:bg-[var(--surface)] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={submitEdit}
                disabled={saving || !hasDiff}
                className="px-3 py-1.5 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 disabled:opacity-40 transition-colors"
              >
                {saving ? "Saving..." : "Submit Edit"}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Paper title & meta */}
      <div className="mb-4">
        <h1 className="text-xl font-bold leading-snug">{paper.title}</h1>
        <div className="mt-2 flex items-center gap-2 flex-wrap">
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
          <span className="text-xs text-[var(--muted)]">·</span>
          <TimeAgo date={paper.updatedAt} />
        </div>
      </div>

      {/* Tab bar for panels */}
      <div className="flex gap-1 mb-4 border-b border-[var(--border)]">
        {(["source", "comments", "edits"] as const).map((panel) => (
          <button
            key={panel}
            onClick={() => setActivePanel(panel)}
            className={`px-3 py-2 text-sm font-medium capitalize transition-colors border-b-2 ${
              activePanel === panel
                ? "border-[var(--accent)] text-[var(--accent)]"
                : "border-transparent text-[var(--muted)] hover:text-[var(--foreground)]"
            }`}
          >
            {panel}
            {panel === "comments" && ` (${paper.comments.length})`}
            {panel === "edits" && ` (${paper.edits.length})`}
          </button>
        ))}
      </div>

      {/* Source panel */}
      {activePanel === "source" && (
        <div className="grid grid-cols-1 gap-4">
          {editMode ? (
            <>
              {/* Edit description */}
              <input
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Describe your changes..."
                className="bg-[var(--surface)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
              />
              {/* Diff view */}
              {hasDiff && (
                <div className="border border-[var(--border)] rounded-xl overflow-hidden">
                  <div className="px-3 py-2 bg-[var(--surface)] border-b border-[var(--border)] text-xs font-medium text-[var(--muted)]">
                    Changes Preview
                  </div>
                  <div className="p-3 font-mono text-xs max-h-48 overflow-auto bg-[var(--background)]">
                    {editedLines.map((line, i) => {
                      const isNew = i >= originalLines.length || line !== originalLines[i];
                      const isRemoved = i < originalLines.length && line !== originalLines[i];
                      return (
                        <div key={i} className="flex">
                          <span className="w-8 text-right pr-2 text-[var(--muted)] select-none">
                            {i + 1}
                          </span>
                          <span
                            className={
                              isNew
                                ? "bg-emerald-500/10 text-emerald-400 flex-1"
                                : isRemoved
                                ? "bg-red-500/10 text-red-400 flex-1"
                                : "flex-1"
                            }
                          >
                            {isNew && !isRemoved && "+ "}
                            {line || " "}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              {/* Editor */}
              <textarea
                value={editedLatex}
                onChange={(e) => setEditedLatex(e.target.value)}
                className="w-full min-h-[500px] bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 font-mono text-xs leading-relaxed outline-none focus:border-[var(--accent)] resize-y"
                spellCheck={false}
              />
            </>
          ) : (
            /* Read-only rendered view */
            <div className="border border-[var(--border)] rounded-xl overflow-hidden">
              <div className="px-4 py-2 bg-[var(--surface)] border-b border-[var(--border)] flex items-center justify-between">
                <span className="text-xs font-medium text-[var(--muted)]">LaTeX Source</span>
                <span className="text-[10px] text-[var(--muted)]">Click &quot;Edit Paper&quot; to modify</span>
              </div>
              <div className="p-4 font-mono text-xs leading-relaxed max-h-[600px] overflow-auto bg-[var(--background)]">
                {paper.latexSource.split("\n").map((line, i) => (
                  <div key={i} className="flex hover:bg-[var(--surface)] group">
                    <span className="w-8 text-right pr-3 text-[var(--muted)] select-none text-[10px] pt-0.5">
                      {i + 1}
                    </span>
                    <span className="flex-1 whitespace-pre-wrap">
                      {renderLatexLine(line)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Comments panel */}
      {activePanel === "comments" && (
        <div className="space-y-3">
          {paper.comments.map((comment) => (
            <div
              key={comment.id}
              className={`border rounded-xl p-3 ${
                comment.resolved
                  ? "border-[var(--border)]/50 opacity-60"
                  : "border-[var(--border)] bg-[var(--surface)]"
              }`}
            >
              <div className="flex items-start gap-2">
                <Avatar
                  initials={comment.author.avatar || comment.author.name.charAt(0)}
                  name={comment.author.name}
                  size="sm"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-xs">{comment.author.name}</span>
                    {comment.lineNumber && (
                      <span className="text-[10px] text-[var(--muted)] bg-[var(--background)] px-1.5 py-0.5 rounded">
                        Line {comment.lineNumber}
                      </span>
                    )}
                    <TimeAgo date={comment.createdAt} />
                  </div>
                  <p className="text-sm mt-1 leading-relaxed">{comment.content}</p>
                </div>
              </div>
            </div>
          ))}

          {/* Add comment */}
          <div className="flex gap-2 pt-2">
            <input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") addComment();
              }}
              placeholder="Add a comment..."
              className="flex-1 bg-[var(--surface)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
            />
            <button
              onClick={addComment}
              className="px-4 py-2 bg-[var(--accent)] text-white text-sm rounded-lg hover:bg-[var(--accent-dim)] transition-colors"
            >
              Comment
            </button>
          </div>
        </div>
      )}

      {/* Edits panel */}
      {activePanel === "edits" && (
        <div className="space-y-3">
          {paper.edits.length === 0 ? (
            <p className="text-sm text-[var(--muted)] text-center py-8">
              No edits yet. Click &quot;Edit Paper&quot; to suggest changes.
            </p>
          ) : (
            paper.edits.map((edit) => (
              <div
                key={edit.id}
                className="border border-[var(--border)] rounded-xl overflow-hidden bg-[var(--surface)]"
              >
                <div className="px-3 py-2 flex items-center justify-between border-b border-[var(--border)]">
                  <div className="flex items-center gap-2">
                    <Avatar
                      initials={edit.author.avatar || edit.author.name.charAt(0)}
                      name={edit.author.name}
                      size="sm"
                    />
                    <span className="text-xs font-medium">{edit.author.name}</span>
                    <TimeAgo date={edit.createdAt} />
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-medium uppercase ${
                      edit.status === "accepted"
                        ? "bg-emerald-500/10 text-emerald-400"
                        : edit.status === "rejected"
                        ? "bg-red-500/10 text-red-400"
                        : "bg-yellow-500/10 text-yellow-400"
                    }`}
                  >
                    {edit.status}
                  </span>
                </div>
                {edit.description && (
                  <div className="px-3 py-2 text-xs text-[var(--muted)] border-b border-[var(--border)]">
                    {edit.description}
                  </div>
                )}
                <div className="p-3 font-mono text-[10px] max-h-48 overflow-auto">
                  <div className="text-red-400/70 line-through">
                    {edit.oldContent.substring(0, 200)}...
                  </div>
                  <div className="text-emerald-400 mt-1">
                    {edit.newContent.substring(0, 200)}...
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// Simple LaTeX syntax highlighting
function renderLatexLine(line: string) {
  if (line.startsWith("\\section") || line.startsWith("\\subsection") || line.startsWith("\\title")) {
    return <span className="text-indigo-400 font-semibold">{line}</span>;
  }
  if (line.startsWith("\\begin") || line.startsWith("\\end")) {
    return <span className="text-purple-400">{line}</span>;
  }
  if (line.startsWith("\\item") || line.startsWith("\\textbf")) {
    return <span className="text-emerald-400">{line}</span>;
  }
  if (line.startsWith("%")) {
    return <span className="text-[var(--muted)] italic">{line}</span>;
  }
  if (line.startsWith("\\")) {
    return <span className="text-cyan-400">{line}</span>;
  }
  return <>{line}</>;
}
