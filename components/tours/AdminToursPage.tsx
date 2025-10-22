"use client";

import { FormEvent, useEffect, useState, useMemo } from "react";
import { Calendar, Clock, Loader2, MapPin, PlusCircle, Route, Trash2, Users, Bus, Edit3, Search, Filter } from "lucide-react";
import {
  createTour,
  deleteTour,
  fetchTours,
  fetchRoutes,
  fetchAllBuses,
  fetchUsersByRole,
  createDriverNotification,
  updateTour,
} from "@/lib/firebase/firestore";
import type { Tour, Route as RouteType, Bus as BusType, UserProfile } from "@/types/firestore";

interface TourFormState {
  routeId: string;
  busId: string;
  driverId: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  isWeekly: boolean;
}

interface SearchFilters {
  routeId: string;
  driverId: string;
  status: string;
  dateFrom: string;
  dateTo: string;
  search: string;
}

export default function AdminToursPage() {
  const [tours, setTours] = useState<(Tour & { route?: RouteType; bus?: BusType; driver?: UserProfile })[]>([]);
  const [filteredTours, setFilteredTours] = useState<(Tour & { route?: RouteType; bus?: BusType; driver?: UserProfile })[]>([]);
  const [routes, setRoutes] = useState<RouteType[]>([]);
  const [buses, setBuses] = useState<BusType[]>([]);
  const [drivers, setDrivers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"tours" | "customize">("tours");
  const [editingTour, setEditingTour] = useState<string | null>(null);
  const [selectedTour, setSelectedTour] = useState<(Tour & { route?: RouteType; bus?: BusType; driver?: UserProfile }) | null>(null);
  
  const [tourForm, setTourForm] = useState<TourFormState>({
    routeId: "",
    busId: "",
    driverId: "",
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
    isWeekly: false,
  });

  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    routeId: "",
    driverId: "",
    status: "",
    dateFrom: "",
    dateTo: "",
    search: "",
  });

  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [tourData, routeData, busData, driverData] = await Promise.all([
          fetchTours(),
          fetchRoutes(),
          fetchAllBuses(),
          fetchUsersByRole("driver"),
        ]);

        // Enrich tours with route, bus, and driver data
        const enrichedTours = tourData.map((tour) => ({
          ...tour,
          route: routeData.find((r) => r.id === tour.routeId),
          bus: busData.find((b) => b.id === tour.busId),
          driver: driverData.find((d) => d.id === tour.driverId),
        }));

        setTours(enrichedTours);
        setFilteredTours(enrichedTours);
        setRoutes(routeData);
        setBuses(busData);
        setDrivers(driverData);
      } catch (error) {
        console.error("Failed to load tours data", error);
      } finally {
        setLoading(false);
      }
    };

    void loadData();
  }, []);

  // Filter tours based on search criteria
  useEffect(() => {
    let filtered = tours;

    if (searchFilters.search) {
      filtered = filtered.filter(tour => 
        tour.route?.start.toLowerCase().includes(searchFilters.search.toLowerCase()) ||
        tour.route?.end.toLowerCase().includes(searchFilters.search.toLowerCase()) ||
        tour.driver?.displayName?.toLowerCase().includes(searchFilters.search.toLowerCase()) ||
        tour.id.toLowerCase().includes(searchFilters.search.toLowerCase())
      );
    }

    if (searchFilters.routeId) {
      filtered = filtered.filter(tour => tour.routeId === searchFilters.routeId);
    }

    if (searchFilters.driverId) {
      filtered = filtered.filter(tour => tour.driverId === searchFilters.driverId);
    }

    if (searchFilters.status) {
      filtered = filtered.filter(tour => tour.status === searchFilters.status);
    }

    if (searchFilters.dateFrom) {
      const fromDate = new Date(searchFilters.dateFrom);
      filtered = filtered.filter(tour => new Date(tour.startDateTime) >= fromDate);
    }

    if (searchFilters.dateTo) {
      const toDate = new Date(searchFilters.dateTo);
      toDate.setHours(23, 59, 59); // End of day
      filtered = filtered.filter(tour => new Date(tour.startDateTime) <= toDate);
    }

    setFilteredTours(filtered);
  }, [tours, searchFilters]);

  const resetForm = () => {
    setTourForm({
      routeId: "",
      busId: "",
      driverId: "",
      startDate: "",
      startTime: "",
      endDate: "",
      endTime: "",
      isWeekly: false,
    });
    setEditingTour(null);
  };

  const populateFormFromTour = (tour: Tour & { route?: RouteType; bus?: BusType; driver?: UserProfile }) => {
    setTourForm({
      routeId: tour.routeId,
      busId: tour.busId,
      driverId: tour.driverId,
      startDate: tour.startDateTime.toISOString().split('T')[0],
      startTime: tour.startDateTime.toTimeString().slice(0, 5),
      endDate: tour.endDateTime.toISOString().split('T')[0],
      endTime: tour.endDateTime.toTimeString().slice(0, 5),
      isWeekly: tour.isWeekly,
    });
  };

  const handleTourSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    if (!tourForm.routeId || !tourForm.busId || !tourForm.driverId || !tourForm.startDate || !tourForm.startTime || !tourForm.endDate || !tourForm.endTime) {
      setMessage("Please complete all mandatory tour fields.");
      return;
    }

    try {
      setSaving(true);
      
      // Combine date and time
      const startDateTime = new Date(`${tourForm.startDate}T${tourForm.startTime}`);
      const endDateTime = new Date(`${tourForm.endDate}T${tourForm.endTime}`);

      // Validate dates
      if (startDateTime >= endDateTime) {
        setMessage("Departure time must be before arrival time.");
        return;
      }

      if (startDateTime < new Date() && !editingTour) {
        setMessage("Departure time cannot be in the past.");
        return;
      }

      if (editingTour) {
        // Update existing tour
        await updateTour(editingTour, {
          routeId: tourForm.routeId,
          busId: tourForm.busId,
          driverId: tourForm.driverId,
          startDateTime,
          endDateTime,
          isWeekly: tourForm.isWeekly,
        });
        setMessage("Tour updated successfully!");
      } else {
        // Create new tour
        await createTour({
          routeId: tourForm.routeId,
          busId: tourForm.busId,
          driverId: tourForm.driverId,
          startDateTime,
          endDateTime,
          isWeekly: tourForm.isWeekly,
        });

        // Send notification to driver
        const route = routes.find(r => r.id === tourForm.routeId);
        await createDriverNotification({
          driverId: tourForm.driverId,
          tourId: "",
          type: "tour_assigned",
          title: "New Tour Assigned",
          message: `You have been assigned a new tour: ${route?.start} → ${route?.end} on ${startDateTime.toLocaleDateString()}`,
        });

        setMessage("Tour created successfully!");
      }

      resetForm();
      
      // Reload data
      const tourData = await fetchTours();
      const enrichedTours = tourData.map((tour) => ({
        ...tour,
        route: routes.find((r) => r.id === tour.routeId),
        bus: buses.find((b) => b.id === tour.busId),
        driver: drivers.find((d) => d.id === tour.driverId),
      }));
      setTours(enrichedTours);

    } catch (error) {
      console.error("Failed to save tour", error);
      setMessage("Failed to save tour. Please try again.");
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleEditTour = (tour: Tour & { route?: RouteType; bus?: BusType; driver?: UserProfile }) => {
    if (tour.status !== "scheduled") {
      setMessage("Only scheduled tours can be edited.");
      setTimeout(() => setMessage(null), 3000);
      return;
    }
    
    setEditingTour(tour.id);
    populateFormFromTour(tour);
    setActiveTab("tours");
  };

  const handleDeleteTour = async (tourId: string) => {
    if (!confirm("Are you sure you want to delete this tour?")) return;
    
    try {
      await deleteTour(tourId);
      setTours((prev) => prev.filter((tour) => tour.id !== tourId));
      setMessage("Tour deleted successfully.");
    } catch (error) {
      console.error("Failed to delete tour", error);
      setMessage("Failed to delete tour.");
    } finally {
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleSelectTourForCustomize = (tour: Tour & { route?: RouteType; bus?: BusType; driver?: UserProfile }) => {
    setSelectedTour(tour);
    populateFormFromTour(tour);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled": return "text-blue-400 bg-blue-400/10";
      case "started": return "text-green-400 bg-green-400/10";
      case "in-progress": return "text-yellow-400 bg-yellow-400/10";
      case "completed": return "text-gray-400 bg-gray-400/10";
      case "cancelled": return "text-red-400 bg-red-400/10";
      default: return "text-gray-400 bg-gray-400/10";
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-3 text-slate-300">
          <Loader2 className="h-6 w-6 animate-spin" />
          Loading tours data...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="space-y-6">
          <section className="rounded-2xl border border-white/10 bg-slate-900/60 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-semibold text-white">Tour Management</h1>
                <p className="mt-2 text-sm text-slate-300">
                  Create and manage bus tours. Assign routes, buses, and drivers to scheduled trips.
                </p>
              </div>
              
              <div className="flex rounded-lg bg-slate-950/80 p-1">
                <button
                  onClick={() => setActiveTab("tours")}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                    activeTab === "tours"
                      ? "bg-yellow-400 text-slate-900"
                      : "text-slate-300 hover:text-white"
                  }`}
                >
                  Tours
                </button>
                <button
                  onClick={() => setActiveTab("customize")}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                    activeTab === "customize"
                      ? "bg-yellow-400 text-slate-900"
                      : "text-slate-300 hover:text-white"
                  }`}
                >
                  Customize
                </button>
              </div>
            </div>
            
            {message && (
              <p className="mt-4 rounded-xl bg-yellow-400/20 px-4 py-2 text-xs text-yellow-100">
                {message}
              </p>
            )}
          </section>

          {activeTab === "tours" && (
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Create/Edit Tour Form */}
              <form onSubmit={handleTourSubmit} className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 text-sm text-white">
                <h2 className="flex items-center gap-2 text-lg font-semibold mb-4">
                  <PlusCircle className="h-5 w-5 text-yellow-300" /> 
                  {editingTour ? "Edit Tour" : "Create New Tour"}
                </h2>
                
                <div className="grid gap-3">
                  <label className="flex flex-col gap-1">
                    Route
                    <select
                      value={tourForm.routeId}
                      onChange={(e) => setTourForm(prev => ({ ...prev, routeId: e.target.value }))}
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
                    Bus
                    <select
                      value={tourForm.busId}
                      onChange={(e) => setTourForm(prev => ({ ...prev, busId: e.target.value }))}
                      className="rounded-lg border border-white/10 bg-slate-950/80 px-3 py-2"
                      required
                    >
                      <option value="">Select bus</option>
                      {buses.map((bus) => (
                        <option key={bus.id} value={bus.id}>
                          Bus #{bus.id.slice(-5)} ({bus.seats} seats)
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="flex flex-col gap-1">
                    Driver
                    <select
                      value={tourForm.driverId}
                      onChange={(e) => setTourForm(prev => ({ ...prev, driverId: e.target.value }))}
                      className="rounded-lg border border-white/10 bg-slate-950/80 px-3 py-2"
                      required
                    >
                      <option value="">Select driver</option>
                      {drivers.map((driver) => (
                        <option key={driver.id} value={driver.id}>
                          {driver.displayName ?? driver.email}
                        </option>
                      ))}
                    </select>
                  </label>

                  <div className="grid gap-3 md:grid-cols-2">
                    <label className="flex flex-col gap-1">
                      Departure Date
                      <input
                        type="date"
                        value={tourForm.startDate}
                        onChange={(e) => setTourForm(prev => ({ ...prev, startDate: e.target.value }))}
                        className="rounded-lg border border-white/10 bg-slate-950/80 px-3 py-2"
                        required
                      />
                    </label>

                    <label className="flex flex-col gap-1">
                      Departure Time
                      <input
                        type="time"
                        value={tourForm.startTime}
                        onChange={(e) => setTourForm(prev => ({ ...prev, startTime: e.target.value }))}
                        className="rounded-lg border border-white/10 bg-slate-950/80 px-3 py-2"
                        required
                      />
                    </label>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    <label className="flex flex-col gap-1">
                      Arrival Date
                      <input
                        type="date"
                        value={tourForm.endDate}
                        onChange={(e) => setTourForm(prev => ({ ...prev, endDate: e.target.value }))}
                        className="rounded-lg border border-white/10 bg-slate-950/80 px-3 py-2"
                        required
                      />
                    </label>

                    <label className="flex flex-col gap-1">
                      Arrival Time
                      <input
                        type="time"
                        value={tourForm.endTime}
                        onChange={(e) => setTourForm(prev => ({ ...prev, endTime: e.target.value }))}
                        className="rounded-lg border border-white/10 bg-slate-950/80 px-3 py-2"
                        required
                      />
                    </label>
                  </div>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={tourForm.isWeekly}
                      onChange={(e) => setTourForm(prev => ({ ...prev, isWeekly: e.target.checked }))}
                      className="rounded border border-white/10 bg-slate-950/80"
                    />
                    <span className="text-sm">Repeat weekly</span>
                  </label>
                </div>

                <div className="flex gap-2 mt-4">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-yellow-400 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-yellow-300 disabled:cursor-not-allowed"
                  >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : (editingTour ? "Update Tour" : "Create Tour")}
                  </button>
                  
                  {editingTour && (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-4 py-2 rounded-full border border-white/20 text-slate-300 hover:bg-slate-800 transition"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>

              {/* Current Tours */}
              <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 text-sm text-white">
                <h2 className="text-lg font-semibold mb-4">Current Tours</h2>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {tours.length === 0 ? (
                    <p className="text-slate-400">No tours created yet.</p>
                  ) : (
                    tours.map((tour) => (
                      <div key={tour.id} className="flex items-start justify-between rounded-lg border border-white/10 bg-slate-950/80 p-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Route className="h-4 w-4 text-yellow-300" />
                            <span className="font-medium text-white">
                              {tour.route?.start} → {tour.route?.end}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(tour.status)}`}>
                              {tour.status}
                            </span>
                          </div>
                          
                          <div className="space-y-1 text-xs text-slate-400">
                            <div className="flex items-center gap-2">
                              <Bus className="h-3 w-3" />
                              <span>Bus #{tour.bus?.id.slice(-5)} ({tour.bus?.seats} seats)</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Users className="h-3 w-3" />
                              <span>{tour.driver?.displayName ?? tour.driver?.email}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-3 w-3" />
                              <span>{tour.startDateTime.toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-3 w-3" />
                              <span>
                                {tour.startDateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                                {tour.endDateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            {tour.isWeekly && (
                              <div className="text-yellow-300">
                                📅 Repeats weekly
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex flex-col gap-1">
                          {tour.status === "scheduled" && (
                            <button
                              onClick={() => handleEditTour(tour)}
                              className="rounded-full border border-blue-500/60 p-2 text-blue-200 hover:bg-blue-500/20"
                              title="Edit Tour"
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteTour(tour.id)}
                            className="rounded-full border border-red-500/60 p-2 text-red-200 hover:bg-red-500/20"
                            title="Delete Tour"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "customize" && (
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Search and Filter Tours */}
              <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 text-sm text-white">
                <h2 className="flex items-center gap-2 text-lg font-semibold mb-4">
                  <Search className="h-5 w-5 text-yellow-300" /> 
                  Search Tours
                </h2>
                
                <div className="space-y-3 mb-4">
                  <input
                    type="text"
                    placeholder="Search tours..."
                    value={searchFilters.search}
                    onChange={(e) => setSearchFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="w-full rounded-lg border border-white/10 bg-slate-950/80 px-3 py-2"
                  />
                  
                  <div className="grid grid-cols-2 gap-3">
                    <select
                      value={searchFilters.routeId}
                      onChange={(e) => setSearchFilters(prev => ({ ...prev, routeId: e.target.value }))}
                      className="rounded-lg border border-white/10 bg-slate-950/80 px-3 py-2"
                    >
                      <option value="">All routes</option>
                      {routes.map((route) => (
                        <option key={route.id} value={route.id}>
                          {route.start} → {route.end}
                        </option>
                      ))}
                    </select>

                    <select
                      value={searchFilters.driverId}
                      onChange={(e) => setSearchFilters(prev => ({ ...prev, driverId: e.target.value }))}
                      className="rounded-lg border border-white/10 bg-slate-950/80 px-3 py-2"
                    >
                      <option value="">All drivers</option>
                      {drivers.map((driver) => (
                        <option key={driver.id} value={driver.id}>
                          {driver.displayName ?? driver.email}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <select
                      value={searchFilters.status}
                      onChange={(e) => setSearchFilters(prev => ({ ...prev, status: e.target.value }))}
                      className="rounded-lg border border-white/10 bg-slate-950/80 px-3 py-2"
                    >
                      <option value="">All statuses</option>
                      <option value="scheduled">Scheduled</option>
                      <option value="started">Started</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>

                    <button
                      onClick={() => setSearchFilters({
                        routeId: "",
                        driverId: "",
                        status: "",
                        dateFrom: "",
                        dateTo: "",
                        search: "",
                      })}
                      className="rounded-lg border border-white/10 px-3 py-2 hover:bg-slate-800 transition"
                    >
                      Clear Filters
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="date"
                      placeholder="From date"
                      value={searchFilters.dateFrom}
                      onChange={(e) => setSearchFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                      className="rounded-lg border border-white/10 bg-slate-950/80 px-3 py-2"
                    />
                    <input
                      type="date"
                      placeholder="To date"
                      value={searchFilters.dateTo}
                      onChange={(e) => setSearchFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                      className="rounded-lg border border-white/10 bg-slate-950/80 px-3 py-2"
                    />
                  </div>
                </div>

                <div className="space-y-2 max-h-96 overflow-y-auto">
                  <p className="text-xs text-slate-400 mb-2">Found {filteredTours.length} tours</p>
                  {filteredTours.map((tour) => (
                    <div
                      key={tour.id}
                      onClick={() => handleSelectTourForCustomize(tour)}
                      className={`cursor-pointer rounded-lg border p-3 transition hover:bg-slate-800 ${
                        selectedTour?.id === tour.id 
                          ? "border-yellow-400/40 bg-yellow-400/10" 
                          : "border-white/10 bg-slate-950/50"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-white text-sm">
                          {tour.route?.start} → {tour.route?.end}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(tour.status)}`}>
                          {tour.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">
                        {tour.startDateTime.toLocaleDateString()} • {tour.driver?.displayName ?? tour.driver?.email}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tour Details Form */}
              <form onSubmit={handleTourSubmit} className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 text-sm text-white">
                <h2 className="flex items-center gap-2 text-lg font-semibold mb-4">
                  <PlusCircle className="h-5 w-5 text-yellow-300" /> 
                  Create from Template
                </h2>
                
                {selectedTour ? (
                  <div className="mb-4 p-3 rounded-lg bg-yellow-400/10 border border-yellow-400/20">
                    <p className="text-sm text-yellow-300">
                      📋 Template: {selectedTour.route?.start} → {selectedTour.route?.end} 
                      ({selectedTour.startDateTime.toLocaleDateString()})
                    </p>
                  </div>
                ) : (
                  <div className="mb-4 p-3 rounded-lg bg-slate-950/50 border border-white/10">
                    <p className="text-sm text-slate-400">
                      👈 Select a tour from the search results to use as template
                    </p>
                  </div>
                )}
                
                <div className="grid gap-3">
                  <label className="flex flex-col gap-1">
                    Route
                    <select
                      value={tourForm.routeId}
                      onChange={(e) => setTourForm(prev => ({ ...prev, routeId: e.target.value }))}
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
                    Bus
                    <select
                      value={tourForm.busId}
                      onChange={(e) => setTourForm(prev => ({ ...prev, busId: e.target.value }))}
                      className="rounded-lg border border-white/10 bg-slate-950/80 px-3 py-2"
                      required
                    >
                      <option value="">Select bus</option>
                      {buses.map((bus) => (
                        <option key={bus.id} value={bus.id}>
                          Bus #{bus.id.slice(-5)} ({bus.seats} seats)
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="flex flex-col gap-1">
                    Driver
                    <select
                      value={tourForm.driverId}
                      onChange={(e) => setTourForm(prev => ({ ...prev, driverId: e.target.value }))}
                      className="rounded-lg border border-white/10 bg-slate-950/80 px-3 py-2"
                      required
                    >
                      <option value="">Select driver</option>
                      {drivers.map((driver) => (
                        <option key={driver.id} value={driver.id}>
                          {driver.displayName ?? driver.email}
                        </option>
                      ))}
                    </select>
                  </label>

                  <div className="grid gap-3 md:grid-cols-2">
                    <label className="flex flex-col gap-1">
                      Departure Date
                      <input
                        type="date"
                        value={tourForm.startDate}
                        onChange={(e) => setTourForm(prev => ({ ...prev, startDate: e.target.value }))}
                        className="rounded-lg border border-white/10 bg-slate-950/80 px-3 py-2"
                        required
                      />
                    </label>

                    <label className="flex flex-col gap-1">
                      Departure Time
                      <input
                        type="time"
                        value={tourForm.startTime}
                        onChange={(e) => setTourForm(prev => ({ ...prev, startTime: e.target.value }))}
                        className="rounded-lg border border-white/10 bg-slate-950/80 px-3 py-2"
                        required
                      />
                    </label>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    <label className="flex flex-col gap-1">
                      Arrival Date
                      <input
                        type="date"
                        value={tourForm.endDate}
                        onChange={(e) => setTourForm(prev => ({ ...prev, endDate: e.target.value }))}
                        className="rounded-lg border border-white/10 bg-slate-950/80 px-3 py-2"
                        required
                      />
                    </label>

                    <label className="flex flex-col gap-1">
                      Arrival Time
                      <input
                        type="time"
                        value={tourForm.endTime}
                        onChange={(e) => setTourForm(prev => ({ ...prev, endTime: e.target.value }))}
                        className="rounded-lg border border-white/10 bg-slate-950/80 px-3 py-2"
                        required
                      />
                    </label>
                  </div>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={tourForm.isWeekly}
                      onChange={(e) => setTourForm(prev => ({ ...prev, isWeekly: e.target.checked }))}
                      className="rounded border border-white/10 bg-slate-950/80"
                    />
                    <span className="text-sm">Repeat weekly</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full mt-4 inline-flex items-center justify-center gap-2 rounded-full bg-yellow-400 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-yellow-300 disabled:cursor-not-allowed"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Tour from Template"}
                </button>
              </form>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
