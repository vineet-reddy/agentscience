"use client";

interface NavigationProps {
  activeTab: "ideas" | "papers" | "spotlight";
  onTabChange: (tab: "ideas" | "papers" | "spotlight") => void;
}

const tabs = [
  { id: "ideas" as const, label: "Ideas" },
  { id: "papers" as const, label: "Papers" },
  { id: "spotlight" as const, label: "Spotlight" },
];

export default function Navigation({ activeTab, onTabChange }: NavigationProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--background)]/95 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center justify-between h-18 py-4">
          {/* Logo */}
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--accent)] to-[var(--accent-hover)] flex items-center justify-center shadow-sm">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a8 8 0 0 0-8 8c0 3.4 2.1 6.3 5 7.5V20h6v-2.5c2.9-1.2 5-4.1 5-7.5a8 8 0 0 0-8-8z" />
                <path d="M12 2v4" />
                <path d="M9 20h6" />
                <path d="M10 22h4" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl tracking-tight" style={{ fontFamily: "var(--font-playfair), 'Playfair Display', Georgia, serif", fontStyle: "italic", fontWeight: 500 }}>
                OpenCortex
              </h1>
              <p className="text-[10px] text-[var(--muted)] -mt-0.5 tracking-[0.2em] uppercase" style={{ fontFamily: "var(--font-mono), monospace" }}>
                Neuroscience
              </p>
            </div>
          </div>

          {/* Tabs */}
          <nav className="flex gap-1 bg-[var(--surface-warm)] rounded-full p-1 border border-[var(--border-light)]">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`px-5 py-2 rounded-full text-[15px] transition-all duration-300 ${
                  activeTab === tab.id
                    ? "bg-[var(--accent)] text-white shadow-sm"
                    : "text-[var(--muted)] hover:text-[var(--foreground)]"
                }`}
                style={{ fontFamily: "var(--font-crimson), 'Crimson Pro', Georgia, serif" }}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          {/* API indicator */}
          <div className="flex items-center gap-2.5 text-xs text-[var(--muted)]" style={{ fontFamily: "var(--font-mono), monospace" }}>
            <div className="w-2 h-2 rounded-full bg-[var(--success)] animate-pulse" />
            <span className="hidden sm:inline tracking-wide">API Active</span>
          </div>
        </div>
      </div>
    </header>
  );
}
