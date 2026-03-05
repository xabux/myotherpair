const FEATURES = [
  { title: 'Smart matching',          body: 'Algorithm matches by brand, model, size, foot side, and condition. Zero irrelevant listings.' },
  { title: 'Secure payments',         body: 'Stripe escrow holds funds until your shoe arrives. Both parties always protected.' },
  { title: 'Built for amputees',      body: 'Single-shoe listings are first-class. Every feature designed for this community.' },
  { title: 'Location-based',          body: 'Find matches nearby. Local meetups and drop-offs fully supported.' },
  { title: 'Ratings & reviews',       body: 'Verified transactions and honest reviews build trust automatically.' },
  { title: 'Easy shipping',           body: 'Pre-paid labels, live tracking, and returns — all inside the platform.' },
];

export default function Features() {
  return (
    <section id="features" className="bg-dark-900 py-20 px-6">
      <div className="max-w-5xl mx-auto">

        <div className="text-center max-w-xl mx-auto mb-14">
          <p className="text-sm font-bold text-gradient mb-3 tracking-wider uppercase">Features</p>
          <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-[1.08]">
            Everything you need.
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map(({ title, body }) => (
            <div
              key={title}
              className="bg-dark-800 border border-white/5 hover:border-white/10 rounded-3xl p-6 group transition-all hover:shadow-card cursor-default"
            >
              <h3 className="text-base font-bold text-white mb-2 group-hover:text-gradient transition-all">{title}</h3>
              <p className="text-sm text-white/50 leading-relaxed">{body}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
