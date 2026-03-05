const STEPS = [
  {
    n: '01',
    title: 'Create your profile',
    body: "Tell us which foot, your size, what you need. Under two minutes.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
  {
    n: '02',
    title: 'List your spare shoe',
    body: 'Photo, size, condition, foot side. Sell, swap, or give it away.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
      </svg>
    ),
  },
  {
    n: '03',
    title: 'Get matched instantly',
    body: 'Same shoe, opposite foot, matching size — we find your perfect complement.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-dark-900 py-20 px-6">
      <div className="max-w-5xl mx-auto">

        <div className="text-center max-w-xl mx-auto mb-14">
          <p className="text-sm font-bold text-gradient mb-3 tracking-wider uppercase">How it works</p>
          <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-[1.08]">
            Three steps to your match.
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {STEPS.map(({ n, title, body, icon }) => (
            <div
              key={n}
              className="relative bg-dark-800 border border-white/5 rounded-3xl p-7 hover:border-white/10 transition-colors group overflow-hidden"
            >
              {/* Gradient corner glow on hover */}
              <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-0 group-hover:opacity-10 transition-opacity" style={{ background: 'radial-gradient(circle, #fd267a, transparent)' }} aria-hidden="true" />

              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white mb-5" style={{ background: 'linear-gradient(to bottom right, #fd267a, #ff6036)' }}>
                {icon}
              </div>
              <p className="text-xs font-bold text-white/20 tracking-widest mb-2">{n}</p>
              <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
              <p className="text-sm text-white/50 leading-relaxed">{body}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <a href="/login" className="inline-flex items-center gap-2 bg-tinder text-white text-sm font-bold px-8 py-4 rounded-full hover:opacity-90 active:scale-[.97] transition-all shadow-glow">
            Start matching now
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </div>

      </div>
    </section>
  );
}
