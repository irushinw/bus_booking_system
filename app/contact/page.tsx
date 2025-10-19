"use client";

import { FormEvent, useState } from "react";
import { Loader2, Mail, MessageCircle, Phone } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { recordFeedback } from "@/lib/firebase/firestore";

export default function ContactPage() {
  const { user, profile } = useAuth();
  const [email, setEmail] = useState(profile?.email ?? user?.email ?? "");
  const [category, setCategory] = useState<"complaint" | "feedback" | "support">("feedback");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setSuccess(null);
    try {
      await recordFeedback({
        userId: user?.uid,
        email,
        category,
        message,
      });
      setMessage("");
      setSuccess("Thank you! We have received your message and will respond shortly.");
    } catch (error) {
      console.error("Failed to submit feedback", error);
      setSuccess("We could not send your message. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-4xl px-4 py-16 space-y-10">
        <header className="space-y-3 text-center">
          <h1 className="text-4xl font-semibold">Contact the transport board</h1>
          <p className="text-sm text-slate-300">
            Submit feedback, complaints, or general support requests. Our operations team responds within 24 hours on weekdays.
          </p>
        </header>

        <section className="grid gap-8 rounded-3xl border border-white/10 bg-slate-900/60 p-8 md:grid-cols-5">
          <form onSubmit={handleSubmit} className="space-y-4 text-sm text-white md:col-span-3">
            {success && (
              <p className="rounded-xl border border-yellow-400/40 bg-yellow-400/10 px-4 py-2 text-yellow-100">{success}</p>
            )}
            <label className="flex flex-col gap-2">
              Email
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
              Category
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value as typeof category)}
                className="rounded-xl border border-white/10 bg-slate-950/80 px-3 py-3"
              >
                <option value="feedback">Feedback</option>
                <option value="complaint">Complaint</option>
                <option value="support">Support</option>
              </select>
            </label>
            <label className="flex flex-col gap-2">
              Message
              <textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                rows={6}
                required
                placeholder="Tell us how we can help"
                className="rounded-xl border border-white/10 bg-slate-950/80 px-3 py-3"
              />
            </label>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-full bg-yellow-400 px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-yellow-300 disabled:cursor-not-allowed"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageCircle className="h-4 w-4" />} Send message
            </button>
          </form>

          <aside className="space-y-4 rounded-2xl border border-white/10 bg-slate-950/70 p-6 text-sm text-slate-200 md:col-span-2">
            <h2 className="text-lg font-semibold text-white">Other channels</h2>
            <p>National Transport Commission</p>
            <div className="flex items-center gap-3 text-sm">
              <Phone className="h-4 w-4 text-yellow-300" /> Hotline: 1955
            </div>
            <p className="text-xs text-slate-400">Visit your nearest depot for ticket refunds or lost-and-found assistance.</p>
          </aside>
        </section>
      </div>
    </main>
  );
}
