"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  BadgeCheck,
  Calendar,
  CheckCircle2,
  Loader2,
  MapPin,
  ShieldCheck,
  Ticket,
  Users,
  CreditCard,
  Lock,
  AlertCircle,
} from "lucide-react";
import {
  createBooking,
  fetchBusForRoute,
  fetchRouteById,
  fetchUserProfile,
  recordOwnerEarning,
  recordPayment,
} from "@/lib/firebase/firestore";
import type { Route, Bus, UserProfile } from "@/types/firestore";
import { useAuth } from "@/context/AuthContext";

export default function BookingPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user, profile } = useAuth();

  const routeId = params?.id as string;

  const [route, setRoute] = useState<Route | null>(null);
  const [bus, setBus] = useState<Bus | null>(null);
  const [driver, setDriver] = useState<UserProfile | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const [travelDate, setTravelDate] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [touched, setTouched] = useState<{ name?: boolean; number?: boolean; expiry?: boolean; cvc?: boolean }>({});

  // Formatting & validation helpers
  const formatCardNumber = (value: string) =>
    value
      .replace(/\D/g, "")
      .slice(0, 16)
      .replace(/(.{4})/g, "$1 ")
      .trim();

  const luhnCheck = (num: string) => {
    let sum = 0;
    let shouldDouble = false;
    for (let i = num.length - 1; i >= 0; i--) {
      let digit = parseInt(num.charAt(i), 10);
      if (shouldDouble) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
      shouldDouble = !shouldDouble;
    }
    return sum % 10 === 0;
  };

  const detectCardBrand = (digits: string): "VISA" | "MASTERCARD" | null => {
    if (/^4\d{0,15}$/.test(digits)) return "VISA";
    if (/^(5[1-5]|2(2[2-9]|[3-6]\d|7[01]|720))\d{0,12}$/.test(digits)) return "MASTERCARD";
    return null;
  };

  const formatExpiry = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 4);
    if (digits.length < 3) return digits;
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  };

  const numberDigits = cardNumber.replace(/\D/g, "");
  const brand = detectCardBrand(numberDigits);
  const isCardValid = numberDigits.length === 16 && luhnCheck(numberDigits);

  const expDigits = expiry.replace(/\D/g, "").slice(0, 4);
  const month = parseInt(expDigits.slice(0, 2) || "0", 10);
  const year = parseInt(expDigits.slice(2) || "0", 10);
  const isMonthValid = month >= 1 && month <= 12;
  const isExpiryValid = (() => {
    if (!isMonthValid || expDigits.length < 4) return false;
    const fullYear = 2000 + year;
    const expiryDate = new Date(fullYear, month); // first day of next month
    return expiryDate > new Date();
  })();

  const cvcDigits = cvc.replace(/\D/g, "").slice(0, 4);
  const isCvcValid = cvcDigits.length >= 3;
  const isNameValid = cardName.trim().length >= 2;

  const isPaymentValid = isNameValid && isCardValid && isExpiryValid && isCvcValid;

  useEffect(() => {
    if (!routeId) return;
    const loadDetails = async () => {
      setLoading(true);
      try {
        const routeData = await fetchRouteById(routeId);
        setRoute(routeData);
        if (!routeData) return;
        const busData = await fetchBusForRoute(routeData.id);
        setBus(busData);
        if (busData?.driverId) {
          const driverProfile = await fetchUserProfile(busData.driverId);
          setDriver(driverProfile);
        }
      } catch (err) {
        console.error(err);
        setError("Unable to load booking information. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    void loadDetails();
  }, [routeId]);

  const seatCount = bus?.seats ?? 40;
  const seatNumbers = useMemo(() => Array.from({ length: seatCount }, (_, index) => index + 1), [seatCount]);
  const totalFare = useMemo(() => (route ? route.fare * selectedSeats.length : 0), [route, selectedSeats.length]);

  const toggleSeat = (seat: number) => {
    setSelectedSeats((prev) =>
      prev.includes(seat) ? prev.filter((num) => num !== seat) : [...prev, seat].sort((a, b) => a - b)
    );
  };

  const handleBooking = async () => {
    if (!user) {
      router.push(`/auth/login?redirect=/booking/${routeId}`);
      return;
    }
    if (!route || !bus) return;
    if (!travelDate) {
      setError("Please select a travel date");
      return;
    }
    if (selectedSeats.length === 0) {
      setError("Select at least one seat to continue");
      return;
    }
    // Minimal validation for simulated card payment
    const sanitizedNumber = cardNumber.replace(/\s+/g, "");
    const validExpiry = /^(0[1-9]|1[0-2])\/(\d{2})$/.test(expiry) && isExpiryValid;
    const validCvc = /^\d{3,4}$/.test(cvc);
    if (!isNameValid || !isCardValid || !validExpiry || !validCvc) {
      setError("Please enter valid payment details to continue.");
      return;
    }

    try {
      setError(null);
      setSubmitting(true);
      // Simulated payment step (card details skipped). We add slight delay and create a payment record.
      await new Promise((resolve) => setTimeout(resolve, 1200));

      // Create booking first to obtain bookingId
      const newBookingId = await createBooking({
        userId: user.uid,
        busId: bus.id,
        seats: selectedSeats,
        date: travelDate,
        fare: totalFare,
      });
      // Record payment success (simulation)
      await recordPayment({
        bookingId: newBookingId,
        userId: user.uid,
        busId: bus.id,
        routeId: route.id,
        amount: totalFare,
        method: "card",
        status: "succeeded",
        last4: sanitizedNumber.slice(-4),
      });

      // Owner earning (10%)
      const earningAmount = Math.round(totalFare * 0.1);
      await recordOwnerEarning({
        ownerId: bus.ownerId,
        busId: bus.id,
        bookingId: newBookingId,
        route: `${route.start} → ${route.end}`,
        travelDate,
        seatCount: selectedSeats.length,
        grossFare: totalFare,
        percentage: 10,
        amount: earningAmount,
      });
      setBookingId(newBookingId);
    } catch (err) {
      console.error(err);
      setError("Could not confirm booking. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center bg-slate-950 text-white">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-yellow-300" />
          <p className="text-sm text-slate-400">Loading booking details...</p>
        </div>
      </main>
    );
  }

  if (!route) {
    return (
      <main className="flex min-h-[70vh] flex-col items-center justify-center gap-4 bg-slate-950 text-white">
        <p className="text-lg font-semibold">Route not found</p>
        <Link href="/routes" className="rounded-full bg-yellow-400 px-4 py-2 text-slate-900">
          Back to route list
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="border-b border-white/10 bg-slate-900/60 py-10">
        <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4">
          <div className="flex flex-col gap-2">
            <Link href="/routes" className="text-sm text-yellow-300 hover:text-yellow-200">
              ← Back to all routes
            </Link>
            <h1 className="text-3xl font-semibold">
              {route.start} → {route.end}
            </h1>
            <p className="text-sm text-slate-300">Estimated fare per seat: රු {route.fare.toLocaleString("si-LK")}</p>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-5xl gap-6 px-4 py-10 lg:grid-cols-[2fr,1fr]">
        <section className="space-y-6 rounded-2xl border border-white/10 bg-slate-900/60 p-6 shadow-lg">
          <h2 className="text-lg font-semibold">Choose your seats</h2>
          <p className="text-sm text-slate-300">Tap to select seats. Green seats are available; yellow indicates your selection.</p>

          <div className="grid grid-cols-4 gap-3 sm:grid-cols-5">
            {seatNumbers.map((seat) => {
              const isSelected = selectedSeats.includes(seat);
              return (
                <button
                  key={seat}
                  onClick={() => toggleSeat(seat)}
                  className={`flex h-12 items-center justify-center rounded-lg border text-sm font-medium transition ${
                    isSelected
                      ? "border-yellow-400 bg-yellow-400/80 text-slate-900"
                      : "border-white/10 bg-slate-900/70 text-white hover:border-yellow-400"
                  }`}
                >
                  {seat}
                </button>
              );
            })}
          </div>

          <div className="grid gap-4 rounded-xl border border-white/10 bg-slate-950/80 p-4 text-sm text-slate-300 sm:grid-cols-3">
            <div className="flex items-center gap-2">
              <span className="h-4 w-4 rounded-sm border border-white/20 bg-slate-900/80" /> Available
            </div>
            <div className="flex items-center gap-2">
              <span className="h-4 w-4 rounded-sm border border-yellow-400 bg-yellow-400/80" /> Your selection
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-yellow-300" /> Safe & verified
            </div>
          </div>

          <div className="space-y-4">
            <label className="flex flex-col gap-2 text-sm text-slate-200">
              <span className="flex items-center gap-2 font-medium">
                <Calendar className="h-4 w-4" /> Travel date
              </span>
              <input
                type="date"
                value={travelDate}
                onChange={(event) => setTravelDate(event.target.value)}
                className="rounded-lg border border-white/10 bg-slate-950/80 px-3 py-2 text-white focus:border-yellow-400 focus:outline-none"
              />
            </label>
            <div className="flex items-center gap-3 text-sm text-slate-300">
              <Users className="h-4 w-4" /> Seats selected: {selectedSeats.length}
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-300">
              <Ticket className="h-4 w-4" /> Total fare: රු {totalFare.toLocaleString("si-LK")}
            </div>
            {/* Simulated payment form - Notion-like card UI */}
            <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-white">Payment details</p>
                <span className="inline-flex items-center gap-1 text-xs text-slate-400"><Lock className="h-3 w-3" /> Secure</span>
              </div>
              <div className="mt-3 grid gap-3 text-sm">
                <label className="block">
                  <span className="mb-1 block text-xs text-slate-400">Name on card</span>
                  <input
                    value={cardName}
                    onBlur={() => setTouched((t) => ({ ...t, name: true }))}
                    onChange={(e) => setCardName(e.target.value)}
                    placeholder="Jane Smith"
                    className={`w-full rounded-lg border bg-slate-900/80 px-3 py-2 text-white placeholder:text-slate-500 ${touched.name && !isNameValid ? "border-red-500/60" : "border-white/10 focus:border-yellow-400"}`}
                  />
                </label>

                <label className="block">
                  <span className="mb-1 block text-xs text-slate-400">Card number</span>
                  <div className={`flex items-center gap-2 rounded-lg border bg-slate-900/80 px-3 ${touched.number && !isCardValid ? "border-red-500/60" : "border-white/10 focus-within:border-yellow-400"}`}>
                    <CreditCard className="h-4 w-4 text-slate-400" />
                    <input
                      value={cardNumber}
                      onBlur={() => setTouched((t) => ({ ...t, number: true }))}
                      onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                      placeholder="4242 4242 4242 4242"
                      inputMode="numeric"
                      className="flex-1 bg-transparent py-2 text-white outline-none placeholder:text-slate-500"
                    />
                    {brand && (
                      <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-slate-300">{brand}</span>
                    )}
                  </div>
                  {touched.number && !isCardValid && (
                    <p className="mt-1 flex items-center gap-1 text-xs text-red-300"><AlertCircle className="h-3 w-3" /> Enter a valid 16‑digit card number.</p>
                  )}
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <label className="block">
                    <span className="mb-1 block text-xs text-slate-400">Expiry</span>
                    <input
                      value={expiry}
                      onBlur={() => setTouched((t) => ({ ...t, expiry: true }))}
                      onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                      placeholder="MM/YY"
                      inputMode="numeric"
                      className={`w-full rounded-lg border bg-slate-900/80 px-3 py-2 text-white placeholder:text-slate-500 ${touched.expiry && !isExpiryValid ? "border-red-500/60" : "border-white/10 focus:border-yellow-400"}`}
                    />
                    {touched.expiry && !isExpiryValid && (
                      <p className="mt-1 flex items-center gap-1 text-xs text-red-300"><AlertCircle className="h-3 w-3" /> Enter a valid future date.</p>
                    )}
                  </label>

                  <label className="block">
                    <span className="mb-1 block text-xs text-slate-400">CVC</span>
                    <input
                      value={cvc}
                      onBlur={() => setTouched((t) => ({ ...t, cvc: true }))}
                      onChange={(e) => setCvc(e.target.value.replace(/\D/g, "").slice(0, 4))}
                      placeholder="CVC"
                      inputMode="numeric"
                      className={`w-full rounded-lg border bg-slate-900/80 px-3 py-2 text-white placeholder:text-slate-500 ${touched.cvc && !isCvcValid ? "border-red-500/60" : "border-white/10 focus:border-yellow-400"}`}
                    />
                    {touched.cvc && !isCvcValid && (
                      <p className="mt-1 flex items-center gap-1 text-xs text-red-300"><AlertCircle className="h-3 w-3" /> 3–4 digits.</p>
                    )}
                  </label>
                </div>
                <p className="text-xs text-slate-400">This is a demo payment. No real charges will be made.</p>
              </div>
            </div>
            {error && <p className="rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-300">{error}</p>}
            <button
              onClick={handleBooking}
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-yellow-400 px-4 py-3 font-semibold text-slate-900 transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:bg-yellow-400/60"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Processing payment...
                </>
              ) : (
                <>
                  Confirm booking <BadgeCheck className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </section>

        <aside className="space-y-6">
          <div className="space-y-4 rounded-2xl border border-white/10 bg-slate-900/60 p-6 shadow-lg">
            <h2 className="text-lg font-semibold">Route details</h2>
            <div className="space-y-3 text-sm text-slate-300">
              <p><strong>From:</strong> {route.start}</p>
              <p><strong>To:</strong> {route.end}</p>
              <p><strong>Stops:</strong> {route.stops?.length ? route.stops.join(", ") : "Stops will be updated"}</p>
              {bus && <p><strong>Bus capacity:</strong> {bus.seats} seats</p>}
              {driver && (
                <p>
                  <strong>Driver:</strong> {driver.displayName ?? "Assigned driver"}
                </p>
              )}
            </div>
            <p className="rounded-xl bg-slate-950/60 p-4 text-xs text-slate-400">
              Please arrive 15 minutes before departure with your NIC. Digital QR ticket will be emailed and is available on the passenger dashboard.
            </p>
          </div>

          {!user && (
            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 text-sm text-slate-200">
              <p className="font-semibold">Login for faster checkout</p>
              <p className="mt-2 text-slate-300">
                Create a free passenger account to save your favourite routes and manage bookings.
              </p>
              <div className="mt-4 flex gap-3">
                <Link
                  href={`/auth/login?redirect=/booking/${route.id}`}
                  className="flex-1 rounded-full bg-yellow-400 px-4 py-2 text-center font-semibold text-slate-900"
                >
                  Login
                </Link>
                <Link href="/auth/register" className="flex-1 rounded-full border border-yellow-400 px-4 py-2 text-center font-semibold text-yellow-300">
                  Register
                </Link>
              </div>
            </div>
          )}

          {bookingId && (
            <div className="space-y-4 rounded-2xl border border-yellow-400/40 bg-yellow-400/10 p-6 text-slate-900">
              <h3 className="flex items-center gap-2 text-lg font-semibold">
                <CheckCircle2 className="h-5 w-5" /> Booking confirmed
              </h3>
              <div className="rounded-xl bg-white/80 p-4 text-sm shadow">
                <p className="font-semibold">Digital ticket #{bookingId.slice(-6).toUpperCase()}</p>
                <p className="mt-2">Passenger: {profile?.displayName ?? user?.email}</p>
                <p>Date: {new Date(travelDate).toLocaleDateString("en-LK")}</p>
                <p>Seats: {selectedSeats.join(", ")}</p>
                <p>Total paid: රු {totalFare.toLocaleString("si-LK")}</p>
                <p className="mt-3 text-xs text-slate-600">
                  Show this receipt to the conductor. You can manage or cancel this booking from your passenger dashboard.
                </p>
              </div>
              <Link
                href="/dashboard/passenger"
                className="inline-flex items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-yellow-300"
              >
                Go to passenger dashboard
              </Link>
            </div>
          )}
        </aside>
      </div>
    </main>
  );
}
