"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Download, Loader2, Ticket, XCircle } from "lucide-react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { cancelBooking, fetchBookingsForUser, fetchRouteById, fetchBusById } from "@/lib/firebase/firestore";
import type { Booking, Route, Bus } from "@/types/firestore";

interface BookingWithDetails extends Booking {
  route?: Route | null;
  bus?: Bus | null;
}

export default function PassengerDashboardPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const loadBookings = async () => {
      setLoading(true);
      try {
        const bookingData = await fetchBookingsForUser(user.uid);
        const withDetails: BookingWithDetails[] = await Promise.all(
          bookingData.map(async (booking) => {
            const bus = await fetchBusById(booking.busId);
            let route: Route | null = null;
            if (bus?.routeId) {
              route = await fetchRouteById(bus.routeId);
            }
            return { ...booking, bus, route };
          })
        );
        setBookings(withDetails);
      } catch (error) {
        console.error("Failed to load bookings", error);
      } finally {
        setLoading(false);
      }
    };

    void loadBookings();
  }, [user]);

  const activeBookings = useMemo(() => bookings.filter((booking) => booking.status === "confirmed"), [bookings]);
  const cancelledBookings = useMemo(() => bookings.filter((booking) => booking.status === "cancelled"), [bookings]);

  const handleCancel = async (bookingId: string) => {
    setCancellingId(bookingId);
    try {
      await cancelBooking(bookingId);
      setBookings((prev) => prev.map((booking) => (booking.id === bookingId ? { ...booking, status: "cancelled" } : booking)));
    } catch (error) {
      console.error("Failed to cancel booking", error);
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <ProtectedRoute allowedRoles={["passenger"]}>
      <div className="space-y-8">
        <section className="rounded-2xl border border-white/10 bg-slate-900/60 p-6">
          <h1 className="text-2xl font-semibold text-white">My bookings</h1>
          <p className="mt-2 text-sm text-slate-300">
            Access your upcoming trips, download digital tickets, or cancel seats up to 2 hours before departure.
          </p>
          <Link
            href="/routes"
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-yellow-400 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-yellow-300"
          >
            Search new routes
          </Link>
        </section>

        <section className="rounded-2xl border border-white/10 bg-slate-900/60 p-6">
          <h2 className="text-xl font-semibold text-white">Upcoming journeys</h2>
          {loading ? (
            <div className="flex items-center gap-3 py-10 text-slate-300">
              <Loader2 className="h-5 w-5 animate-spin" /> Loading bookings...
            </div>
          ) : activeBookings.length === 0 ? (
            <div className="rounded-xl border border-dashed border-white/10 bg-slate-950/60 p-8 text-sm text-slate-300">
              No upcoming bookings yet. Reserve your seat early to guarantee travel.
            </div>
          ) : (
            <div className="mt-6 grid gap-4">
              {activeBookings.map((booking) => (
                <article
                  key={booking.id}
                  className="flex flex-col gap-4 rounded-xl border border-white/10 bg-slate-950/80 p-4 text-sm text-slate-200 md:flex-row md:items-center md:justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-base font-semibold text-white">
                      <Ticket className="h-4 w-4 text-yellow-300" /> {booking.route?.start} → {booking.route?.end}
                    </div>
                    <p className="text-slate-300">
                      Seats {booking.seats.join(", ")} • රු {booking.fare.toLocaleString("si-LK")} • {new Date(booking.date).toLocaleDateString("en-LK")}
                    </p>
                    <p className="text-xs text-slate-400">Booking ID: {booking.id}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs font-medium">
                    <Link
                      href={`/booking/${booking.route?.id ?? booking.bus?.routeId ?? booking.busId}`}
                      className="inline-flex items-center gap-2 rounded-full border border-yellow-400 px-4 py-2 text-yellow-300"
                    >
                      <Download className="h-4 w-4" /> View ticket
                    </Link>
                    <button
                      onClick={() => handleCancel(booking.id)}
                      disabled={cancellingId === booking.id}
                      className="inline-flex items-center gap-2 rounded-full border border-red-500/60 px-4 py-2 text-red-300 transition hover:bg-red-500/10 disabled:cursor-not-allowed"
                    >
                      {cancellingId === booking.id ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" /> Cancelling...
                        </>
                      ) : (
                        <>
                          <XCircle className="h-4 w-4" /> Cancel booking
                        </>
                      )}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-white/10 bg-slate-900/60 p-6">
          <h2 className="text-xl font-semibold text-white">Past activity</h2>
          {cancelledBookings.length === 0 ? (
            <p className="mt-3 text-sm text-slate-300">No cancellations recorded.</p>
          ) : (
            <div className="mt-4 grid gap-4 text-sm text-slate-300">
              {cancelledBookings.map((booking) => (
                <div key={booking.id} className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
                  <p className="font-semibold text-red-200">Cancelled {new Date(booking.date).toLocaleDateString("en-LK")}</p>
                  <p className="text-slate-200">
                    {booking.route?.start} → {booking.route?.end} • Seats {booking.seats.join(", ")}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </ProtectedRoute>
  );
}
