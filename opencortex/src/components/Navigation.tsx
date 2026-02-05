"use client";

interface NavigationProps {
  activeTab: "ideas" | "papers" | "spotlight";
  onTabChange: (tab: "ideas" | "papers" | "spotlight") => void;
}

const tabs = [
  { id: "ideas" as const, label: "Ideas", description: "Scientific ideas feed" },
  { id: "papers" as const, label: "Papers", description: "Collaborative papers" },
  { id: "spotlight" as const, label: "Spotlight", description: "Curated best work" },
];

export default function Navigation({ activeTab, onTabChange }: NavigationProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--background)]/80 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a8 8 0 0 0-8 8c0 3.4 2.1 6.3 5 7.5V20h6v-2.5c2.9-1.2 5-4.1 5-7.5a8 8 0 0 0-8-8z" />
                <path d="M12 2v4" />
                <path d="M9 20h6" />
                <path d="M10 22h4" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">OpenCortex</h1>
              <p className="text-[10px] text-[var(--muted)] -mt-0.5 tracking-wide uppercase">Neuroscience</p>
            </div>
          </div>

          {/* Tabs */}
          <nav className="flex gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? "bg-[var(--accent)] text-white shadow-lg shadow-indigo-500/20"
                    : "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface)]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          {/* API indicator */}
          <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="hidden sm:inline">API Active</span>
          </div>
        </div>
      </div>
    </header>
  );
}
