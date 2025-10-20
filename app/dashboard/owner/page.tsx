"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, PiggyBank, TrendingUp, Wallet } from "lucide-react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { fetchBusesByOwner, fetchEarningsForOwner, fetchRouteById } from "@/lib/firebase/firestore";
import type { Bus, OwnerEarning, Route } from "@/types/firestore";

interface BusWithRoute extends Bus {
  routeInfo?: Route | null;
}

export default function OwnerDashboardPage() {
  const { user } = useAuth();
  const [buses, setBuses] = useState<BusWithRoute[]>([]);
  const [earnings, setEarnings] = useState<OwnerEarning[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setLoading(true);
      try {
        const busesData = await fetchBusesByOwner(user.uid);
        const enriched = await Promise.all(
          busesData.map(async (bus) => ({
            ...bus,
            routeInfo: bus.routeId ? await fetchRouteById(bus.routeId) : null,
          }))
        );
        setBuses(enriched);
        const earningData = await fetchEarningsForOwner(user.uid);
        setEarnings(earningData);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [user]);

  const totalEarnings = useMemo(() => earnings.reduce((sum, e) => sum + e.amount, 0), [earnings]);
  const totalTrips = useMemo(() => earnings.length, [earnings]);

  return (
    <ProtectedRoute allowedRoles={["owner"]}>
      <div className="space-y-6">
        <section className="rounded-2xl border border-white/10 bg-slate-900/60 p-6">
          <h1 className="text-2xl font-semibold text-white">Owner dashboard</h1>
          <p className="mt-2 text-sm text-slate-300">Track revenue share per ride and overall performance of your buses.</p>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <StatCard icon={<TrendingUp className="h-6 w-6" />} label="Total trips (paid)" value={totalTrips.toString()} />
          <StatCard icon={<PiggyBank className="h-6 w-6" />} label="Total earnings" value={`රු ${totalEarnings.toLocaleString("si-LK")}`} />
          <StatCard icon={<Wallet className="h-6 w-6" />} label="Buses managed" value={buses.length.toString()} />
        </section>

        <section className="rounded-2xl border border-white/10 bg-slate-900/60 p-6">
          <h2 className="text-xl font-semibold text-white">Earnings by ride</h2>
          {loading ? (
            <div className="flex items-center gap-3 py-10 text-slate-300"><Loader2 className="h-5 w-5 animate-spin" /> Loading earnings...</div>
          ) : earnings.length === 0 ? (
            <p className="mt-3 text-sm text-slate-300">No paid rides recorded yet.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {earnings.map((e) => (
                <div key={e.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-slate-200">
                  <div className="flex flex-col">
                    <span className="font-semibold">{e.route ?? "Route"}</span>
                    <span className="text-xs text-slate-400">{e.travelDate ? new Date(e.travelDate).toLocaleDateString("en-LK") : "Date not set"} • Seats {e.seatCount}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-400">Gross fare: රු {e.grossFare.toLocaleString("si-LK")}</p>
                    <p className="font-semibold text-yellow-200">Your share ({e.percentage}%): රු {e.amount.toLocaleString("si-LK")}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </ProtectedRoute>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 text-white">
      <div className="flex items-center justify-between">
        <span className="text-yellow-300">{icon}</span>
        <span className="text-2xl font-semibold">{value}</span>
      </div>
      <p className="mt-3 text-sm text-slate-300">{label}</p>
    </div>
  );
}
