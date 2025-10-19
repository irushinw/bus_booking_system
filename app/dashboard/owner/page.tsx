"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, PiggyBank, TrendingUp, Wrench } from "lucide-react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import {
  fetchBookingsForBus,
  fetchBusesByOwner,
  fetchRouteById,
  listenToAlerts,
} from "@/lib/firebase/firestore";
import type { Alert, Booking, Bus, Route } from "@/types/firestore";

interface BusWithData extends Bus {
  routeInfo?: Route | null;
  bookings: Booking[];
}

export default function OwnerDashboardPage() {
  const { user } = useAuth();
  const [buses, setBuses] = useState<BusWithData[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const loadData = async () => {
      setLoading(true);
      try {
        const busRecords = await fetchBusesByOwner(user.uid);
        const enriched = await Promise.all(
          busRecords.map(async (bus) => {
            const routeInfo = bus.routeId ? await fetchRouteById(bus.routeId) : null;
            const bookings = await fetchBookingsForBus(bus.id);
            return { ...bus, routeInfo, bookings };
          })
        );
        setBuses(enriched);
      } catch (error) {
        console.error("Failed to load owner dashboard", error);
      } finally {
        setLoading(false);
      }
    };

    void loadData();
  }, [user]);

  useEffect(() => {
    const unsubscribe = listenToAlerts((incomingAlerts) => {
      setAlerts(incomingAlerts);
    });
    return () => unsubscribe();
  }, []);

  const income = useMemo(() => {
    return buses.reduce((total, bus) => {
      const confirmed = bus.bookings.filter((booking) => booking.status === "confirmed");
      return total + confirmed.reduce((sum, booking) => sum + booking.fare, 0);
    }, 0);
  }, [buses]);

  const maintenanceNotices = useMemo(() => {
    return buses.map((bus) => {
      const totalTrips = bus.bookings.length;
      const dueService = totalTrips >= 20;
      return {
        bus,
        totalTrips,
        dueService,
        message: dueService
          ? "Schedule full service (20+ trips)."
          : "Regular inspection: coolant, tyres, brake fluid.",
      };
    });
  }, [buses]);

  const relevantAlerts = useMemo(() => {
    const driverIds = new Set(buses.map((bus) => bus.driverId));
    return alerts.filter((alert) => driverIds.has(alert.fromDriverId)).slice(0, 5);
  }, [alerts, buses]);

  return (
    <ProtectedRoute allowedRoles={["owner"]}>
      <div className="space-y-6">
        <section className="rounded-2xl border border-white/10 bg-slate-900/60 p-6">
          <h1 className="text-2xl font-semibold text-white">Owner dashboard</h1>
          <p className="mt-2 text-sm text-slate-300">
            Monitor fleet performance, keep track of revenue, and respond to alerts from drivers in the field.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <StatCard
            icon={<TrendingUp className="h-6 w-6" />}
            label="Active buses"
            value={loading ? "-" : buses.length.toString()}
          />
          <StatCard
            icon={<PiggyBank className="h-6 w-6" />}
            label="Income this month"
            value={`රු ${income.toLocaleString("si-LK")}`}
            helper="Based on confirmed bookings"
          />
          <StatCard
            icon={<Wrench className="h-6 w-6" />}
            label="Maintenance due"
            value={`${maintenanceNotices.filter((notice) => notice.dueService).length}`}
            helper="Trips ≥ 20 trigger servicing"
          />
        </section>

        <section className="rounded-2xl border border-white/10 bg-slate-900/60 p-6">
          <h2 className="text-xl font-semibold text-white">Fleet overview</h2>
          {loading ? (
            <div className="flex items-center gap-3 py-10 text-slate-300">
              <Loader2 className="h-5 w-5 animate-spin" /> Loading buses...
            </div>
          ) : buses.length === 0 ? (
            <div className="rounded-xl border border-dashed border-white/10 bg-slate-950/60 p-8 text-sm text-slate-300">
              No buses registered yet. Add buses via the admin console to start tracking performance.
            </div>
          ) : (
            <div className="mt-6 grid gap-4">
              {buses.map((bus) => (
                <div key={bus.id} className="rounded-xl border border-white/10 bg-slate-950/80 p-5 text-sm text-slate-200">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-white">Bus #{bus.id.slice(-6)}</h3>
                      <p className="text-slate-300">
                        {bus.routeInfo ? `${bus.routeInfo.start} → ${bus.routeInfo.end}` : "Route assignment pending"}
                      </p>
                      <p className="text-xs text-slate-400">Capacity: {bus.seats} seats</p>
                    </div>
                    <div className="text-right text-xs text-slate-400">
                      <p>{bus.bookings.filter((booking) => booking.status === "confirmed").length} confirmed passengers</p>
                      <p>Total fare: රු {bus.bookings.reduce((sum, booking) => sum + booking.fare, 0).toLocaleString("si-LK")}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-white/10 bg-slate-900/60 p-6">
          <h2 className="text-xl font-semibold text-white">Maintenance reminders</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {maintenanceNotices.map((notice) => (
              <div
                key={notice.bus.id}
                className={`rounded-xl border p-4 text-sm ${notice.dueService ? "border-yellow-400/60 bg-yellow-400/10 text-yellow-100" : "border-white/10 bg-slate-950/80 text-slate-200"}`}
              >
                <p className="font-semibold">Bus #{notice.bus.id.slice(-5)}</p>
                <p className="mt-2 text-xs">Trips recorded: {notice.totalTrips}</p>
                <p className="mt-2 text-xs">{notice.message}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-red-500/40 bg-red-500/10 p-6 text-red-100">
          <h2 className="text-lg font-semibold">Driver alerts</h2>
          {relevantAlerts.length === 0 ? (
            <p className="mt-2 text-sm">No active alerts from your drivers.</p>
          ) : (
            <ul className="mt-3 space-y-3 text-sm">
              {relevantAlerts.map((alert) => (
                <li key={alert.id} className="rounded-xl border border-red-500/40 bg-red-500/20 p-4">
                  <p className="font-semibold">Alert from driver {alert.fromDriverId.slice(-5)}</p>
                  <p className="mt-1 text-xs text-red-100/80">{alert.message}</p>
                  <p className="mt-1 text-[10px] uppercase tracking-wide text-red-100/60">
                    {alert.timestamp.toLocaleString("en-LK")}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </ProtectedRoute>
  );
}

function StatCard({
  icon,
  label,
  value,
  helper,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  helper?: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 text-white">
      <div className="flex items-center justify-between">
        <span className="text-yellow-300">{icon}</span>
        <span className="text-2xl font-semibold">{value}</span>
      </div>
      <p className="mt-3 text-sm text-slate-300">{label}</p>
      {helper && <p className="mt-1 text-xs text-slate-400">{helper}</p>}
    </div>
  );
}
