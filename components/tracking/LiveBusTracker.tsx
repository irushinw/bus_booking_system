"use client";

import { useEffect, useState } from "react";
import { MapPin, Clock, Users, Loader2, CheckCircle, Circle } from "lucide-react";
import { 
  fetchTours,
  fetchTourProgress,
  fetchRouteById,
  fetchBusById,
} from "@/lib/firebase/firestore";
import type { Tour, TourProgress, Route, Bus } from "@/types/firestore";

interface LiveTourData extends Tour {
  route?: Route;
  bus?: Bus;
  progress?: TourProgress[];
}

export function LiveBusTracker() {
  const [activeTours, setActiveTours] = useState<LiveTourData[]>([]);
  const [selectedTour, setSelectedTour] = useState<LiveTourData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActiveTours();
    
    // Refresh data every 30 seconds for real-time updates
    const interval = setInterval(loadActiveTours, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const loadActiveTours = async () => {
    try {
      const tours = await fetchTours();
      
      // Filter active tours (started or in-progress)
      const activeTourData = tours.filter(
        tour => tour.status === "started" || tour.status === "in-progress"
      );

      // Enrich with route, bus, and progress data
      const enrichedTours = await Promise.all(
        activeTourData.map(async (tour) => {
          const [route, bus, progress] = await Promise.all([
            fetchRouteById(tour.routeId),
            fetchBusById(tour.busId),
            fetchTourProgress(tour.id),
          ]);
          
          return {
            ...tour,
            route: route || undefined,
            bus: bus || undefined,
            progress,
          };
        })
      );

      setActiveTours(enrichedTours);
      
      // Update selected tour if it exists
      if (selectedTour) {
        const updatedSelected = enrichedTours.find(t => t.id === selectedTour.id);
        if (updatedSelected) {
          setSelectedTour(updatedSelected);
        }
      }
    } catch (error) {
      console.error("Failed to load active tours", error);
    } finally {
      setLoading(false);
    }
  };

  const getProgressPercentage = (tour: LiveTourData) => {
    if (!tour.route || !tour.progress) return 0;
    
    const totalStops = tour.route.stops.length;
    const completedStops = tour.progress.length;
    
    return Math.round((completedStops / totalStops) * 100);
  };

  const getCurrentLocation = (tour: LiveTourData) => {
    if (!tour.progress || tour.progress.length === 0) {
      return "Starting point";
    }
    
    const lastProgress = tour.progress[tour.progress.length - 1];
    return lastProgress.stopName;
  };

  const getNextStop = (tour: LiveTourData) => {
    if (!tour.route || !tour.progress) return tour.route?.stops[0];
    
    const nextIndex = tour.progress.length;
    return nextIndex < tour.route.stops.length ? tour.route.stops[nextIndex] : "Final destination";
  };

  const isStopCompleted = (tour: LiveTourData, stopIndex: number) => {
    return tour.progress?.some(p => p.stopIndex === stopIndex) || false;
  };

  const getEstimatedArrival = (tour: LiveTourData, stopIndex: number) => {
    if (!tour.progress || tour.progress.length === 0) return "Calculating...";
    
    // Simple estimation based on progress rate
    const completedStops = tour.progress.length;
    const totalStops = tour.route?.stops.length || 1;
    const elapsedTime = Date.now() - tour.startDateTime.getTime();
    
    if (stopIndex <= completedStops - 1) return "Arrived";
    
    const avgTimePerStop = elapsedTime / completedStops;
    const stopsRemaining = stopIndex - completedStops + 1;
    const estimatedTimeMs = avgTimePerStop * stopsRemaining;
    
    const estimatedArrival = new Date(Date.now() + estimatedTimeMs);
    return estimatedArrival.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="flex items-center gap-3 text-slate-300">
          <Loader2 className="h-6 w-6 animate-spin" />
          Loading live bus tracking...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6">
        <h2 className="text-xl font-semibold text-white mb-2">Live Bus Tracking</h2>
        <p className="text-sm text-slate-300">
          Track buses in real-time and see their current location and progress.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Active Tours List */}
        <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Active Tours</h3>
          
          {activeTours.length === 0 ? (
            <div className="text-center py-8">
              <MapPin className="h-12 w-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">No active tours at the moment</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeTours.map((tour) => (
                <div
                  key={tour.id}
                  onClick={() => setSelectedTour(tour)}
                  className={`cursor-pointer rounded-lg border p-4 transition ${
                    selectedTour?.id === tour.id
                      ? "border-yellow-400/40 bg-yellow-400/10"
                      : "border-white/10 bg-slate-950/50 hover:bg-slate-950/80"
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-white">
                        {tour.route?.start} → {tour.route?.end}
                      </h4>
                      <p className="text-xs text-slate-400">
                        Bus #{tour.bus?.id.slice(-5)} • {tour.bus?.seats} seats
                      </p>
                    </div>
                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-green-400/20 text-green-300">
                      {tour.status === "started" ? "Started" : "In Progress"}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-2 text-slate-300">
                      <MapPin className="h-3 w-3 text-yellow-400" />
                      <span>Currently at: {getCurrentLocation(tour)}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-slate-300">
                      <Clock className="h-3 w-3 text-blue-400" />
                      <span>Next: {getNextStop(tour)}</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                        <span>Progress</span>
                        <span>{getProgressPercentage(tour)}%</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-1.5">
                        <div
                          className="bg-yellow-400 h-1.5 rounded-full transition-all"
                          style={{ width: `${getProgressPercentage(tour)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tour Detail View */}
        <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Tour Details</h3>
          
          {!selectedTour ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">Select a tour to view detailed progress</p>
            </div>
          ) : (
            <div>
              {/* Tour Header */}
              <div className="rounded-lg border border-white/10 bg-slate-950/50 p-4 mb-4">
                <h4 className="font-medium text-white mb-2">
                  {selectedTour.route?.start} → {selectedTour.route?.end}
                </h4>
                <div className="grid grid-cols-2 gap-4 text-xs text-slate-400">
                  <div>
                    <span className="block">Started</span>
                    <span className="text-white">
                      {selectedTour.startDateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div>
                    <span className="block">Bus</span>
                    <span className="text-white">#{selectedTour.bus?.id.slice(-5)}</span>
                  </div>
                </div>
              </div>

              {/* Stops Progress */}
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {selectedTour.route?.stops.map((stop, index) => {
                  const isCompleted = isStopCompleted(selectedTour, index);
                  const isCurrent = selectedTour.currentStopIndex === index;
                  
                  return (
                    <div
                      key={index}
                      className={`flex items-center gap-3 rounded-lg border p-3 ${
                        isCompleted
                          ? "border-green-500/40 bg-green-500/10"
                          : isCurrent
                          ? "border-yellow-400/40 bg-yellow-400/10"
                          : "border-white/10 bg-slate-950/30"
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
                          <Circle className="h-4 w-4" />
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <p className={`font-medium ${isCompleted ? "text-green-300" : "text-white"}`}>
                          {stop}
                        </p>
                        <p className="text-xs text-slate-400">
                          {isCompleted ? (
                            `Arrived at ${selectedTour.progress?.find(p => p.stopIndex === index)
                              ?.arrivedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                          ) : (
                            `ETA: ${getEstimatedArrival(selectedTour, index)}`
                          )}
                        </p>
                      </div>

                      {isCurrent && (
                        <div className="text-yellow-400 text-xs font-medium">
                          Current
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Refresh Button */}
              <button
                onClick={loadActiveTours}
                className="mt-4 w-full rounded-lg bg-yellow-400 px-4 py-2 text-sm font-medium text-slate-900 transition hover:bg-yellow-300"
              >
                Refresh Location
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
