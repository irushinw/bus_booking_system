export default function AboutPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-5xl px-4 py-16 space-y-12">
        <header className="space-y-3 text-center">
          <h1 className="text-4xl font-semibold">About iBus Sri Lanka</h1>
          <p className="text-sm text-slate-300">
            A national initiative by the Sri Lanka Transport Board to bring reliable, transparent, and digital-first bus services
            to passengers, drivers, vehicle owners, and administrators.
          </p>
        </header>

        <section className="grid gap-6 md:grid-cols-2">
          <article className="rounded-3xl border border-white/10 bg-slate-900/60 p-6">
            <h2 className="text-xl font-semibold">Our mission</h2>
            <p className="mt-3 text-sm text-slate-300">
              Create a single platform where commuters can discover routes, reserve seats, and receive digital tickets while
              transport authorities coordinate fleets across the island. We support Sinhala and English interfaces, offline-ready
              access, and seamless updates to travellers.
            </p>
          </article>
          <article className="rounded-3xl border border-white/10 bg-slate-900/60 p-6">
            <h2 className="text-xl font-semibold">Why it matters</h2>
            <p className="mt-3 text-sm text-slate-300">
              Sri Lanka&apos;s intercity network connects millions daily. By modernising ticketing, we reduce queues, support contactless
              journeys, and provide real-time data for better planning, maintenance, and emergency response.
            </p>
          </article>
        </section>

        <section className="rounded-3xl border border-white/10 bg-slate-900/60 p-6">
          <h2 className="text-xl font-semibold">Key features</h2>
          <ul className="mt-4 grid gap-3 text-sm text-slate-300 md:grid-cols-2">
            <li className="rounded-xl border border-white/10 bg-slate-950/80 p-4">
              • Smart route search with Sinhala/English support
            </li>
            <li className="rounded-xl border border-white/10 bg-slate-950/80 p-4">
              • Seat reservations with instant e-ticket receipts
            </li>
            <li className="rounded-xl border border-white/10 bg-slate-950/80 p-4">
              • Role-based dashboards for passengers, drivers, owners, and administrators
            </li>
            <li className="rounded-xl border border-white/10 bg-slate-950/80 p-4">
              • Firebase-backed real-time updates and secure authentication
            </li>
          </ul>
        </section>

        <section className="rounded-3xl border border-white/10 bg-slate-900/60 p-6">
          <h2 className="text-xl font-semibold">Built as a PWA</h2>
          <p className="mt-3 text-sm text-slate-300">
            Install iBus Sri Lanka on your phone or desktop for offline access to saved tickets and route details. Our progressive
            web app works with low bandwidth connections and offers push notification hooks for future service alerts.
          </p>
        </section>
      </div>
    </main>
  );
}
