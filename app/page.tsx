"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Bus, MapPin, Search, ShieldCheck, TicketCheck } from "lucide-react";
import { fetchRoutes } from "@/lib/firebase/firestore";
import type { Route } from "@/types/firestore";

export default function HomePage() {
  const router = useRouter();
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const loadRoutes = async () => {
      try {
        const data = await fetchRoutes();
        setRoutes(data);
      } catch (error) {
        console.error("Failed to load routes", error);
      } finally {
        setLoading(false);
      }
    };

    void loadRoutes();
  }, []);

  const filteredRoutes = useMemo(() => {
    if (!searchTerm) return routes.slice(0, 6);
    const term = searchTerm.toLowerCase();
    return routes.filter((route) => {
      return (
        route.start.toLowerCase().includes(term) ||
        route.end.toLowerCase().includes(term) ||
        (route.stops ?? []).some((stop) => stop.toLowerCase().includes(term)) ||
        route.id.toLowerCase().includes(term)
      );
    });
  }, [routes, searchTerm]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-10 left-1/4 h-64 w-64 rounded-full bg-yellow-500/20 blur-3xl" />
          <div className="absolute bottom-10 right-1/5 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" />
        </div>
        <div className="mx-auto flex min-h-[70vh] max-w-6xl flex-col items-center justify-center gap-10 px-4 py-20 text-center">
          <div className="flex flex-col gap-6">
            <span className="mx-auto inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1 text-sm text-yellow-300">
              <Bus className="h-4 w-4" /> Smart travel across Sri Lanka
            </span>
            <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-6xl">
              Discover buses, book seats, and travel with confidence
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-slate-200/80">
              Plan your journey across the island with bilingual route search, seat availability,
              and secure ticket confirmations delivered straight to your phone.
            </p>
          </div>

          <div className="w-full max-w-3xl rounded-2xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur">
            <h2 className="text-left text-lg font-semibold text-white">Search for a bus</h2>
            <div className="mt-3 flex flex-col gap-4 sm:flex-row">
              <label className="flex flex-1 items-center gap-3 rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-left text-sm text-slate-300 focus-within:border-yellow-400">
                <Search className="h-5 w-5 text-yellow-300" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Origin, destination, or route number"
                  className="flex-1 bg-transparent text-base text-white outline-none placeholder:text-slate-500"
                />
              </label>
              <button
                onClick={() => router.push("/routes" + (searchTerm ? `?q=${encodeURIComponent(searchTerm)}` : ""))}
                className="flex items-center justify-center gap-2 rounded-xl bg-yellow-400 px-5 py-3 text-base font-semibold text-slate-900 transition hover:bg-yellow-300"
              >
                Search buses
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-3 text-xs text-slate-400">
              සෙවුම් පටිති සින්හලෙන් හෝ ඉංග්‍රීසියෙන් භාවිතා කරන්න – Search in Sinhala or English.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-slate-950/80">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-2xl font-semibold text-white">Featured routes</h2>
              <p className="text-sm text-slate-400">
                Real-time availability sourced from Sri Lanka Transport Board operators
              </p>
            </div>
            <Link
              href="/routes"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm text-white transition hover:border-yellow-400 hover:text-yellow-300"
            >
              View all routes <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {loading && (
              <div className="col-span-full flex items-center justify-center py-10 text-slate-400">
                Loading routes...
              </div>
            )}

            {!loading && filteredRoutes.length === 0 && (
              <div className="col-span-full rounded-2xl border border-dashed border-white/10 bg-slate-900/60 p-8 text-center text-slate-300">
                No routes match your search yet. Try a different term or check again soon.
              </div>
            )}

            {filteredRoutes.map((route) => (
              <article
                key={route.id}
                className="group flex flex-col gap-4 rounded-2xl border border-white/10 bg-slate-900/60 p-6 transition hover:border-yellow-400/60 hover:bg-slate-900"
              >
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-xl font-semibold text-white">
                    {route.start} → {route.end}
                  </h3>
                  <span className="rounded-full bg-yellow-400/20 px-3 py-1 text-xs font-medium text-yellow-300">
                    රු {route.fare.toLocaleString("si-LK")}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-sm text-slate-300">
                  <MapPin className="h-4 w-4 text-yellow-300" />
                  <span>{route.stops?.slice(0, 4).join(" • ") ?? "Stops available soon"}</span>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-400">
                  <p>Route ID: {route.id}</p>
                  <Link
                    href={`/booking/${route.id}`}
                    className="inline-flex items-center gap-2 text-sm font-medium text-yellow-300 transition group-hover:text-yellow-200"
                  >
                    Book seats <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-white/10 bg-slate-900/60">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-16 md:grid-cols-3">
          <FeatureCard
            icon={<TicketCheck className="h-6 w-6" />}
            title="Instant e-tickets"
            description="Receive QR-coded confirmations via email and the passenger dashboard."
          />
          <FeatureCard
            icon={<ShieldCheck className="h-6 w-6" />}
            title="Verified operators"
            description="Licensed drivers and bus owners vetted by the National Transport Commission."
          />
          <FeatureCard
            icon={<Bus className="h-6 w-6" />}
            title="Island-wide coverage"
            description="Inter-city, coastal, and hill-country routes with Sinhala/English details."
          />
        </div>
      </section>
    </main>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-slate-950/80 p-6 text-white">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-400/20 text-yellow-300">
        {icon}
      </span>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-sm text-slate-300">{description}</p>
    </div>
  );
}
