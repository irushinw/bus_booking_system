"use client";

import { LiveBusTracker } from "@/components/tracking/LiveBusTracker";

export default function TrackPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <main className="mx-auto max-w-6xl px-4 py-8">
        <LiveBusTracker />
      </main>
    </div>
  );
}
