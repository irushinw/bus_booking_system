"use client";

import { BadgeCheck, QrCode, Ticket, Users, Calendar, MapPin } from "lucide-react";

type Props = {
  bookingId: string;
  passenger: string | null | undefined;
  route: { start: string; end: string } | null;
  travelDate: string; // ISO
  seats: number[];
  totalFare: number;
};

export default function TicketReceipt({ bookingId, passenger, route, travelDate, seats, totalFare }: Props) {
  return (
    <div className="rounded-xl border border-yellow-400/30 bg-yellow-400/10 p-4 text-slate-200">
      <div className="flex items-center gap-2 text-yellow-300">
        <BadgeCheck className="h-5 w-5" />
        <p className="font-semibold">Booking confirmed</p>
      </div>

      <div className="mt-3 grid gap-3 rounded-lg bg-slate-950/60 p-4 sm:grid-cols-2">
        <div className="space-y-1 text-sm">
          <p className="font-semibold text-white">Digital Ticket #{bookingId.slice(-6).toUpperCase()}</p>
          {route && (
            <p className="flex items-center gap-2 text-slate-300"><MapPin className="h-4 w-4" /> {route.start} → {route.end}</p>
          )}
          <p className="flex items-center gap-2 text-slate-300"><Calendar className="h-4 w-4" /> {new Date(travelDate).toLocaleDateString("en-LK")}</p>
          <p className="flex items-center gap-2 text-slate-300"><Users className="h-4 w-4" /> Seats: {seats.join(", ")}</p>
          <p className="flex items-center gap-2 text-slate-300"><Ticket className="h-4 w-4" /> Total: රු {totalFare.toLocaleString("si-LK")}</p>
          <p className="text-xs text-slate-400">Passenger: {passenger ?? "Passenger"}</p>
        </div>
        <div className="flex items-center justify-center">
          {/* Placeholder visual QR */}
          <div className="flex h-28 w-28 items-center justify-center rounded-lg border border-white/10 bg-white/5">
            <QrCode className="h-16 w-16 text-slate-300" />
          </div>
        </div>
      </div>

      <p className="mt-3 text-xs text-slate-400">
        Show this receipt to the conductor. You can manage or cancel this booking from your passenger dashboard.
      </p>
    </div>
  );
}
