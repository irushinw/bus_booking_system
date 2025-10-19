"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Loader2, PlusCircle, Trash2 } from "lucide-react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import {
  createOrUpdateBus,
  createOrUpdateRoute,
  deleteBus,
  deleteRoute,
  fetchAllBuses,
  fetchRoutes,
  fetchUsersByRole,
} from "@/lib/firebase/firestore";
import type { Bus, Route, UserProfile } from "@/types/firestore";

interface RouteFormState {
  start: string;
  end: string;
  fare: string;
  stops: string;
}

interface BusFormState {
  routeId: string;
  driverId: string;
  ownerId: string;
  seats: string;
  licenseInfo: string;
}

export default function AdminDashboardPage() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [buses, setBuses] = useState<Bus[]>([]);
  const [drivers, setDrivers] = useState<UserProfile[]>([]);
  const [owners, setOwners] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [routeForm, setRouteForm] = useState<RouteFormState>({ start: "", end: "", fare: "", stops: "" });
  const [busForm, setBusForm] = useState<BusFormState>({ routeId: "", driverId: "", ownerId: "", seats: "", licenseInfo: "" });
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [routeData, busData, driverData, ownerData] = await Promise.all([
          fetchRoutes(),
          fetchAllBuses(),
          fetchUsersByRole("driver"),
          fetchUsersByRole("owner"),
        ]);
        setRoutes(routeData);
        setBuses(busData);
        setDrivers(driverData);
        setOwners(ownerData);
      } catch (error) {
        console.error("Failed to load admin dashboard", error);
      } finally {
        setLoading(false);
      }
    };

    void loadData();
  }, []);

  const handleRouteSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!routeForm.start || !routeForm.end || !routeForm.fare) {
      setMessage("Please complete all mandatory route fields.");
      return;
    }
    try {
      setSaving(true);
      await createOrUpdateRoute(null, {
        start: routeForm.start,
        end: routeForm.end,
        fare: Number(routeForm.fare),
        stops: routeForm.stops.split(",").map((stop) => stop.trim()).filter(Boolean),
      });
      setRouteForm({ start: "", end: "", fare: "", stops: "" });
      setRoutes(await fetchRoutes());
      setMessage("Route added successfully.");
    } catch (error) {
      console.error("Failed to add route", error);
      setMessage("Could not add route. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleBusSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!busForm.routeId || !busForm.driverId || !busForm.ownerId || !busForm.seats) {
      setMessage("Please complete all bus fields.");
      return;
    }
    try {
      setSaving(true);
      const selectedRoute = routes.find((route) => route.id === busForm.routeId);
      await createOrUpdateBus(null, {
        routeId: busForm.routeId,
        route: selectedRoute ? `${selectedRoute.start} → ${selectedRoute.end}` : undefined,
        driverId: busForm.driverId,
        ownerId: busForm.ownerId,
        seats: Number(busForm.seats),
        licenseInfo: busForm.licenseInfo,
      });
      setBusForm({ routeId: "", driverId: "", ownerId: "", seats: "", licenseInfo: "" });
      setBuses(await fetchAllBuses());
      setMessage("Bus added successfully.");
    } catch (error) {
      console.error("Failed to add bus", error);
      setMessage("Could not add bus. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRoute = async (routeId: string) => {
    try {
      await deleteRoute(routeId);
      setRoutes((prev) => prev.filter((route) => route.id !== routeId));
    } catch (error) {
      console.error("Failed to delete route", error);
    }
  };

  const handleDeleteBus = async (busId: string) => {
    try {
      await deleteBus(busId);
      setBuses((prev) => prev.filter((bus) => bus.id !== busId));
    } catch (error) {
      console.error("Failed to delete bus", error);
    }
  };

  const totalSeats = useMemo(() => buses.reduce((sum, bus) => sum + (bus.seats ?? 0), 0), [buses]);

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div className="space-y-6">
        <section className="rounded-2xl border border-white/10 bg-slate-900/60 p-6">
          <h1 className="text-2xl font-semibold text-white">Admin control centre</h1>
          <p className="mt-2 text-sm text-slate-300">
            Manage national bus data including routes, fleet assignments, and user roles for drivers and vehicle owners.
          </p>
          {message && <p className="mt-4 rounded-xl bg-yellow-400/20 px-4 py-2 text-xs text-yellow-100">{message}</p>}
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <AdminStat label="Routes" value={routes.length.toString()} />
          <AdminStat label="Registered buses" value={buses.length.toString()} />
          <AdminStat label="Total seats" value={totalSeats.toString()} />
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <form onSubmit={handleRouteSubmit} className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 text-sm text-white">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <PlusCircle className="h-5 w-5 text-yellow-300" /> Add route
            </h2>
            <div className="mt-4 grid gap-3">
              <label className="flex flex-col gap-1">
                Origin
                <input
                  value={routeForm.start}
                  onChange={(event) => setRouteForm((prev) => ({ ...prev, start: event.target.value }))}
                  className="rounded-lg border border-white/10 bg-slate-950/80 px-3 py-2"
                  placeholder="Colombo"
                  required
                />
              </label>
              <label className="flex flex-col gap-1">
                Destination
                <input
                  value={routeForm.end}
                  onChange={(event) => setRouteForm((prev) => ({ ...prev, end: event.target.value }))}
                  className="rounded-lg border border-white/10 bg-slate-950/80 px-3 py-2"
                  placeholder="Jaffna"
                  required
                />
              </label>
              <label className="flex flex-col gap-1">
                Fare (රු)
                <input
                  value={routeForm.fare}
                  onChange={(event) => setRouteForm((prev) => ({ ...prev, fare: event.target.value }))}
                  type="number"
                  min="0"
                  step="10"
                  className="rounded-lg border border-white/10 bg-slate-950/80 px-3 py-2"
                  required
                />
              </label>
              <label className="flex flex-col gap-1">
                Stops (comma separated)
                <textarea
                  value={routeForm.stops}
                  onChange={(event) => setRouteForm((prev) => ({ ...prev, stops: event.target.value }))}
                  rows={3}
                  className="rounded-lg border border-white/10 bg-slate-950/80 px-3 py-2"
                  placeholder="Negombo, Chilaw, Puttalam"
                />
              </label>
            </div>
            <button
              type="submit"
              disabled={saving}
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-yellow-400 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-yellow-300 disabled:cursor-not-allowed"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save route"}
            </button>
          </form>

          <form onSubmit={handleBusSubmit} className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 text-sm text-white">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <PlusCircle className="h-5 w-5 text-yellow-300" /> Add bus
            </h2>
            <div className="mt-4 grid gap-3">
              <label className="flex flex-col gap-1">
                Route
                <select
                  value={busForm.routeId}
                  onChange={(event) => setBusForm((prev) => ({ ...prev, routeId: event.target.value }))}
                  className="rounded-lg border border-white/10 bg-slate-950/80 px-3 py-2"
                  required
                >
                  <option value="">Select route</option>
                  {routes.map((route) => (
                    <option key={route.id} value={route.id}>
                      {route.start} → {route.end}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1">
                Driver
                <select
                  value={busForm.driverId}
                  onChange={(event) => setBusForm((prev) => ({ ...prev, driverId: event.target.value }))}
                  className="rounded-lg border border-white/10 bg-slate-950/80 px-3 py-2"
                  required
                >
                  <option value="">Assign driver</option>
                  {drivers.map((driver) => (
                    <option key={driver.id} value={driver.id}>
                      {driver.displayName ?? driver.email}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1">
                Owner
                <select
                  value={busForm.ownerId}
                  onChange={(event) => setBusForm((prev) => ({ ...prev, ownerId: event.target.value }))}
                  className="rounded-lg border border-white/10 bg-slate-950/80 px-3 py-2"
                  required
                >
                  <option value="">Assign owner</option>
                  {owners.map((owner) => (
                    <option key={owner.id} value={owner.id}>
                      {owner.displayName ?? owner.email}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1">
                Seats
                <input
                  value={busForm.seats}
                  onChange={(event) => setBusForm((prev) => ({ ...prev, seats: event.target.value }))}
                  type="number"
                  min="20"
                  max="60"
                  className="rounded-lg border border-white/10 bg-slate-950/80 px-3 py-2"
                  required
                />
              </label>
              <label className="flex flex-col gap-1">
                License / insurance info
                <textarea
                  value={busForm.licenseInfo}
                  onChange={(event) => setBusForm((prev) => ({ ...prev, licenseInfo: event.target.value }))}
                  rows={3}
                  className="rounded-lg border border-white/10 bg-slate-950/80 px-3 py-2"
                  placeholder="License plate, insurance expiry, etc."
                />
              </label>
            </div>
            <button
              type="submit"
              disabled={saving}
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-yellow-400 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-yellow-300 disabled:cursor-not-allowed"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save bus"}
            </button>
          </form>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 text-sm text-white">
            <h2 className="text-lg font-semibold">Routes</h2>
            <div className="mt-4 space-y-3">
              {routes.map((route) => (
                <div key={route.id} className="flex items-center justify-between rounded-lg border border-white/10 bg-slate-950/80 px-4 py-2">
                  <div>
                    <p className="font-semibold text-white">
                      {route.start} → {route.end}
                    </p>
                    <p className="text-xs text-slate-400">Fare: රු {route.fare.toLocaleString("si-LK")}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteRoute(route.id)}
                    className="rounded-full border border-red-500/60 p-2 text-red-200 hover:bg-red-500/20"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 text-sm text-white">
            <h2 className="text-lg font-semibold">Buses</h2>
            <div className="mt-4 space-y-3">
              {buses.map((bus) => (
                <div key={bus.id} className="flex items-center justify-between rounded-lg border border-white/10 bg-slate-950/80 px-4 py-2">
                  <div>
                    <p className="font-semibold text-white">Bus #{bus.id.slice(-6)} • Seats {bus.seats}</p>
                    <p className="text-xs text-slate-400">{bus.route ?? "Route pending"}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteBus(bus.id)}
                    className="rounded-full border border-red-500/60 p-2 text-red-200 hover:bg-red-500/20"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </ProtectedRoute>
  );
}

function AdminStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 text-white">
      <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  );
}
