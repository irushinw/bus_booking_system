"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Bus, Loader2, Mail, Phone, Shield, UserPlus } from "lucide-react";
import { registerWithEmail } from "@/lib/firebase/auth";
import type { UserRole } from "@/types/firestore";

export default function RegisterPage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("passenger");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await registerWithEmail(email, password, displayName, role, { phone });
      router.replace(role === "passenger" ? "/dashboard/passenger" : `/dashboard/${role}`);
    } catch (err: any) {
      console.error(err);
      setError(err?.message ?? "Unable to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col justify-center px-4 py-12">
        <div className="mb-6 flex items-center justify-between text-sm text-slate-300">
          <Link href="/" className="inline-flex items-center gap-2 text-yellow-300">
            <ArrowLeft className="h-4 w-4" /> Back to home
          </Link>
          <div className="inline-flex items-center gap-2">
            <Bus className="h-5 w-5 text-yellow-300" /> iBus Sri Lanka
          </div>
        </div>

        <div className="grid gap-8 rounded-3xl border border-white/10 bg-slate-900/60 p-8 shadow-xl lg:grid-cols-2">
          <div className="space-y-4">
            <h1 className="text-3xl font-semibold text-white">Create your account</h1>
            <p className="text-sm text-slate-300">
              Register as a passenger, driver, or bus owner. Admin accounts are assigned by the National Transport Commission.
            </p>
            <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-4 text-xs text-slate-400">
              <p>Benefits:</p>
              <ul className="mt-2 space-y-1">
                <li>• Passengers can book seats, view tickets, and request refunds.</li>
                <li>• Drivers can receive trip updates and send emergency alerts.</li>
                <li>• Owners track fleet income, maintenance, and driver alerts.</li>
              </ul>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-sm text-white">
            {error && <p className="rounded-xl bg-red-500/20 px-4 py-2 text-red-200">{error}</p>}

            <label className="flex flex-col gap-2">
              Full name
              <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-slate-950/80 px-3">
                <UserPlus className="h-4 w-4 text-yellow-300" />
                <input
                  value={displayName}
                  onChange={(event) => setDisplayName(event.target.value)}
                  required
                  placeholder="Saman Perera"
                  className="flex-1 bg-transparent py-3 outline-none"
                />
              </div>
            </label>

            <label className="flex flex-col gap-2">
              Email address
              <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-slate-950/80 px-3">
                <Mail className="h-4 w-4 text-yellow-300" />
                <input
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  type="email"
                  required
                  placeholder="you@example.com"
                  className="flex-1 bg-transparent py-3 outline-none"
                />
              </div>
            </label>

            <label className="flex flex-col gap-2">
              Mobile number (optional)
              <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-slate-950/80 px-3">
                <Phone className="h-4 w-4 text-yellow-300" />
                <input
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  placeholder="0771234567"
                  className="flex-1 bg-transparent py-3 outline-none"
                />
              </div>
            </label>

            <label className="flex flex-col gap-2">
              Password
              <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-slate-950/80 px-3">
                <Shield className="h-4 w-4 text-yellow-300" />
                <input
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  type="password"
                  required
                  minLength={6}
                  placeholder="At least 6 characters"
                  className="flex-1 bg-transparent py-3 outline-none"
                />
              </div>
            </label>

            <label className="flex flex-col gap-2">
              Role
              <select
                value={role}
                onChange={(event) => setRole(event.target.value as UserRole)}
                className="rounded-xl border border-white/10 bg-slate-950/80 px-3 py-3"
              >
                <option value="passenger">Passenger</option>
                <option value="driver">Driver</option>
                <option value="owner">Vehicle owner</option>
              </select>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-yellow-400 px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-yellow-300 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />} Create account
            </button>

            <p className="text-xs text-slate-400">
              Already have an account? <Link href="/auth/login" className="text-yellow-300">Sign in</Link>.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
