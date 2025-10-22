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
