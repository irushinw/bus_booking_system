"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Filter, MapPin, RefreshCcw, Search } from "lucide-react";
import { fetchRoutes } from "@/lib/firebase/firestore";
import type { Route } from "@/types/firestore";

export default function RoutesPage() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");

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

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const q = params.get("q");
    if (q) {
      setSearch(q);
    }
  }, []);

  const filteredRoutes = useMemo(() => {
    return routes.filter((route) => {
      const matchesSearch = search
        ? route.start.toLowerCase().includes(search.toLowerCase()) ||
          route.end.toLowerCase().includes(search.toLowerCase()) ||
          route.id.toLowerCase().includes(search.toLowerCase())
        : true;
      const matchesOrigin = origin
        ? route.start.toLowerCase().includes(origin.toLowerCase())
        : true;
      const matchesDestination = destination
        ? route.end.toLowerCase().includes(destination.toLowerCase())
        : true;
      return matchesSearch && matchesOrigin && matchesDestination;
    });
  }, [routes, search, origin, destination]);

  const uniqueStarts = useMemo(() => [...new Set(routes.map((route) => route.start))], [routes]);
  const uniqueEnds = useMemo(() => [...new Set(routes.map((route) => route.end))], [routes]);

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="border-b border-white/10 bg-slate-900/70 py-10">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4">
          <div>
            <h1 className="text-3xl font-bold">Sri Lanka bus routes</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-300">
              Browse intercity and provincial services. Use filters to discover buses by origin (පිටත් වීම), destination
              (ගමනාගමනය), or by the assigned route number.
            </p>
          </div>

          <div className="grid gap-4 rounded-2xl border border-white/10 bg-slate-950/80 p-6 shadow-lg lg:grid-cols-[2fr,1fr,1fr,auto]">
            <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-slate-300 focus-within:border-yellow-400">
              <Search className="h-5 w-5 text-yellow-300" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by town, stop, or route"
                className="flex-1 bg-transparent text-white outline-none placeholder:text-slate-500"
              />
            </label>
            <select
              value={origin}
              onChange={(event) => setOrigin(event.target.value)}
              className="rounded-xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-slate-100 focus:border-yellow-400 focus:outline-none"
            >
              <option value="">Any origin</option>
              {uniqueStarts.map((start) => (
                <option key={start} value={start}>
                  {start}
                </option>
              ))}
            </select>
            <select
              value={destination}
              onChange={(event) => setDestination(event.target.value)}
              className="rounded-xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-slate-100 focus:border-yellow-400 focus:outline-none"
            >
              <option value="">Any destination</option>
              {uniqueEnds.map((end) => (
                <option key={end} value={end}>
                  {end}
                </option>
              ))}
            </select>
            <button
              onClick={() => {
                setSearch("");
                setOrigin("");
                setDestination("");
              }}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-sm text-slate-200 transition hover:border-yellow-400 hover:text-yellow-300"
            >
              <RefreshCcw className="h-4 w-4" /> Reset
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Filter className="h-4 w-4" />
          Showing {filteredRoutes.length} of {routes.length} routes
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {loading && (
            <div className="col-span-full flex items-center justify-center rounded-2xl border border-white/10 bg-slate-900/60 p-12 text-slate-300">
              Loading timetable information...
            </div>
          )}

          {!loading && filteredRoutes.length === 0 && (
            <div className="col-span-full rounded-2xl border border-dashed border-white/10 bg-slate-900/60 p-10 text-center text-slate-300">
              No routes found. Try adjusting your filters or check with the Sri Lanka Transport Board hotline 1955.
            </div>
          )}

          {filteredRoutes.map((route) => (
            <article key={route.id} className="flex h-full flex-col justify-between gap-4 rounded-2xl border border-white/10 bg-slate-900/60 p-6 shadow-lg transition hover:border-yellow-400/60">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-white">
                    {route.start} → {route.end}
                  </h2>
                  <span className="rounded-full bg-yellow-400/20 px-3 py-1 text-xs font-medium text-yellow-300">Route {route.id}</span>
                </div>
                <p className="text-sm text-slate-300">
                  Estimated fare: රු {route.fare.toLocaleString("si-LK")}. Prices may change based on AC / semi-luxury options.
                </p>
                <div className="flex flex-wrap items-start gap-2 text-sm text-slate-400">
                  <MapPin className="mt-1 h-4 w-4 text-yellow-300" />
                  <span className="flex-1">{route.stops?.length ? route.stops.join(" • ") : "Stops to be updated"}</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <p className="text-slate-400">Seat reservations available online.</p>
                <Link
                  href={`/booking/${route.id}`}
                  className="inline-flex items-center gap-2 rounded-full bg-yellow-400 px-4 py-2 font-semibold text-slate-900 transition hover:bg-yellow-300"
                >
                  Book now <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
