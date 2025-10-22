"use client";

import { useEffect, useState } from "react";
import { Bell, Calendar, Clock, Loader2, MapPin, Play, CheckCircle, Users, Bus, Route } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  fetchToursByDriver,
  startTour,
  updateTourProgress,
  completeTour,
  fetchTourProgress,
  fetchDriverNotifications,
  markNotificationAsRead,
  fetchRouteById,
  fetchBusById,
} from "@/lib/firebase/firestore";
import type { Tour, Route as RouteType, Bus as BusType, TourProgress, DriverNotification } from "@/types/firestore";

export default function DriverToursPage() {
  const { user } = useAuth();
  const [tours, setTours] = useState<(Tour & { route?: RouteType; bus?: BusType })[]>([]);
  const [notifications, setNotifications] = useState<DriverNotification[]>([]);
  const [selectedTour, setSelectedTour] = useState<(Tour & { route?: RouteType; bus?: BusType }) | null>(null);
  const [tourProgress, setTourProgress] = useState<TourProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [startingTour, setStartingTour] = useState(false);

  useEffect(() => {
    if (!user?.uid) return;

    const loadData = async () => {
      setLoading(true);
      try {
        const [tourData, notificationData] = await Promise.all([
          fetchToursByDriver(user.uid),
          fetchDriverNotifications(user.uid),
        ]);

        // Enrich tours with route and bus data
        const enrichedTours = await Promise.all(
          tourData.map(async (tour) => {
            const [route, bus] = await Promise.all([
              fetchRouteById(tour.routeId),
              fetchBusById(tour.busId),
            ]);
            return { ...tour, route: route || undefined, bus: bus || undefined };
          })
        );

        setTours(enrichedTours);
        setNotifications(notificationData);
      } catch (error) {
        console.error("Failed to load driver tours", error);
      } finally {
        setLoading(false);
      }
    };

    void loadData();
  }, [user?.uid]);

  const handleStartTour = async (tour: Tour & { route?: RouteType; bus?: BusType }) => {
    try {
      setStartingTour(true);
      await startTour(tour.id);
      setSelectedTour(tour);
      
      // Update local state
      setTours(prev => 
        prev.map(t => 
          t.id === tour.id ? { ...t, status: "started" as const } : t
        )
      );
    } catch (error) {
      console.error("Failed to start tour", error);
    } finally {
      setStartingTour(false);
    }
  };

  const handleStopArrival = async (stopIndex: number, stopName: string) => {
    if (!selectedTour) return;

    try {
      await updateTourProgress(selectedTour.id, stopIndex, stopName);
      
      // Refresh progress
      const progress = await fetchTourProgress(selectedTour.id);
      setTourProgress(progress);

      // Update tour status
      setTours(prev =>
        prev.map(t =>
          t.id === selectedTour.id 
            ? { ...t, status: "in-progress" as const, currentStopIndex: stopIndex }
            : t
        )
      );

      // If this is the last stop, complete the tour
      if (selectedTour.route && stopIndex === selectedTour.route.stops.length - 1) {
        await completeTour(selectedTour.id);
        setTours(prev =>
          prev.map(t =>
            t.id === selectedTour.id ? { ...t, status: "completed" as const } : t
          )
        );
        setSelectedTour(null);
      }
    } catch (error) {
      console.error("Failed to update tour progress", error);
    }
  };

  const loadTourProgress = async (tour: Tour & { route?: RouteType; bus?: BusType }) => {
    setSelectedTour(tour);
    try {
      const progress = await fetchTourProgress(tour.id);
      setTourProgress(progress);
    } catch (error) {
      console.error("Failed to load tour progress", error);
    }
  };

  const handleNotificationClick = async (notification: DriverNotification) => {
    if (!notification.isRead) {
      await markNotificationAsRead(notification.id);
      setNotifications(prev => 
        prev.map(n => 
          n.id === notification.id ? { ...n, isRead: true } : n
        )
      );
    }
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

  const isStopCompleted = (stopIndex: number) => {
    return tourProgress.some(p => p.stopIndex === stopIndex);
  };

  const canStartTour = (tour: Tour) => {
    const now = new Date();
    const startTime = new Date(tour.startDateTime);
    const timeDiff = startTime.getTime() - now.getTime();
    const minutesDiff = timeDiff / (1000 * 60);
    
    // Can start 5 minutes before scheduled time
    return minutesDiff <= 5 && minutesDiff >= -30 && tour.status === "scheduled";
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-3 text-slate-300">
          <Loader2 className="h-6 w-6 animate-spin" />
          Loading your tours...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="space-y-6">
          <section className="rounded-2xl border border-white/10 bg-slate-900/60 p-6">
            <h1 className="text-2xl font-semibold text-white">My Tours</h1>
            <p className="mt-2 text-sm text-slate-300">
              View your assigned tours, start trips, and track your progress through bus stops.
            </p>
          </section>

          {/* Notifications */}
          {notifications.length > 0 && (
            <section className="rounded-2xl border border-yellow-400/20 bg-yellow-400/5 p-6">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-yellow-300">
                <Bell className="h-5 w-5" />
                Notifications
              </h2>
              <div className="mt-4 space-y-2">
                {notifications.slice(0, 3).map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`cursor-pointer rounded-lg border border-white/10 p-3 text-sm transition hover:bg-white/5 ${
                      !notification.isRead ? "bg-yellow-400/10" : "bg-slate-950/50"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-white">{notification.title}</p>
                        <p className="text-slate-300">{notification.message}</p>
                      </div>
                      {!notification.isRead && (
                        <div className="h-2 w-2 rounded-full bg-yellow-400"></div>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-slate-400">
                      {notification.createdAt.toLocaleDateString()} at{" "}
                      {notification.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Tours List */}
            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Your Tours</h2>
              
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {tours.length === 0 ? (
                  <p className="text-slate-400 text-center py-8">No tours assigned yet.</p>
                ) : (
                  tours.map((tour) => (
                    <div key={tour.id} className="rounded-lg border border-white/10 bg-slate-950/80 p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
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
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {canStartTour(tour) && (
                          <button
                            onClick={() => handleStartTour(tour)}
                            disabled={startingTour}
                            className="inline-flex items-center gap-2 rounded-full bg-green-500 px-3 py-1 text-xs font-semibold text-white transition hover:bg-green-400 disabled:cursor-not-allowed disabled:bg-green-500/60"
                          >
                            {startingTour ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Play className="h-3 w-3" />
                            )}
                            Start Tour
                          </button>
                        )}
                        
                        {(tour.status === "started" || tour.status === "in-progress") && (
                          <button
                            onClick={() => loadTourProgress(tour)}
                            className="inline-flex items-center gap-2 rounded-full bg-yellow-400 px-3 py-1 text-xs font-semibold text-slate-900 transition hover:bg-yellow-300"
                          >
                            <MapPin className="h-3 w-3" />
                            Track Progress
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Tour Progress Tracking */}
            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Tour Progress</h2>
              
              {selectedTour ? (
                <div>
                  <div className="mb-4 rounded-lg border border-white/10 bg-slate-950/80 p-4">
                    <h3 className="font-medium text-white mb-2">
                      {selectedTour.route?.start} → {selectedTour.route?.end}
                    </h3>
                    <p className="text-sm text-slate-400">
                      Track your progress by marking each bus stop as you arrive.
                    </p>
                  </div>

                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {selectedTour.route?.stops.map((stop, index) => {
                      const isCompleted = isStopCompleted(index);
                      const isCurrent = selectedTour.currentStopIndex === index;
                      const isFuture = !isCompleted && !isCurrent;

                      return (
                        <div
                          key={index}
                          className={`flex items-center gap-3 rounded-lg border p-3 transition ${
                            isCompleted
                              ? "border-green-500/40 bg-green-500/10"
                              : isCurrent
                              ? "border-yellow-400/40 bg-yellow-400/10"
                              : "border-white/10 bg-slate-950/50"
                          }`}
                        >
                          <div
                            className={`flex h-8 w-8 items-center justify-center rounded-full ${
                              isCompleted
                                ? "bg-green-500 text-white"
                                : isCurrent
                                ? "bg-yellow-400 text-slate-900"
                                : "bg-slate-700 text-slate-400"
                            }`}
                          >
                            {isCompleted ? (
                              <CheckCircle className="h-4 w-4" />
                            ) : (
                              <span className="text-sm font-medium">{index + 1}</span>
                            )}
                          </div>
                          
                          <div className="flex-1">
                            <p className={`font-medium ${isCompleted ? "text-green-300" : "text-white"}`}>
                              {stop}
                            </p>
                            {isCompleted && (
                              <p className="text-xs text-slate-400">
                                Arrived at{" "}
                                {tourProgress
                                  .find(p => p.stopIndex === index)
                                  ?.arrivedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            )}
                          </div>

                          {!isCompleted && selectedTour.status !== "completed" && (
                            <button
                              onClick={() => handleStopArrival(index, stop)}
                              disabled={index !== (tourProgress.length)} // Only allow next stop in sequence
                              className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                                index === (tourProgress.length)
                                  ? "bg-yellow-400 text-slate-900 hover:bg-yellow-300"
                                  : "bg-slate-700 text-slate-500 cursor-not-allowed"
                              }`}
                            >
                              {index === (tourProgress.length) ? "Arrived" : "Wait"}
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {selectedTour.status === "completed" && (
                    <div className="mt-4 rounded-lg border border-green-500/40 bg-green-500/10 p-4 text-center">
                      <CheckCircle className="mx-auto h-8 w-8 text-green-400 mb-2" />
                      <p className="font-medium text-green-300">Tour Completed!</p>
                      <p className="text-sm text-slate-400 mt-1">
                        Great job! All stops have been reached.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <MapPin className="h-12 w-12 text-slate-600 mb-4" />
                  <p className="text-slate-400">
                    Select an active tour to track your progress
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
