interface LogoProps {
  dark?: boolean; // true when on a dark background
}

export default function Logo({ dark = false }: LogoProps) {
  const legColor  = dark ? '#e5e7eb' : '#111827';
  const shoeColor = dark ? '#e5e7eb' : '#111827';

  return (
    <div className="flex items-center gap-2.5">
      {/* Mark — circle with two legs, one prosthetic */}
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Outer circle */}
        <circle cx="16" cy="15" r="13" stroke="#F05D23" strokeWidth="1.75" />

        {/* ── Left leg: natural ── */}
        {/* Upper leg */}
        <rect x="7.5" y="4" width="5" height="13" rx="2.5" fill={legColor} />
        {/* Shoe */}
        <path
          d="M4.5 19 Q4.5 17 8 17 L13 17 Q15 17 15 19.5 L15 21 Q15 22.5 12.5 22.5 L6.5 22.5 Q4.5 22.5 4.5 21Z"
          fill={shoeColor}
        />

        {/* ── Right leg: prosthetic ── */}
        {/* Upper leg */}
        <rect x="18" y="4" width="5" height="9" rx="2.5" fill="#F05D23" />
        {/* Knee joint */}
        <circle cx="20.5" cy="14" r="2" fill="#F05D23" />
        {/* Prosthetic blade */}
        <path
          d="M20.5 15.5 L23 22"
          stroke="#F05D23"
          strokeWidth="2.25"
          strokeLinecap="round"
        />
        {/* Shoe */}
        <path
          d="M17.5 19 Q17.5 17 21 17 L26.5 17 Q28.5 17 28.5 19.5 L28.5 21 Q28.5 22.5 26 22.5 L20 22.5 Q17.5 22.5 17.5 21Z"
          fill={shoeColor}
        />
      </svg>

      {/* Wordmark */}
      <span
        className={`font-bold text-[15px] tracking-tight ${dark ? 'text-white' : 'text-gray-900'}`}
      >
        myother<span className="text-brand-500">pair</span>
      </span>
    </div>
  );
}
