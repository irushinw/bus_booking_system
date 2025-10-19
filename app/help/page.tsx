const faq = [
  {
    question: "How do I book a seat?",
    answer:
      "Search for your route, choose available seats, select a travel date, and confirm the booking. You will receive a digital ticket immediately.",
  },
  {
    question: "Can I cancel my booking?",
    answer:
      "Yes. Go to the passenger dashboard, view upcoming journeys, and click 'Cancel booking'. Refund eligibility is shown per route.",
  },
  {
    question: "What if my bus is delayed?",
    answer:
      "Drivers use the emergency alert tool to notify owners and the transport board. Passengers receive updates on the dashboard.",
  },
  {
    question: "How do owners add buses?",
    answer:
      "Owners manage buses via the admin console. Admins can assign buses to drivers and routes through the Fleet overview section.",
  },
];

export default function HelpPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-5xl px-4 py-16 space-y-12">
        <header className="space-y-3 text-center">
          <h1 className="text-4xl font-semibold">Help & Support</h1>
          <p className="text-sm text-slate-300">
            Find answers to common questions about booking, dashboard features, and contact points for the Sri Lanka Transport Board.
          </p>
        </header>

        <section className="rounded-3xl border border-white/10 bg-slate-900/60 p-6">
          <h2 className="text-xl font-semibold">Frequently asked questions</h2>
          <div className="mt-6 space-y-4">
            {faq.map((item) => (
              <article key={item.question} className="rounded-2xl border border-white/10 bg-slate-950/80 p-4">
                <h3 className="text-lg font-semibold">{item.question}</h3>
                <p className="mt-2 text-sm text-slate-300">{item.answer}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-slate-900/60 p-6">
          <h2 className="text-xl font-semibold">Emergency hotline</h2>
          <p className="mt-3 text-sm text-slate-300">
            For urgent issues such as accidents, breakdowns, or security concerns, call the SLTB hotline <strong>1955</strong> or contact the
            nearest depot inspector. Drivers should also submit an emergency alert via their dashboard.
          </p>
        </section>
      </div>
    </main>
  );
}
