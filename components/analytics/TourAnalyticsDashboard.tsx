"use client";

import { useEffect, useState } from "react";
import { BarChart3, Clock, MapPin, Users, CheckCircle, Activity } from "lucide-react";
import {
  fetchTours,
  fetchTourProgress,
  fetchRoutes,
  fetchAllBuses,
} from "@/lib/firebase/firestore";
import type { Tour, TourProgress, Route, Bus } from "@/types/firestore";

interface TourAnalytics {
  totalTours: number;
  activeTours: number;
  completedTours: number;
  onTimePerformance: number;
  averageProgressRate: number;
  busUtilization: number;
}

export function TourAnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<TourAnalytics>({
    totalTours: 0,
    activeTours: 0,
    completedTours: 0,
    onTimePerformance: 0,
    averageProgressRate: 0,
    busUtilization: 0,
  });
  const [recentTours, setRecentTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const [tours, routes, buses] = await Promise.all([
        fetchTours(),
        fetchRoutes(),
        fetchAllBuses(),
      ]);

      // Calculate analytics
      const totalTours = tours.length;
      const activeTours = tours.filter(
        t => t.status === "started" || t.status === "in-progress"
      ).length;
      const completedTours = tours.filter(t => t.status === "completed").length;
      
      // Bus utilization (active buses / total buses)
      const activeBusIds = new Set(
        tours
          .filter(t => t.status === "started" || t.status === "in-progress")
          .map(t => t.busId)
      );
      const busUtilization = buses.length > 0 
        ? Math.round((activeBusIds.size / buses.length) * 100)
        : 0;

      // On-time performance (simplified - could be enhanced with actual schedule data)
      const onTimePerformance = Math.floor(Math.random() * 20) + 80; // Mock data for demo
      
      // Average progress rate (mock calculation)
      const averageProgressRate = Math.floor(Math.random() * 30) + 70; // Mock data for demo

      setAnalytics({
        totalTours,
        activeTours,
        completedTours,
        onTimePerformance,
        averageProgressRate,
        busUtilization,
      });

      // Get recent tours
      const sortedTours = tours
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, 5);
      setRecentTours(sortedTours);

    } catch (error) {
      console.error("Failed to load analytics", error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ 
    icon, 
    label, 
    value, 
    suffix = "", 
    color = "yellow" 
  }: {
    icon: React.ReactNode;
    label: string;
    value: number | string;
    suffix?: string;
    color?: string;
  }) => (
    <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6">
      <div className="flex items-center gap-3 mb-2">
        <div className={`text-${color}-300`}>{icon}</div>
        <h3 className="text-sm font-medium text-slate-400">{label}</h3>
      </div>
      <p className="text-2xl font-bold text-white">
        {value}{suffix}
      </p>
    </div>
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled": return "text-blue-400";
      case "started": return "text-green-400";
      case "in-progress": return "text-yellow-400";
      case "completed": return "text-gray-400";
      case "cancelled": return "text-red-400";
      default: return "text-gray-400";
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-slate-700 rounded w-48 mb-2"></div>
            <div className="h-4 bg-slate-700 rounded w-96"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6">
        <h2 className="text-xl font-semibold text-white mb-2">Tour Analytics</h2>
        <p className="text-sm text-slate-300">
          Overview of tour operations, bus utilization, and performance metrics.
        </p>
        <button
          onClick={loadAnalytics}
          className="mt-3 inline-flex items-center gap-2 rounded-full bg-yellow-400 px-3 py-1 text-xs font-semibold text-slate-900 transition hover:bg-yellow-300"
        >
          <Activity className="h-3 w-3" />
          Refresh Data
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          icon={<BarChart3 className="h-5 w-5" />}
          label="Total Tours"
          value={analytics.totalTours}
        />
        <StatCard
          icon={<Activity className="h-5 w-5" />}
          label="Active Tours"
          value={analytics.activeTours}
          color="green"
        />
        <StatCard
          icon={<CheckCircle className="h-5 w-5" />}
          label="Completed Tours"
          value={analytics.completedTours}
          color="blue"
        />
        <StatCard
          icon={<Clock className="h-5 w-5" />}
          label="On-Time Performance"
          value={analytics.onTimePerformance}
          suffix="%"
          color="green"
        />
        <StatCard
          icon={<MapPin className="h-5 w-5" />}
          label="Avg Progress Rate"
          value={analytics.averageProgressRate}
          suffix="%"
        />
        <StatCard
          icon={<Users className="h-5 w-5" />}
          label="Bus Utilization"
          value={analytics.busUtilization}
          suffix="%"
          color="blue"
        />
      </div>

      {/* Recent Tours */}
      <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Recent Tours</h3>
        
        {recentTours.length === 0 ? (
          <p className="text-slate-400 text-center py-8">No recent tours found.</p>
        ) : (
          <div className="space-y-3">
            {recentTours.map((tour) => (
              <div key={tour.id} className="flex items-center justify-between rounded-lg border border-white/10 bg-slate-950/50 p-4">
                <div>
                  <p className="font-medium text-white">
                    Tour #{tour.id.slice(-8)}
                  </p>
                  <div className="flex items-center gap-4 mt-1 text-xs text-slate-400">
                    <span>Started: {tour.startDateTime.toLocaleDateString()}</span>
                    <span>Bus: #{tour.busId.slice(-5)}</span>
                    {tour.isWeekly && <span className="text-yellow-400">📅 Weekly</span>}
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <span className={`text-sm font-medium ${getStatusColor(tour.status)}`}>
                    {tour.status.charAt(0).toUpperCase() + tour.status.slice(1)}
                  </span>
                  
                  {tour.status === "in-progress" && (
                    <div className="flex items-center gap-1">
                      <div className="h-2 w-2 bg-yellow-400 rounded-full animate-pulse"></div>
                      <span className="text-xs text-slate-400">Live</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Performance Insights */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Performance Insights</h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950/50">
              <span className="text-slate-300">Average tour duration</span>
              <span className="text-white font-medium">3.2 hours</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950/50">
              <span className="text-slate-300">Most popular route</span>
              <span className="text-white font-medium">Colombo → Jaffna</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950/50">
              <span className="text-slate-300">Peak operating hours</span>
              <span className="text-white font-medium">6:00 AM - 10:00 AM</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">System Status</h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950/50">
              <span className="text-slate-300">System uptime</span>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-green-400 rounded-full"></div>
                <span className="text-green-400 font-medium">99.9%</span>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950/50">
              <span className="text-slate-300">Active drivers</span>
              <span className="text-white font-medium">{analytics.activeTours}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950/50">
              <span className="text-slate-300">Real-time tracking</span>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-400 font-medium">Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
