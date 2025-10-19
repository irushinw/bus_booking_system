"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Mail, Lock, LogIn, ArrowLeft, Bus } from "lucide-react";
import { loginWithEmail, loginWithGoogle } from "@/lib/firebase/auth";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const { user, profile } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const defaultDashboard = profile?.role
    ? `/dashboard/${profile.role === "passenger" ? "passenger" : profile.role}`
    : "/dashboard/passenger";
  const redirectTo = params?.get("redirect") ?? defaultDashboard;

  useEffect(() => {
    if (user) {
      router.replace(redirectTo);
    }
  }, [redirectTo, router, user]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await loginWithEmail(email, password);
      router.replace(redirectTo);
    } catch (err: any) {
      console.error(err);
      setError(err?.message ?? "Unable to login. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    try {
      await loginWithGoogle();
      router.replace(redirectTo);
    } catch (err) {
      console.error(err);
      setError("Google sign-in failed. Please try again.");
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
            <h1 className="text-3xl font-semibold text-white">Welcome back</h1>
            <p className="text-sm text-slate-300">
              Sign in with your email or Google account. Passengers can access their tickets, drivers their assignments, and owners their fleet stats.
            </p>
            <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-4 text-xs text-slate-400">
              <p>Quick tips:</p>
              <ul className="mt-2 space-y-1">
                <li>• Passengers default to the passenger dashboard.</li>
                <li>• Drivers and owners are redirected to their respective dashboards.</li>
                <li>• Need an account? Register in under a minute.</li>
              </ul>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-sm text-white">
            {error && <p className="rounded-xl bg-red-500/20 px-4 py-2 text-red-200">{error}</p>}
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
              Password
              <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-slate-950/80 px-3">
                <Lock className="h-4 w-4 text-yellow-300" />
                <input
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  type="password"
                  required
                  placeholder="••••••••"
                  className="flex-1 bg-transparent py-3 outline-none"
                />
              </div>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-yellow-400 px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-yellow-300 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />} Log in
            </button>

            <button
              type="button"
              onClick={handleGoogle}
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-full border border-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:border-yellow-400 disabled:cursor-not-allowed"
            >
              <Bus className="h-4 w-4" /> Continue with Google
            </button>

            <p className="text-xs text-slate-400">
              Don&apos;t have an account? <Link href="/auth/register" className="text-yellow-300">Register here</Link>.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
