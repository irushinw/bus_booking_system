"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, MapPin, Radio, ShieldAlert, User, Users } from "lucide-react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import {
  createAlert,
  fetchBookingsForBus,
  fetchBusByDriver,
  fetchRouteById,
  fetchUserProfile,
} from "@/lib/firebase/firestore";
import type { Booking, Bus, Route, UserProfile } from "@/types/firestore";

export default function DriverDashboardPage() {
  const { user } = useAuth();
  const [bus, setBus] = useState<Bus | null>(null);
  const [route, setRoute] = useState<Route | null>(null);
  const [owner, setOwner] = useState<UserProfile | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [tripStatus, setTripStatus] = useState<"scheduled" | "in-progress" | "completed">("scheduled");
  const [alertMessage, setAlertMessage] = useState("");
  const [alertStatus, setAlertStatus] = useState<"idle" | "sending" | "sent">("idle");

  useEffect(() => {
    if (!user) return;
    const loadData = async () => {
      setLoading(true);
      try {
        const busRecord = await fetchBusByDriver(user.uid);
        setBus(busRecord);
        if (busRecord?.routeId) {
          const routeRecord = await fetchRouteById(busRecord.routeId);
          setRoute(routeRecord);
        }
        if (busRecord?.ownerId) {
          const ownerProfile = await fetchUserProfile(busRecord.ownerId);
          setOwner(ownerProfile);
        }
        if (busRecord) {
          const bookingList = await fetchBookingsForBus(busRecord.id);
          setBookings(bookingList);
        }
      } catch (error) {
        console.error("Failed to load driver dashboard", error);
      } finally {
        setLoading(false);
      }
    };

    void loadData();
  }, [user]);

  const activePassengers = useMemo(
    () => bookings.filter((booking) => booking.status === "confirmed"),
    [bookings]
  );

  const handleAlert = async () => {
    if (!user || !alertMessage) return;
    try {
      setAlertStatus("sending");
      await createAlert(user.uid, alertMessage);
      setAlertStatus("sent");
      setAlertMessage("");
      setTimeout(() => setAlertStatus("idle"), 2000);
    } catch (error) {
      console.error("Failed to send alert", error);
      setAlertStatus("idle");
    }
  };

  return (
    <ProtectedRoute allowedRoles={["driver"]}>
      <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <section className="space-y-6 rounded-2xl border border-white/10 bg-slate-900/60 p-6">
          <header className="space-y-2">
            <h1 className="text-2xl font-semibold text-white">Driver dashboard</h1>
            <p className="text-sm text-slate-300">
              Manage your assigned trip, monitor booked passengers, and send real-time alerts to the control centre.
            </p>
          </header>

          {loading ? (
            <div className="flex items-center gap-3 py-12 text-slate-300">
              <Loader2 className="h-5 w-5 animate-spin" /> Loading bus assignments...
            </div>
          ) : !bus ? (
            <div className="rounded-xl border border-dashed border-white/10 bg-slate-950/60 p-8 text-sm text-slate-300">
              No bus has been assigned to your profile yet. Please contact the depot supervisor.
            </div>
          ) : (
            <div className="space-y-5">
              <div className="rounded-xl border border-white/10 bg-slate-950/80 p-5 text-sm text-slate-200">
                <h2 className="text-lg font-semibold text-white">Trip overview</h2>
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  <InfoRow label="Route" value={`${route?.start ?? "TBA"} → ${route?.end ?? "TBA"}`} icon={<MapPin className="h-4 w-4" />} />
                  <InfoRow label="Departure date" value={bookings[0]?.date ? new Date(bookings[0].date).toLocaleDateString("en-LK") : "Awaiting first booking"} icon={<CalendarIcon />} />
                  <InfoRow label="Bus capacity" value={`${bus.seats} seats`} icon={<Users className="h-4 w-4" />} />
                  <InfoRow label="Owner" value={owner?.displayName ?? "Pending"} icon={<User className="h-4 w-4" />} />
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-slate-950/80 p-5 text-sm text-slate-200">
                <h2 className="text-lg font-semibold text-white">Trip status</h2>
                <div className="mt-3 flex flex-wrap items-center gap-3 text-xs font-medium">
                  {(["scheduled", "in-progress", "completed"] as const).map((status) => (
                    <button
                      key={status}
                      onClick={() => setTripStatus(status)}
                      className={`rounded-full px-4 py-2 capitalize transition ${
                        tripStatus === status
                          ? "bg-yellow-400 text-slate-900"
                          : "border border-white/10 text-slate-200 hover:border-yellow-400"
                      }`}
                    >
                      {status.replace("-", " ")}
                    </button>
                  ))}
                </div>
                <p className="mt-3 text-xs text-slate-400">
                  Update the status to inform passengers via push notification (coming soon).
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-slate-950/80 p-5">
                <h2 className="text-lg font-semibold text-white">Booked passengers ({activePassengers.length})</h2>
                {activePassengers.length === 0 ? (
                  <p className="mt-3 text-sm text-slate-300">No confirmed passengers yet.</p>
                ) : (
                  <ul className="mt-4 space-y-3 text-sm text-slate-200">
                    {activePassengers.map((booking) => (
                      <li key={booking.id} className="flex items-center justify-between rounded-lg border border-white/10 bg-slate-900/70 px-4 py-2">
                        <span>
                          Seats {booking.seats.join(", ")} • {new Date(booking.date).toLocaleDateString("en-LK")}
                        </span>
                        <span className="text-xs text-slate-400">Booking #{booking.id.slice(-5)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </section>

        <aside className="space-y-6">
          <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-6">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
              <Radio className="h-5 w-5 text-yellow-300" /> Emergency alert
            </h2>
            <p className="mt-2 text-sm text-slate-300">
              Notify the central operations team about breakdowns, traffic, or passenger incidents.
            </p>
            <textarea
              value={alertMessage}
              onChange={(event) => setAlertMessage(event.target.value)}
              rows={4}
              className="mt-4 w-full rounded-xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white focus:border-yellow-400 focus:outline-none"
              placeholder="Eg: Engine issue near Kandy, expecting 20 minute delay"
            />
            <button
              onClick={handleAlert}
              disabled={alertStatus === "sending" || !alertMessage}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-red-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-400 disabled:cursor-not-allowed disabled:bg-red-500/60"
            >
              {alertStatus === "sending" ? "Sending..." : alertStatus === "sent" ? "Alert sent" : "Send alert"}
            </button>
            <p className="mt-3 text-xs text-slate-400">
              Alerts are logged in the admin console with timestamps for follow-up.
            </p>
          </div>

          <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-6 text-sm text-red-100">
            <h3 className="flex items-center gap-2 text-base font-semibold">
              <ShieldAlert className="h-5 w-5" /> Safety reminders
            </h3>
            <ul className="mt-3 space-y-2 text-xs leading-relaxed">
              <li>• Conduct breathalyser checks before departure.</li>
              <li>• Ensure ticket scanner is functional for QR verification.</li>
              <li>• Report overcrowding or harassment immediately via alert.</li>
            </ul>
          </div>
        </aside>
      </div>
    </ProtectedRoute>
  );
}

function InfoRow({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-slate-900/70 px-4 py-3">
      <span className="text-yellow-300">{icon}</span>
      <div className="flex flex-col">
        <span className="text-xs uppercase tracking-wide text-slate-400">{label}</span>
        <span className="text-sm text-white">{value}</span>
      </div>
    </div>
  );
}

function CalendarIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-4 w-4 text-yellow-300"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" x2="16" y1="2" y2="6" />
      <line x1="8" x2="8" y1="2" y2="6" />
      <line x1="3" x2="21" y1="10" y2="10" />
    </svg>
  );
}
