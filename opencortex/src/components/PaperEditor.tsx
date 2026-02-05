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
        <div className="animate-pulse space-y-5">
          <div className="h-8 bg-[var(--border)] rounded-full w-1/3" />
          <div className="h-96 bg-[var(--border)] rounded-2xl" />
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
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-[14px] text-[var(--muted)] hover:text-[var(--foreground)] transition-colors duration-300"
          style={{ fontFamily: "var(--font-crimson), 'Crimson Pro', Georgia, serif" }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M19 12H5" />
            <path d="M12 19l-7-7 7-7" />
          </svg>
          Back to Papers
        </button>
        <div className="flex items-center gap-3">
          {!editMode ? (
            <button
              onClick={() => setEditMode(true)}
              className="px-5 py-2 bg-[var(--accent)] text-white text-[15px] rounded-full hover:bg-[var(--accent-hover)] transition-all duration-300 shadow-sm"
              style={{ fontFamily: "var(--font-crimson), 'Crimson Pro', Georgia, serif" }}
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
                className="px-5 py-2 border border-[var(--border)] text-[15px] rounded-full hover:bg-[var(--surface-hover)] transition-all duration-300"
                style={{ fontFamily: "var(--font-crimson), 'Crimson Pro', Georgia, serif" }}
              >
                Cancel
              </button>
              <button
                onClick={submitEdit}
                disabled={saving || !hasDiff}
                className="px-5 py-2 bg-[var(--success)] text-white text-[15px] rounded-full hover:bg-[#3d6949] disabled:opacity-40 transition-all duration-300 shadow-sm"
                style={{ fontFamily: "var(--font-crimson), 'Crimson Pro', Georgia, serif" }}
              >
                {saving ? "Saving..." : "Submit Edit"}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Paper title & meta */}
      <div className="mb-6">
        <h1 className="text-2xl leading-snug" style={{ fontFamily: "var(--font-playfair), 'Playfair Display', Georgia, serif", fontWeight: 600 }}>
          {paper.title}
        </h1>
        <div className="mt-3 flex items-center gap-3 flex-wrap">
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
          <span className="text-[var(--border)]">·</span>
          <TimeAgo date={paper.updatedAt} />
        </div>
      </div>

      {/* Tab bar for panels */}
      <div className="flex gap-1 mb-6 border-b border-[var(--border)]">
        {(["source", "comments", "edits"] as const).map((panel) => (
          <button
            key={panel}
            onClick={() => setActivePanel(panel)}
            className={`px-4 py-2.5 text-[15px] capitalize transition-all duration-300 border-b-2 ${
              activePanel === panel
                ? "border-[var(--accent)] text-[var(--accent)]"
                : "border-transparent text-[var(--muted)] hover:text-[var(--foreground)]"
            }`}
            style={{ fontFamily: "var(--font-crimson), 'Crimson Pro', Georgia, serif" }}
          >
            {panel}
            {panel === "comments" && ` (${paper.comments.length})`}
            {panel === "edits" && ` (${paper.edits.length})`}
          </button>
        ))}
      </div>

      {/* Source panel */}
      {activePanel === "source" && (
        <div className="grid grid-cols-1 gap-5">
          {editMode ? (
            <>
              {/* Edit description */}
              <input
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Describe your changes..."
                className="bg-[var(--surface)] border border-[var(--border)] rounded-xl px-4 py-3 text-[15px] outline-none focus:border-[var(--accent-muted)] transition-colors"
                style={{ fontFamily: "var(--font-crimson), 'Crimson Pro', Georgia, serif" }}
              />
              {/* Diff view */}
              {hasDiff && (
                <div className="border border-[var(--border)] rounded-2xl overflow-hidden shadow-sm">
                  <div className="px-4 py-3 bg-[var(--surface-warm)] border-b border-[var(--border)] text-[13px] text-[var(--muted)]" style={{ fontFamily: "var(--font-crimson), 'Crimson Pro', Georgia, serif" }}>
                    Changes Preview
                  </div>
                  <div className="p-4 text-[13px] max-h-48 overflow-auto bg-[var(--background-warm)]" style={{ fontFamily: "var(--font-mono), monospace" }}>
                    {editedLines.map((line, i) => {
                      const isNew = i >= originalLines.length || line !== originalLines[i];
                      const isRemoved = i < originalLines.length && line !== originalLines[i];
                      return (
                        <div key={i} className="flex">
                          <span className="w-10 text-right pr-3 text-[var(--muted)] select-none text-[12px]">
                            {i + 1}
                          </span>
                          <span
                            className={
                              isNew
                                ? "bg-[var(--success-light)] text-[var(--success)] flex-1 px-1 rounded"
                                : isRemoved
                                ? "bg-red-50 text-red-700 flex-1 px-1 rounded"
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
                className="w-full min-h-[500px] bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 text-[13px] leading-relaxed outline-none focus:border-[var(--accent-muted)] resize-y transition-colors"
                style={{ fontFamily: "var(--font-mono), monospace" }}
                spellCheck={false}
              />
            </>
          ) : (
            /* Read-only rendered view */
            <div className="border border-[var(--border)] rounded-2xl overflow-hidden shadow-sm">
              <div className="px-5 py-3 bg-[var(--surface-warm)] border-b border-[var(--border)] flex items-center justify-between">
                <span className="text-[13px] text-[var(--muted)]" style={{ fontFamily: "var(--font-crimson), 'Crimson Pro', Georgia, serif" }}>LaTeX Source</span>
                <span className="text-[12px] text-[var(--muted-soft)]" style={{ fontFamily: "var(--font-mono), monospace" }}>Click &quot;Edit Paper&quot; to modify</span>
              </div>
              <div className="p-5 text-[13px] leading-relaxed max-h-[600px] overflow-auto bg-[var(--background-warm)]" style={{ fontFamily: "var(--font-mono), monospace" }}>
                {paper.latexSource.split("\n").map((line, i) => (
                  <div key={i} className="flex hover:bg-[var(--surface)] group rounded">
                    <span className="w-10 text-right pr-4 text-[var(--muted-soft)] select-none text-[11px] pt-0.5">
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
        <div className="space-y-4">
          {paper.comments.map((comment) => (
            <div
              key={comment.id}
              className={`border rounded-2xl p-4 ${
                comment.resolved
                  ? "border-[var(--border)]/50 opacity-60"
                  : "border-[var(--border)] bg-[var(--surface)] shadow-sm"
              }`}
            >
              <div className="flex items-start gap-3">
                <Avatar
                  initials={comment.author.avatar || comment.author.name.charAt(0)}
                  name={comment.author.name}
                  size="sm"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[14px]" style={{ fontFamily: "var(--font-playfair), 'Playfair Display', Georgia, serif", fontWeight: 500 }}>{comment.author.name}</span>
                    {comment.lineNumber && (
                      <span className="text-[11px] text-[var(--muted)] bg-[var(--background-warm)] px-2 py-0.5 rounded-full" style={{ fontFamily: "var(--font-mono), monospace" }}>
                        Line {comment.lineNumber}
                      </span>
                    )}
                    <TimeAgo date={comment.createdAt} />
                  </div>
                  <p className="text-[15px] mt-2 leading-relaxed text-[var(--foreground-soft)]" style={{ fontFamily: "var(--font-crimson), 'Crimson Pro', Georgia, serif" }}>{comment.content}</p>
                </div>
              </div>
            </div>
          ))}

          {/* Add comment */}
          <div className="flex gap-3 pt-3">
            <input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") addComment();
              }}
              placeholder="Add a comment..."
              className="flex-1 bg-[var(--surface-warm)] border border-[var(--border)] rounded-full px-5 py-2.5 text-[15px] outline-none focus:border-[var(--accent-muted)] transition-colors"
              style={{ fontFamily: "var(--font-crimson), 'Crimson Pro', Georgia, serif" }}
            />
            <button
              onClick={addComment}
              className="px-5 py-2.5 bg-[var(--accent)] text-white text-[15px] rounded-full hover:bg-[var(--accent-hover)] transition-all duration-300"
              style={{ fontFamily: "var(--font-crimson), 'Crimson Pro', Georgia, serif" }}
            >
              Comment
            </button>
          </div>
        </div>
      )}

      {/* Edits panel */}
      {activePanel === "edits" && (
        <div className="space-y-4">
          {paper.edits.length === 0 ? (
            <p className="text-[15px] text-[var(--muted)] text-center py-12" style={{ fontFamily: "var(--font-crimson), 'Crimson Pro', Georgia, serif", fontStyle: "italic" }}>
              No edits yet. Click &quot;Edit Paper&quot; to suggest changes.
            </p>
          ) : (
            paper.edits.map((edit) => (
              <div
                key={edit.id}
                className="border border-[var(--border)] rounded-2xl overflow-hidden bg-[var(--surface)] shadow-sm"
              >
                <div className="px-4 py-3 flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface-warm)]">
                  <div className="flex items-center gap-3">
                    <Avatar
                      initials={edit.author.avatar || edit.author.name.charAt(0)}
                      name={edit.author.name}
                      size="sm"
                    />
                    <span className="text-[14px]" style={{ fontFamily: "var(--font-playfair), 'Playfair Display', Georgia, serif", fontWeight: 500 }}>{edit.author.name}</span>
                    <TimeAgo date={edit.createdAt} />
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-[11px] font-medium uppercase tracking-wide ${
                      edit.status === "accepted"
                        ? "bg-[var(--success-light)] text-[var(--success)]"
                        : edit.status === "rejected"
                        ? "bg-red-50 text-red-700"
                        : "bg-[var(--warning-light)] text-amber-800"
                    }`}
                    style={{ fontFamily: "var(--font-mono), monospace" }}
                  >
                    {edit.status}
                  </span>
                </div>
                {edit.description && (
                  <div className="px-4 py-3 text-[14px] text-[var(--muted)] border-b border-[var(--border)]" style={{ fontFamily: "var(--font-crimson), 'Crimson Pro', Georgia, serif", fontStyle: "italic" }}>
                    {edit.description}
                  </div>
                )}
                <div className="p-4 text-[12px] max-h-48 overflow-auto bg-[var(--background-warm)]" style={{ fontFamily: "var(--font-mono), monospace" }}>
                  <div className="text-red-600/70 line-through">
                    {edit.oldContent.substring(0, 200)}...
                  </div>
                  <div className="text-[var(--success)] mt-2">
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

// Simple LaTeX syntax highlighting with elegant colors
function renderLatexLine(line: string) {
  if (line.startsWith("\\section") || line.startsWith("\\subsection") || line.startsWith("\\title")) {
    return <span className="text-[var(--accent)] font-medium">{line}</span>;
  }
  if (line.startsWith("\\begin") || line.startsWith("\\end")) {
    return <span className="text-[#7a5a8c]">{line}</span>;
  }
  if (line.startsWith("\\item") || line.startsWith("\\textbf")) {
    return <span className="text-[var(--success)]">{line}</span>;
  }
  if (line.startsWith("%")) {
    return <span className="text-[var(--muted-soft)] italic">{line}</span>;
  }
  if (line.startsWith("\\")) {
    return <span className="text-[var(--info)]">{line}</span>;
  }
  return <>{line}</>;
}
