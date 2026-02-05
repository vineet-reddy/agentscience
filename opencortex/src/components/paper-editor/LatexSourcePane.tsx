"use client";

import { useRef, useEffect, useCallback } from "react";

interface LatexSourcePaneProps {
  latex: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
}

export function LatexSourcePane({ latex, onChange, readOnly }: LatexSourcePaneProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);
  const lines = latex.split("\n");

  // Sync gutter scroll with textarea
  const handleScroll = useCallback(() => {
    if (textareaRef.current && gutterRef.current) {
      gutterRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  }, []);

  useEffect(() => {
    const ta = textareaRef.current;
    if (ta) {
      ta.addEventListener("scroll", handleScroll);
      return () => ta.removeEventListener("scroll", handleScroll);
    }
  }, [handleScroll]);

  return (
    <div className="flex h-full bg-[var(--background-warm)] relative">
      {/* Line numbers gutter */}
      <div
        ref={gutterRef}
        className="flex-none w-12 overflow-hidden select-none pt-4 pb-4 text-right pr-3 border-r border-[var(--border)]/50"
        style={{ fontFamily: "var(--font-mono), monospace", fontSize: "13px", lineHeight: "1.6" }}
      >
        {lines.map((_, i) => (
          <div key={i} className="text-[var(--muted-soft)] text-[11px]">
            {i + 1}
          </div>
        ))}
      </div>

      {/* Syntax-highlighted underlay */}
      <div className="absolute left-12 top-0 right-0 bottom-0 pointer-events-none overflow-hidden pt-4 pb-4 pl-3 pr-4" aria-hidden>
        <div style={{ fontFamily: "var(--font-mono), monospace", fontSize: "13px", lineHeight: "1.6" }}>
          {lines.map((line, i) => (
            <div key={i} className="whitespace-pre-wrap">
              {highlightLine(line)}
            </div>
          ))}
        </div>
      </div>

      {/* Editable textarea (transparent text over highlighted underlay) */}
      <textarea
        ref={textareaRef}
        value={latex}
        onChange={(e) => onChange(e.target.value)}
        readOnly={readOnly}
        className="flex-1 bg-transparent text-transparent caret-[var(--foreground)] resize-none outline-none pt-4 pb-4 pl-3 pr-4 relative z-10"
        style={{
          fontFamily: "var(--font-mono), monospace",
          fontSize: "13px",
          lineHeight: "1.6",
        }}
        spellCheck={false}
        autoCorrect="off"
        autoCapitalize="off"
      />
    </div>
  );
}

function highlightLine(line: string): React.ReactNode {
  if (!line) return " ";

  // Comments
  if (line.trimStart().startsWith("%")) {
    return <span className="text-[var(--muted-soft)] italic">{line}</span>;
  }

  // Section commands
  if (/^\\(section|subsection|subsubsection|title)\b/.test(line)) {
    return <span className="text-[var(--accent)] font-medium">{line}</span>;
  }

  // Environment begin/end
  if (/^\\(begin|end)\{/.test(line)) {
    return <span className="text-[#7a5a8c]">{line}</span>;
  }

  // Items and text formatting
  if (/^\\(item|textbf|textit)\b/.test(line)) {
    return <span className="text-[var(--success)]">{line}</span>;
  }

  // Other commands
  if (line.trimStart().startsWith("\\")) {
    return <span className="text-[var(--info)]">{line}</span>;
  }

  return <span className="text-[var(--foreground)]">{line}</span>;
}
