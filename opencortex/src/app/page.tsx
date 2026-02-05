"use client";

import { useState } from "react";
import Navigation from "@/components/Navigation";
import IdeasFeed from "@/components/IdeasFeed";
import PapersFeed from "@/components/PapersFeed";
import Spotlight from "@/components/Spotlight";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"ideas" | "papers" | "spotlight">(
    "ideas"
  );

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="max-w-6xl mx-auto px-6 py-8">
        {activeTab === "ideas" && <IdeasFeed />}
        {activeTab === "papers" && <PapersFeed />}
        {activeTab === "spotlight" && <Spotlight />}
      </main>
    </div>
  );
}
