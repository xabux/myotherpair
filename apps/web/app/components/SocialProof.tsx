const STATS = [
  { value: '300M',   label: 'Amputees worldwide'        },
  { value: '1 in 4', label: 'Have mismatched foot sizes' },
  { value: '$300+',  label: 'Wasted per pair on average' },
  { value: '$0',     label: 'Listing fee, always'        },
];

const TESTIMONIALS = [
  { quote: "It's quite a rarity to be able to find that sole-mate. I have perfectly good shoes just sitting at home that I have to throw in the bin or not use at all." },
  { quote: "If we're able to buy just one shoe, there's a real benefit there — for amputees and for anyone with feet that are slightly different sizes." },
];

export default function SocialProof() {
  return (
    <section className="bg-dark-800 py-20 px-6">
      <div className="max-w-5xl mx-auto">

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16 pb-16 border-b border-white/5">
          {STATS.map(({ value, label }) => (
            <div key={label} className="text-center">
              <p className="text-4xl md:text-5xl font-extrabold text-gradient leading-none mb-2">{value}</p>
              <p className="text-sm text-white/40">{label}</p>
            </div>
          ))}
        </div>

        {/* Quotes */}
        <div className="grid md:grid-cols-2 gap-5 mb-12">
          {TESTIMONIALS.map(({ quote }, i) => (
            <figure key={i} className="bg-dark-900 border border-white/5 rounded-3xl p-8">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-4" style={{ background: 'linear-gradient(to bottom right, #fd267a, #ff6036)' }} aria-hidden="true">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 32 32">
                  <path d="M10 8c-3.3 0-6 2.7-6 6v10h10V14H7c0-1.7 1.3-3 3-3V8zm14 0c-3.3 0-6 2.7-6 6v10h10V14h-7c0-1.7 1.3-3 3-3V8z" />
                </svg>
              </div>
              <blockquote>
                <p className="text-lg text-white/80 leading-relaxed font-medium">"{quote}"</p>
              </blockquote>
            </figure>
          ))}
        </div>


      </div>
    </section>
  );
}
