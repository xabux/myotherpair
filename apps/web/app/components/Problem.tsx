const PROBLEMS = [
  {
    n: '01',
    title: 'Paying double for half a pair',
    body: 'Millions buy two full pairs just to get the one shoe they need. The other sits unused — or gets thrown away.',
    stat: '$300+',
    statLabel: 'wasted per pair on average',
  },
  {
    n: '02',
    title: 'No platform built for this',
    body: 'eBay and Facebook Marketplace weren\'t built to match by foot size, side, and model. Finding a match used to mean months of searching.',
    stat: '300M+',
    statLabel: 'amputees worldwide with no solution',
  },
  {
    n: '03',
    title: 'A problem hiding in plain sight',
    body: '1 in 4 people have different-sized feet. Amputees, stroke survivors, and people with foot conditions face this daily — shoe brands still ignore it.',
    stat: '1 in 4',
    statLabel: 'people affected',
  },
];

export default function Problem() {
  return (
    <section id="about" className="bg-dark-800 py-20 px-6">
      <div className="max-w-5xl mx-auto">

        <div className="max-w-2xl mb-14">
          <p className="text-sm font-bold text-gradient mb-4 tracking-wider uppercase">
            The problem
          </p>
          <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-[1.08] mb-5">
            The shoe industry was never built for everyone.
          </h2>
          <p className="text-lg text-white/50 leading-relaxed">
            Millions live with a problem the market ignores. We're here to fix that.
          </p>
        </div>

        <div className="divide-y divide-white/5">
          {PROBLEMS.map(({ n, title, body, stat, statLabel }) => (
            <div
              key={n}
              className="py-10 grid sm:grid-cols-[3rem_1fr] md:grid-cols-[3rem_1fr_9rem] gap-x-10 gap-y-4 items-start group"
            >
              <span className="text-xs font-bold text-gradient tracking-widest pt-1">{n}</span>

              <div>
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-gradient transition-colors">{title}</h3>
                <p className="text-sm text-white/50 leading-relaxed">{body}</p>
              </div>

              <div className="sm:col-start-2 md:col-start-auto md:text-right">
                <p className="text-4xl font-extrabold text-gradient leading-none mb-1">{stat}</p>
                <p className="text-xs text-white/30 leading-snug">{statLabel}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
