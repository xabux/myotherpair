'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import ThemeToggle from '../components/ThemeToggle';
import { supabase } from '../../lib/supabase';

// ─── Types ────────────────────────────────────────────────────────────────────

type SizeSystem = 'US' | 'UK' | 'EU';
type Gender     = 'mens' | 'womens';
interface SizeConvRow { us: number; uk: number; eu: number }

// ─── Conversion tables ────────────────────────────────────────────────────────

const MENS_TABLE: SizeConvRow[] = [
  { us: 4,    uk: 3.5,  eu: 36 }, { us: 4.5,  uk: 4,    eu: 37 },
  { us: 5,    uk: 4.5,  eu: 37 }, { us: 5.5,  uk: 5,    eu: 38 },
  { us: 6,    uk: 5.5,  eu: 38 }, { us: 6.5,  uk: 6,    eu: 39 },
  { us: 7,    uk: 6.5,  eu: 40 }, { us: 7.5,  uk: 7,    eu: 40 },
  { us: 8,    uk: 7.5,  eu: 41 }, { us: 8.5,  uk: 8,    eu: 41 },
  { us: 9,    uk: 8.5,  eu: 42 }, { us: 9.5,  uk: 9,    eu: 42 },
  { us: 10,   uk: 9.5,  eu: 43 }, { us: 10.5, uk: 10,   eu: 43 },
  { us: 11,   uk: 10.5, eu: 44 }, { us: 11.5, uk: 11,   eu: 45 },
  { us: 12,   uk: 11.5, eu: 45 }, { us: 12.5, uk: 12,   eu: 46 },
  { us: 13,   uk: 12.5, eu: 46 }, { us: 13.5, uk: 13,   eu: 47 },
  { us: 14,   uk: 13.5, eu: 47 }, { us: 14.5, uk: 14,   eu: 48 },
  { us: 15,   uk: 14.5, eu: 48 }, { us: 15.5, uk: 15,   eu: 49 },
  { us: 16,   uk: 15.5, eu: 50 },
];

const WOMENS_TABLE: SizeConvRow[] = [
  { us: 4,    uk: 2,    eu: 34 }, { us: 4.5,  uk: 2.5,  eu: 35 },
  { us: 5,    uk: 3,    eu: 35 }, { us: 5.5,  uk: 3.5,  eu: 36 },
  { us: 6,    uk: 4,    eu: 36 }, { us: 6.5,  uk: 4.5,  eu: 37 },
  { us: 7,    uk: 5,    eu: 37 }, { us: 7.5,  uk: 5.5,  eu: 38 },
  { us: 8,    uk: 6,    eu: 38 }, { us: 8.5,  uk: 6.5,  eu: 39 },
  { us: 9,    uk: 7,    eu: 39 }, { us: 9.5,  uk: 7.5,  eu: 40 },
  { us: 10,   uk: 8,    eu: 40 }, { us: 10.5, uk: 8.5,  eu: 41 },
  { us: 11,   uk: 9,    eu: 41 }, { us: 11.5, uk: 9.5,  eu: 42 },
  { us: 12,   uk: 10,   eu: 42 }, { us: 12.5, uk: 10.5, eu: 43 },
  { us: 13,   uk: 11,   eu: 43 }, { us: 13.5, uk: 11.5, eu: 44 },
  { us: 14,   uk: 12,   eu: 44 },
];

// ─── Size helpers ─────────────────────────────────────────────────────────────

function getSizeRange(system: SizeSystem, gender: Gender): number[] {
  if (system === 'EU') return Array.from({ length: 17 }, (_, i) => 36 + i);
  if (system === 'UK') { const o: number[] = []; for (let s = 3; s <= 15; s += 0.5) o.push(s); return o; }
  const max = gender === 'mens' ? 16 : 14;
  const o: number[] = []; for (let s = 4; s <= max; s += 0.5) o.push(s); return o;
}

function getTable(g: Gender) { return g === 'mens' ? MENS_TABLE : WOMENS_TABLE; }

function findConvExact(v: number, sys: SizeSystem, g: Gender): SizeConvRow | null {
  const key = sys.toLowerCase() as keyof SizeConvRow;
  return getTable(g).find(r => r[key] === v) ?? null;
}

function remapSize(v: number | null, from: SizeSystem, to: SizeSystem, g: Gender): number | null {
  if (v === null) return null;
  const fk = from.toLowerCase() as keyof SizeConvRow, tk = to.toLowerCase() as keyof SizeConvRow;
  let best: SizeConvRow | null = null, bd = Infinity;
  for (const r of getTable(g)) { const d = Math.abs((r[fk] as number) - v); if (d < bd) { bd = d; best = r; } }
  if (!best) return null;
  const cv = best[tk] as number;
  const range = getSizeRange(to, g);
  let nearest: number | null = null, nd = Infinity;
  for (const s of range) { const d = Math.abs(s - cv); if (d < nd) { nd = d; nearest = s; } }
  return nearest;
}

function fmt(n: number) { return String(n); }

// ─── Static data ──────────────────────────────────────────────────────────────

const BRANDS = ['Nike','Adidas','Jordan','New Balance','Vans','Converse','Timberland','Puma','Reebok','Other'];

// US, UK, and all 27 EU member states only
const PHONE_COUNTRIES = [
  { code: 'US', dial: '+1',   name: 'United States',  flag: '🇺🇸' },
  { code: 'GB', dial: '+44',  name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'AT', dial: '+43',  name: 'Austria',        flag: '🇦🇹' },
  { code: 'BE', dial: '+32',  name: 'Belgium',        flag: '🇧🇪' },
  { code: 'BG', dial: '+359', name: 'Bulgaria',       flag: '🇧🇬' },
  { code: 'HR', dial: '+385', name: 'Croatia',        flag: '🇭🇷' },
  { code: 'CY', dial: '+357', name: 'Cyprus',         flag: '🇨🇾' },
  { code: 'CZ', dial: '+420', name: 'Czech Republic', flag: '🇨🇿' },
  { code: 'DK', dial: '+45',  name: 'Denmark',        flag: '🇩🇰' },
  { code: 'EE', dial: '+372', name: 'Estonia',        flag: '🇪🇪' },
  { code: 'FI', dial: '+358', name: 'Finland',        flag: '🇫🇮' },
  { code: 'FR', dial: '+33',  name: 'France',         flag: '🇫🇷' },
  { code: 'DE', dial: '+49',  name: 'Germany',        flag: '🇩🇪' },
  { code: 'GR', dial: '+30',  name: 'Greece',         flag: '🇬🇷' },
  { code: 'HU', dial: '+36',  name: 'Hungary',        flag: '🇭🇺' },
  { code: 'IE', dial: '+353', name: 'Ireland',        flag: '🇮🇪' },
  { code: 'IT', dial: '+39',  name: 'Italy',          flag: '🇮🇹' },
  { code: 'LV', dial: '+371', name: 'Latvia',         flag: '🇱🇻' },
  { code: 'LT', dial: '+370', name: 'Lithuania',      flag: '🇱🇹' },
  { code: 'LU', dial: '+352', name: 'Luxembourg',     flag: '🇱🇺' },
  { code: 'MT', dial: '+356', name: 'Malta',          flag: '🇲🇹' },
  { code: 'NL', dial: '+31',  name: 'Netherlands',    flag: '🇳🇱' },
  { code: 'PL', dial: '+48',  name: 'Poland',         flag: '🇵🇱' },
  { code: 'PT', dial: '+351', name: 'Portugal',       flag: '🇵🇹' },
  { code: 'RO', dial: '+40',  name: 'Romania',        flag: '🇷🇴' },
  { code: 'SK', dial: '+421', name: 'Slovakia',       flag: '🇸🇰' },
  { code: 'SI', dial: '+386', name: 'Slovenia',       flag: '🇸🇮' },
  { code: 'ES', dial: '+34',  name: 'Spain',          flag: '🇪🇸' },
  { code: 'SE', dial: '+46',  name: 'Sweden',         flag: '🇸🇪' },
];

const COUNTRIES = [
  'Australia','Brazil','Canada','China','Denmark','France','Germany','India','Ireland','Italy',
  'Japan','Mexico','Netherlands','New Zealand','Nigeria','Norway','South Africa','South Korea',
  'Spain','Sweden','United Kingdom','United States','Other',
];

// ─── Form state ───────────────────────────────────────────────────────────────

interface FormState {
  firstName:string; lastName:string; email:string; password:string; confirm:string;
  countryCode:string; phone:string; dob:string;
  street1:string; street2:string; city:string; state:string; postal:string; country:string;
  sizeSystem:SizeSystem; gender:Gender;
  leftSize:number|null; rightSize:number|null; sameSize:boolean;
  brands:string[];
}
type Errors = Partial<Record<keyof FormState, string>>;

const INIT: FormState = {
  firstName:'',lastName:'',email:'',password:'',confirm:'',
  countryCode:'+1',phone:'',dob:'',
  street1:'',street2:'',city:'',state:'',postal:'',country:'',
  sizeSystem:'US',gender:'mens',leftSize:null,rightSize:null,sameSize:false,brands:[],
};

function validate(step: number, f: FormState): Errors {
  const e: Errors = {};
  if (step === 1) {
    if (!f.firstName.trim())  e.firstName = 'Required';
    if (!f.lastName.trim())   e.lastName  = 'Required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) e.email = 'Valid email required';
    if (f.password.length < 8)    e.password = 'Min. 8 characters';
    if (f.confirm !== f.password) e.confirm  = "Passwords don't match";
    if (!f.phone.trim()) e.phone = 'Required';
    if (!f.dob)          e.dob   = 'Required';
  }
  if (step === 2) {
    if (!f.street1.trim()) e.street1 = 'Required';
    if (!f.city.trim())    e.city    = 'Required';
    if (!f.state.trim())   e.state   = 'Required';
    if (!f.postal.trim())  e.postal  = 'Required';
    if (!f.country)        e.country = 'Required';
  }
  if (step === 3) {
    if (f.leftSize === null)  e.leftSize  = 'Select a size';
    if (f.rightSize === null) e.rightSize = 'Select a size';
    if (!f.brands.length)     e.brands    = 'Select at least one';
  }
  return e;
}

// ─── Shared styles ────────────────────────────────────────────────────────────

const field = (hasErr?: boolean) =>
  `w-full bg-white/5 border ${hasErr
    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
    : 'border-white/10 focus:border-brand-500 focus:ring-brand-500'
  } text-white placeholder-white/25 text-sm px-4 py-3.5 rounded-2xl outline-none focus:ring-1 transition-colors`;

const lbl = 'block text-xs font-semibold text-white/50 mb-2';
const errMsg = 'text-xs text-red-400 mt-1.5';

// ─── EyeIcon ──────────────────────────────────────────────────────────────────

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
    </svg>
  ) : (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );
}

// ─── Phone country dropdown ───────────────────────────────────────────────────

function PhoneCountrySelect({ value, onChange }: { value: string; onChange: (dial: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  const selected = PHONE_COUNTRIES.find(c => c.dial === value) ?? PHONE_COUNTRIES[0];

  return (
    <div ref={ref} className="relative flex-shrink-0">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 bg-white/5 border border-white/10 text-white text-sm px-3 py-3.5 rounded-2xl hover:bg-white/10 transition-colors w-32"
      >
        <img src={`https://flagcdn.com/w20/${selected.code.toLowerCase()}.png`} alt={selected.name} className="w-5 h-auto rounded-sm flex-shrink-0" />
        <span className="font-bold text-xs tracking-wide">{selected.code}</span>
        <svg className={`w-3 h-3 text-white/30 ml-auto flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-dark-800 border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-50">
          <div className="max-h-64 overflow-y-auto">
            {PHONE_COUNTRIES.map(c => (
              <button
                key={c.dial}
                type="button"
                onClick={() => { onChange(c.dial); setOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 transition-colors text-left ${
                  c.dial === value ? 'bg-white/5' : ''
                }`}
              >
                <img src={`https://flagcdn.com/w20/${c.code.toLowerCase()}.png`} alt={c.name} className="w-5 h-auto rounded-sm flex-shrink-0" />
                <span className="font-bold text-xs tracking-wide text-white w-7">{c.code}</span>
                <span className="text-white/50 text-xs truncate">{c.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── SizeGrid ─────────────────────────────────────────────────────────────────

function SizeGrid({ sizes, selected, onSelect, error }: {
  sizes: number[]; selected: number|null; onSelect: (v: number) => void; error?: string;
}) {
  return (
    <div>
      <div className="grid grid-cols-6 gap-2">
        {sizes.map(size => {
          const active = selected === size;
          return (
            <button key={size} type="button" onClick={() => onSelect(size)}
              className={`h-11 text-xs font-bold rounded-xl border transition-all ${
                active
                  ? 'border-brand-500 text-white'
                  : 'border-white/10 bg-white/5 text-white/50 hover:bg-white/10 hover:border-white/30 hover:text-white'
              }`}
              style={active ? { background: 'linear-gradient(to right,#fd267a,#ff6036)' } : {}}
            >
              {fmt(size)}
            </button>
          );
        })}
      </div>
      {error && <p className={errMsg}>{error}</p>}
    </div>
  );
}

// ─── ConvBadge ────────────────────────────────────────────────────────────────

function ConvBadge({ row }: { row: SizeConvRow }) {
  const items = [`US ${fmt(row.us)}`, `UK ${fmt(row.uk)}`, `EU ${row.eu}`];
  return (
    <div className="flex items-center gap-1.5 mt-2.5" style={{ animation: 'pop-in 0.2s ease-out' }}>
      {items.map((label, i) => (
        <span key={label} className="flex items-center gap-1.5">
          <span className="text-[10px] px-2 py-0.5 bg-white/5 border border-white/10 rounded-full text-white/40 font-medium">{label}</span>
          {i < 2 && <span className="text-white/20 text-[10px]">→</span>}
        </span>
      ))}
    </div>
  );
}

// ─── Sidebar step list ────────────────────────────────────────────────────────

const TOTAL_STEPS = 4;
const STEP_LABELS  = ['You', 'Location', 'Your feet', 'Photo'];
const STEP_SUBLABELS = ['Personal details', 'Where you live', 'Shoe sizes', 'Optional'];

function SidebarSteps({ step }: { step: number }) {
  return (
    <nav className="flex flex-col">
      {STEP_LABELS.map((label, i) => {
        const done    = i + 1 < step;
        const current = i + 1 === step;
        return (
          <div key={label} className="flex gap-4">
            {/* Circle + connector */}
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 border-2 transition-all duration-300 ${
                  done    ? 'border-transparent text-white' :
                  current ? 'border-brand-500 bg-transparent text-brand-500' :
                            'border-white/15 text-white/25'
                }`}
                style={done ? { background: 'linear-gradient(to right,#fd267a,#ff6036)' } : {}}
              >
                {done ? (
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                ) : i + 1}
              </div>
              {i < TOTAL_STEPS - 1 && (
                <div className={`w-px flex-1 my-1.5 min-h-[36px] transition-colors duration-500 ${done ? '' : 'bg-white/10'}`}
                  style={done ? { background: 'linear-gradient(to bottom,#fd267a,#ff6036)' } : {}} />
              )}
            </div>
            {/* Text */}
            <div className={`pt-1 ${i < TOTAL_STEPS - 1 ? 'pb-10' : ''}`}>
              <p className={`text-sm font-semibold leading-tight transition-colors ${
                current ? 'text-white' : done ? 'text-white/50' : 'text-white/25'
              }`}>{label}</p>
              {current && (
                <p className="text-xs text-white/35 mt-0.5">{STEP_SUBLABELS[i]}</p>
              )}
            </div>
          </div>
        );
      })}
    </nav>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function SignUpPage() {
  const router = useRouter();

  const [step,      setStep]      = useState(1);
  const [direction, setDirection] = useState<'right'|'left'>('right');
  const [animKey,   setAnimKey]   = useState(0);
  const [form,      setForm]      = useState<FormState>(INIT);
  const [errors,    setErrors]    = useState<Errors>({});
  const [showPass,  setShowPass]  = useState(false);
  const [showConf,  setShowConf]  = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [done,      setDone]      = useState(false);
  const [photoUrl,  setPhotoUrl]  = useState<string|null>(null);
  const [photoFile, setPhotoFile] = useState<File|null>(null);
  const [authError, setAuthError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  // ── OTP state ──────────────────────────────────────────────────────────────
  const [otpMode,    setOtpMode]    = useState(false);
  const [otpMethod,  setOtpMethod]  = useState<'email'|'phone'|null>(null);
  const [otp,        setOtp]        = useState(['','','','','','']);
  const [otpError,   setOtpError]   = useState<string | null>(null);
  const [otpSuccess, setOtpSuccess] = useState(false);
  const [resendSecs, setResendSecs] = useState(0);
  const otpInputs = useRef<(HTMLInputElement|null)[]>([]);

  const startResendTimer = useCallback(() => {
    setResendSecs(30);
    const id = setInterval(() => {
      setResendSecs(s => { if (s <= 1) { clearInterval(id); return 0; } return s - 1; });
    }, 1000);
  }, []);

  const chooseOtpMethod = async (method: 'email'|'phone') => {
    setOtpMethod(method);
    setOtp(['','','','','','','','']);
    setOtpError(null);
    if (method === 'phone') {
      const fullPhone = form.countryCode + form.phone.replace(/\D/g, '');
      await supabase.auth.signInWithOtp({ phone: fullPhone });
    }
    startResendTimer();
    setTimeout(() => otpInputs.current[0]?.focus(), 100);
  };

  const handleOtpInput = (i: number, val: string) => {
    if (!/^[0-9]?$/.test(val)) return;
    const next = [...otp];
    next[i] = val;
    setOtp(next);
    setOtpError(null);
    if (val && i < 5) otpInputs.current[i + 1]?.focus();
    // Auto-verify when all 8 filled
    if (next.every(d => d !== '') && val) {
      verifyOtp(next);
    }
  };

  const handleOtpKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) {
      otpInputs.current[i - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (text.length === 6) {
      const next = text.split('');
      setOtp(next);
      setOtpError(null);
      setTimeout(() => verifyOtp(next), 50);
    }
  };

  const verifyOtp = async (digits: string[]) => {
    const code = digits.join('');
    if (code.length < 6) return;

    let result;
    if (otpMethod === 'phone') {
      const fullPhone = form.countryCode + form.phone.replace(/\D/g, '');
      result = await supabase.auth.verifyOtp({ phone: fullPhone, token: code, type: 'sms' });
    } else {
      result = await supabase.auth.verifyOtp({ email: form.email, token: code, type: 'signup' });
    }

    if (result.error) {
      setOtpError('Wrong code — try again');
      setOtp(['','','','','','']);
      setTimeout(() => otpInputs.current[0]?.focus(), 50);
      return;
    }

    const userId = result.data.user?.id;
    if (userId) {
      // Insert user row
      const location = [form.city, form.state, form.country].filter(Boolean).join(', ');
      await supabase.from('users').insert({
        id:             userId,
        name:           [form.firstName, form.lastName].filter(Boolean).join(' '),
        email:          form.email,
        foot_size_left:  form.leftSize  || null,
        foot_size_right: form.rightSize || null,
        location:       location || null,
      });

      // Upload avatar if provided
      if (photoFile) {
        const ext  = photoFile.name.split('.').pop() ?? 'jpg';
        const path = `${userId}/avatar.${ext}`;
        const { data: stored } = await supabase.storage
          .from('avatars')
          .upload(path, photoFile, { upsert: true });
        if (stored) {
          const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path);
          await supabase.from('users').update({ avatar_url: publicUrl }).eq('id', userId);
        }
      }
    }

    setOtpSuccess(true);
    setTimeout(() => router.push('/app'), 1200);
  };

  const submitOtp = () => verifyOtp(otp);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm(f => ({ ...f, [k]: v }));

  const advance = (n: number, dir: 'right'|'left') => {
    setDirection(dir); setAnimKey(k => k + 1); setStep(n);
  };

  const goNext = () => {
    const e = validate(step, form);
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({}); advance(step + 1, 'right');
  };

  const goBack = () => { setErrors({}); advance(step - 1, 'left'); };

  const handleSubmit = async () => {
    setLoading(true);
    setAuthError('');
    const { error } = await supabase.auth.signUp({
      email:    form.email,
      password: form.password,
      options:  { data: { first_name: form.firstName, last_name: form.lastName } },
    });
    setLoading(false);
    if (error) { setAuthError(error.message); return; }
    setOtpMode(true);
  };

  const handleSystemChange = (sys: SizeSystem) => {
    setForm(f => {
      const l = remapSize(f.leftSize, f.sizeSystem, sys, f.gender);
      const r = f.sameSize ? l : remapSize(f.rightSize, f.sizeSystem, sys, f.gender);
      return { ...f, sizeSystem: sys, leftSize: l, rightSize: r };
    });
  };

  const handleGenderChange = (g: Gender) =>
    setForm(f => ({ ...f, gender: g, leftSize: null, rightSize: null }));

  const applyPhoto = (file: File) => {
    if (photoUrl) URL.revokeObjectURL(photoUrl);
    setPhotoUrl(URL.createObjectURL(file));
    setPhotoFile(file);
  };

  const removePhoto = () => {
    if (photoUrl) URL.revokeObjectURL(photoUrl);
    setPhotoUrl(null);
    setPhotoFile(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  const sizeRange = getSizeRange(form.sizeSystem, form.gender);
  const leftConv  = form.leftSize  !== null ? findConvExact(form.leftSize,  form.sizeSystem, form.gender) : null;
  const rightConv = form.rightSize !== null ? findConvExact(form.rightSize, form.sizeSystem, form.gender) : null;

  const animStyle: React.CSSProperties = {
    animation: `${direction === 'right' ? 'step-enter-right' : 'step-enter-left'} 0.28s ease-out both`,
  };

  const segBtn = (active: boolean) =>
    `px-4 py-2 text-xs font-bold rounded-xl transition-all ${active ? 'text-white' : 'text-white/40 hover:text-white/70'}`;

  const chipCls = (active: boolean) =>
    `px-3.5 py-1.5 text-xs font-semibold rounded-full border transition-all cursor-pointer ${
      active ? 'border-brand-500 text-white' : 'border-white/10 bg-white/5 text-white/50 hover:border-white/30'
    }`;

  return (
    <div className="flex min-h-screen bg-dark-900">

      {/* ══ Sidebar ══════════════════════════════════════════════════════════ */}
      <aside className="hidden lg:flex w-72 xl:w-80 flex-shrink-0 flex-col bg-dark-800 border-r border-white/5 px-8 py-10 sticky top-0 h-screen">
        {/* Logo + toggle */}
        <div className="flex items-center justify-between mb-14">
          <a href="/" aria-label="Home">
            <span className="text-xl font-extrabold tracking-tight">
              <span className="text-white">myother</span><span className="text-brand-500">pair</span>
            </span>
          </a>
          <ThemeToggle />
        </div>

        {/* Step list */}
        <div className="flex-1">
          <SidebarSteps step={done ? TOTAL_STEPS + 1 : step} />
        </div>

        {/* Footer tagline */}
        <p className="text-xs text-white/20 leading-relaxed">
          Every shoe deserves a match.
        </p>
      </aside>

      {/* ══ Main content ═════════════════════════════════════════════════════ */}
      <main className="flex-1 flex flex-col min-h-screen">

        {/* Mobile top bar */}
        <div className="lg:hidden flex items-center justify-between px-6 py-5 border-b border-white/5 bg-dark-800">
          <a href="/" aria-label="Home">
            <span className="text-xl font-extrabold tracking-tight">
              <span className="text-white">myother</span><span className="text-brand-500">pair</span>
            </span>
          </a>
          <ThemeToggle />
        </div>

        {/* Mobile progress bar */}
        {!done && (
          <div className="lg:hidden px-6 pt-5 pb-1">
            <div className="flex justify-between mb-2">
              {STEP_LABELS.map((label, i) => (
                <span key={label} className={`text-[11px] font-semibold ${i + 1 <= step ? 'text-brand-500' : 'text-white/25'}`}>
                  {i + 1}. {label}
                </span>
              ))}
            </div>
            <div className="h-1 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-500 ease-out"
                style={{ width: `${(step / TOTAL_STEPS) * 100}%`, background: 'linear-gradient(to right,#fd267a,#ff6036)' }} />
            </div>
          </div>
        )}

        {/* ── Form region ── */}
        <div className="flex-1 flex flex-col justify-center px-6 sm:px-10 md:px-16 xl:px-24 py-12">
          <div className="w-full max-w-2xl mx-auto">

            {otpMode ? (
              /* ── OTP Verification ─────────────────────────────────────── */
              <div className="flex flex-col items-center text-center py-12 max-w-md mx-auto w-full"
                style={{ animation: 'step-enter-right 0.35s ease-out' }}>

                {otpSuccess ? (
                  /* Success */
                  <>
                    <div className="w-24 h-24 rounded-full flex items-center justify-center mb-8"
                      style={{ background: 'linear-gradient(135deg,#22c55e,#16a34a)', animation: 'pop-in 0.5s cubic-bezier(0.175,0.885,0.32,1.275) both' }}>
                      <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h2 className="text-3xl font-extrabold text-white mb-3">Verified!</h2>
                    <p className="text-white/40 mb-2">Taking you to your dashboard…</p>
                    <div className="flex gap-1 mt-4">
                      {[0,1,2].map(i => (
                        <div key={i} className="w-2 h-2 rounded-full bg-green-500 animate-bounce"
                          style={{ animationDelay: `${i * 0.15}s` }} />
                      ))}
                    </div>
                  </>
                ) : otpMethod === null ? (
                  /* Method choice */
                  <>
                    <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-8 text-3xl">
                      ✉️
                    </div>
                    <h2 className="text-3xl font-extrabold text-white mb-3">Verify your account</h2>
                    <p className="text-white/40 mb-10 leading-relaxed max-w-xs">
                      We'll send a 6-digit code to confirm it's really you.
                    </p>
                    <div className="flex flex-col gap-3 w-full max-w-xs">
                      <button type="button" onClick={() => chooseOtpMethod('email')}
                        className="flex items-center gap-4 px-6 py-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-brand-500/50 rounded-2xl transition-all text-left group">
                        <span className="text-2xl">📧</span>
                        <div>
                          <p className="text-sm font-semibold text-white group-hover:text-brand-400 transition-colors">Send to email</p>
                          <p className="text-xs text-white/35 mt-0.5">{form.email || 'your@email.com'}</p>
                        </div>
                      </button>
                      <button type="button" onClick={() => chooseOtpMethod('phone')}
                        className="flex items-center gap-4 px-6 py-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-brand-500/50 rounded-2xl transition-all text-left group">
                        <span className="text-2xl">📱</span>
                        <div>
                          <p className="text-sm font-semibold text-white group-hover:text-brand-400 transition-colors">Send to phone</p>
                          <p className="text-xs text-white/35 mt-0.5">{form.countryCode} {form.phone || '555 123 4567'}</p>
                        </div>
                      </button>
                    </div>
                  </>
                ) : (
                  /* OTP input */
                  <>
                    <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-8 text-3xl">
                      {otpMethod === 'email' ? '📧' : '📱'}
                    </div>
                    <h2 className="text-3xl font-extrabold text-white mb-3">Enter code</h2>
                    <p className="text-white/40 mb-8 leading-relaxed max-w-xs text-sm">
                      {otpMethod === 'email'
                        ? `Sent to ${form.email || 'your email'}`
                        : `Sent to ${form.countryCode} ${form.phone}`}
                    </p>

                    {/* 6-digit boxes */}
                    <div
                      className="flex gap-2 sm:gap-3 mb-6"
                      style={otpError ? { animation: 'shake 0.4s ease-out' } : {}}
                      onPaste={handleOtpPaste}
                    >
                      {otp.map((digit, i) => (
                        <input
                          key={i}
                          ref={el => { otpInputs.current[i] = el; }}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={e => handleOtpInput(i, e.target.value)}
                          onKeyDown={e => handleOtpKeyDown(i, e)}
                          className={`text-center text-xl font-bold rounded-2xl border bg-white/5 text-white outline-none transition-all ${
                            otpError
                              ? 'border-red-500 bg-red-500/10 text-red-400'
                              : digit
                                ? 'border-brand-500 bg-brand-500/10'
                                : 'border-white/15 focus:border-brand-500 focus:bg-white/8'
                          }`}
                          style={{ width: 'clamp(40px, 12vw, 52px)', height: 'clamp(48px, 14vw, 60px)' }}
                        />
                      ))}
                    </div>

                    {otpError && (
                      <p className="text-sm text-red-400 mb-6" style={{ animation: 'pop-in 0.2s ease-out' }}>
                        {otpError}
                      </p>
                    )}

                    <button type="button" onClick={submitOtp}
                      disabled={otp.some(d => !d)}
                      className="w-full max-w-xs py-3.5 text-sm font-bold text-white rounded-2xl transition-all disabled:opacity-40 active:scale-[.97] mb-6"
                      style={{ background: 'linear-gradient(to right,#fd267a,#ff6036)' }}>
                      Verify
                    </button>

                    <div className="flex items-center gap-2 text-sm text-white/30">
                      {resendSecs > 0 ? (
                        <span>Resend in {resendSecs}s</span>
                      ) : (
                        <>
                          <span>Didn't get it?</span>
                          <button type="button" onClick={() => startResendTimer()}
                            className="text-brand-500 hover:text-brand-400 font-semibold transition-colors">
                            Resend
                          </button>
                        </>
                      )}
                    </div>

                    <button type="button" onClick={() => setOtpMethod(null)}
                      className="mt-4 text-xs text-white/20 hover:text-white/40 transition-colors">
                      ← Change method
                    </button>
                  </>
                )}
              </div>
            ) : done ? (
              /* ── Legacy success (not reached now) ─────────────────────── */
              <div className="flex flex-col items-center text-center py-12" style={{ animation: 'step-enter-right 0.4s ease-out' }}>
                <div className="w-24 h-24 rounded-full flex items-center justify-center mb-8"
                  style={{ background: 'linear-gradient(to bottom right,#fd267a,#ff6036)', animation: 'pop-in 0.5s cubic-bezier(0.175,0.885,0.32,1.275) 0.1s both' }}>
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-4xl font-extrabold text-white mb-4">You're in.</h2>
                <p className="text-lg text-white/40 mb-10 leading-relaxed">Your account is ready. Time to find your pair.</p>
                <a href="/app"
                  className="inline-flex items-center gap-2 text-white text-sm font-bold px-8 py-4 rounded-2xl hover:opacity-90 active:scale-[.98] transition-all"
                  style={{ background: 'linear-gradient(to right,#fd267a,#ff6036)' }}>
                  Find my match
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </a>
              </div>
            ) : (
              <div key={animKey} style={animStyle} className="flex flex-col gap-10">

                {/* ════════ STEP 1 — About you ════════ */}
                {step === 1 && (
                  <>
                    <div>
                      <h1 className="text-3xl font-extrabold text-white mb-2">About you</h1>
                      <p className="text-base text-white/40">Let's start with the basics.</p>
                    </div>

                    <div className="flex flex-col gap-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="firstName" className={lbl}>First name</label>
                          <input id="firstName" type="text" value={form.firstName}
                            onChange={e => set('firstName', e.target.value)}
                            placeholder="Alex" className={field(!!errors.firstName)} />
                          {errors.firstName && <p className={errMsg}>{errors.firstName}</p>}
                        </div>
                        <div>
                          <label htmlFor="lastName" className={lbl}>Last name</label>
                          <input id="lastName" type="text" value={form.lastName}
                            onChange={e => set('lastName', e.target.value)}
                            placeholder="Johnson" className={field(!!errors.lastName)} />
                          {errors.lastName && <p className={errMsg}>{errors.lastName}</p>}
                        </div>
                      </div>

                      <div>
                        <label htmlFor="email" className={lbl}>Email address</label>
                        <input id="email" type="email" value={form.email}
                          onChange={e => set('email', e.target.value)}
                          placeholder="you@email.com" className={field(!!errors.email)} />
                        {errors.email && <p className={errMsg}>{errors.email}</p>}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="password" className={lbl}>Password</label>
                          <div className="relative">
                            <input id="password" type={showPass ? 'text' : 'password'} value={form.password}
                              onChange={e => set('password', e.target.value)} placeholder="Min. 8 characters"
                              className={field(!!errors.password) + ' pr-11'} />
                            <button type="button" onClick={() => setShowPass(v => !v)}
                              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors" aria-label="Toggle password">
                              <EyeIcon open={showPass} />
                            </button>
                          </div>
                          {errors.password && <p className={errMsg}>{errors.password}</p>}
                        </div>
                        <div>
                          <label htmlFor="confirm" className={lbl}>Confirm password</label>
                          <div className="relative">
                            <input id="confirm" type={showConf ? 'text' : 'password'} value={form.confirm}
                              onChange={e => set('confirm', e.target.value)} placeholder="Repeat password"
                              className={field(!!errors.confirm) + ' pr-11'} />
                            <button type="button" onClick={() => setShowConf(v => !v)}
                              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors" aria-label="Toggle password">
                              <EyeIcon open={showConf} />
                            </button>
                          </div>
                          {errors.confirm && <p className={errMsg}>{errors.confirm}</p>}
                        </div>
                      </div>

                      <div>
                        <label htmlFor="phone" className={lbl}>Phone number</label>
                        <div className="flex gap-3">
                          <PhoneCountrySelect value={form.countryCode} onChange={dial => set('countryCode', dial)} />
                          <input id="phone" type="tel" value={form.phone}
                            onChange={e => set('phone', e.target.value)}
                            placeholder="555 123 4567" className={field(!!errors.phone)} />
                        </div>
                        {errors.phone && <p className={errMsg}>{errors.phone}</p>}
                      </div>

                      <div className="max-w-xs">
                        <label htmlFor="dob" className={lbl}>Date of birth</label>
                        <input id="dob" type="date" value={form.dob}
                          onChange={e => set('dob', e.target.value)} className={field(!!errors.dob)} />
                        {errors.dob && <p className={errMsg}>{errors.dob}</p>}
                      </div>
                    </div>
                  </>
                )}

                {/* ════════ STEP 2 — Location ════════ */}
                {step === 2 && (
                  <>
                    <div>
                      <h1 className="text-3xl font-extrabold text-white mb-2">Where are you?</h1>
                      <p className="text-base text-white/40">Helps us surface nearby matches first.</p>
                    </div>

                    <div className="flex flex-col gap-6">
                      <div>
                        <label htmlFor="street1" className={lbl}>Street address</label>
                        <input id="street1" type="text" value={form.street1}
                          onChange={e => set('street1', e.target.value)}
                          placeholder="123 Main Street" className={field(!!errors.street1)} />
                        {errors.street1 && <p className={errMsg}>{errors.street1}</p>}
                      </div>

                      <div>
                        <label htmlFor="street2" className={lbl}>
                          Apt, suite, unit <span className="font-normal text-white/25">(optional)</span>
                        </label>
                        <input id="street2" type="text" value={form.street2}
                          onChange={e => set('street2', e.target.value)}
                          placeholder="Apt 4B" className={field()} />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="city" className={lbl}>City</label>
                          <input id="city" type="text" value={form.city}
                            onChange={e => set('city', e.target.value)}
                            placeholder="New York" className={field(!!errors.city)} />
                          {errors.city && <p className={errMsg}>{errors.city}</p>}
                        </div>
                        <div>
                          <label htmlFor="state" className={lbl}>State / Province</label>
                          <input id="state" type="text" value={form.state}
                            onChange={e => set('state', e.target.value)}
                            placeholder="NY" className={field(!!errors.state)} />
                          {errors.state && <p className={errMsg}>{errors.state}</p>}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="postal" className={lbl}>Postal / ZIP</label>
                          <input id="postal" type="text" value={form.postal}
                            onChange={e => set('postal', e.target.value)}
                            placeholder="10001" className={field(!!errors.postal)} />
                          {errors.postal && <p className={errMsg}>{errors.postal}</p>}
                        </div>
                        <div>
                          <label htmlFor="country" className={lbl}>Country</label>
                          <div className="relative">
                            <select id="country" value={form.country} onChange={e => set('country', e.target.value)}
                              className={`w-full bg-white/5 border ${errors.country ? 'border-red-500' : 'border-white/10 focus:border-brand-500'} text-white text-sm px-4 py-3.5 rounded-2xl outline-none focus:ring-1 focus:ring-brand-500 appearance-none transition-colors`}>
                              <option value="" className="bg-zinc-900">Select…</option>
                              {COUNTRIES.map(c => <option key={c} value={c} className="bg-zinc-900">{c}</option>)}
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-white/30">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </div>
                          </div>
                          {errors.country && <p className={errMsg}>{errors.country}</p>}
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* ════════ STEP 3 — Your feet ════════ */}
                {step === 3 && (
                  <>
                    <div>
                      <h1 className="text-3xl font-extrabold text-white mb-2">Your feet</h1>
                      <p className="text-base text-white/40">This is how we find your perfect match.</p>
                    </div>

                    <div className="flex flex-col gap-8">
                      {/* Controls */}
                      <div className="flex items-center gap-3 flex-wrap">
                        <div className="flex bg-white/5 rounded-2xl p-1 gap-1">
                          {(['mens','womens'] as Gender[]).map(g => (
                            <button key={g} type="button" onClick={() => handleGenderChange(g)}
                              className={segBtn(form.gender === g)}
                              style={form.gender === g ? { background:'linear-gradient(to right,#fd267a,#ff6036)' } : {}}>
                              {g === 'mens' ? "Men's" : "Women's"}
                            </button>
                          ))}
                        </div>
                        <div className="flex bg-white/5 rounded-2xl p-1 gap-1 ml-auto">
                          {(['US','UK','EU'] as SizeSystem[]).map(sys => (
                            <button key={sys} type="button" onClick={() => handleSystemChange(sys)}
                              className={segBtn(form.sizeSystem === sys)}
                              style={form.sizeSystem === sys ? { background:'linear-gradient(to right,#fd267a,#ff6036)' } : {}}>
                              {sys}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Same size */}
                      <label className="flex items-center gap-3 cursor-pointer -mt-2">
                        <div className="relative flex-shrink-0">
                          <input type="checkbox" checked={form.sameSize} className="sr-only"
                            onChange={e => setForm(f => ({
                              ...f, sameSize: e.target.checked,
                              rightSize: e.target.checked ? f.leftSize : f.rightSize,
                            }))} />
                          <div className={`w-5 h-5 rounded-md flex items-center justify-center border-2 transition-all ${
                            form.sameSize ? 'border-transparent' : 'bg-white/5 border-white/20'
                          }`} style={form.sameSize ? { background:'linear-gradient(to right,#fd267a,#ff6036)' } : {}}>
                            {form.sameSize && (
                              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                        </div>
                        <span className="text-sm text-white/50">My feet are the same size</span>
                      </label>

                      {/* Feet — side by side */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="flex flex-col gap-3">
                          <p className="text-sm font-semibold text-white/60">🦶 Left foot</p>
                          <SizeGrid sizes={sizeRange} selected={form.leftSize}
                            onSelect={size => setForm(f => ({ ...f, leftSize: size, rightSize: f.sameSize ? size : f.rightSize }))}
                            error={errors.leftSize} />
                          {leftConv && <ConvBadge row={leftConv} />}
                        </div>
                        <div className="flex flex-col gap-3" style={{ opacity: form.sameSize ? 0.4 : 1, pointerEvents: form.sameSize ? 'none' : 'auto' }}>
                          <p className="text-sm font-semibold text-white/60">
                            <span style={{ transform:'scaleX(-1)', display:'inline-block', marginRight:'4px' }}>🦶</span>
                            Right foot
                          </p>
                          <SizeGrid sizes={sizeRange} selected={form.rightSize}
                            onSelect={size => set('rightSize', size)}
                            error={errors.rightSize} />
                          {rightConv && <ConvBadge row={rightConv} />}
                        </div>
                      </div>

                      {/* Brands */}
                      <div>
                        <p className="text-sm font-semibold text-white/60 mb-3">Preferred brands</p>
                        <div className="flex flex-wrap gap-2">
                          {BRANDS.map(brand => {
                            const on = form.brands.includes(brand);
                            return (
                              <button key={brand} type="button"
                                onClick={() => set('brands', on ? form.brands.filter(b => b !== brand) : [...form.brands, brand])}
                                className={chipCls(on)}
                                style={on ? { background:'linear-gradient(to right,#fd267a,#ff6036)' } : {}}>
                                {brand}
                              </button>
                            );
                          })}
                        </div>
                        {errors.brands && <p className={errMsg}>{errors.brands}</p>}
                      </div>
                    </div>
                  </>
                )}

                {/* ════════ STEP 4 — Photo ════════ */}
                {step === 4 && (
                  <>
                    <div>
                      <h1 className="text-3xl font-extrabold text-white mb-2">Profile photo</h1>
                      <p className="text-base text-white/40">Optional — you can always add one later.</p>
                    </div>

                    <div className="flex flex-col gap-6">
                      <div
                        className="w-full rounded-3xl border-2 border-dashed border-white/15 flex flex-col items-center justify-center gap-5 py-20 cursor-pointer group hover:border-brand-500/50 hover:bg-white/[0.02] transition-all"
                        onClick={() => fileRef.current?.click()}
                        onDragOver={e => e.preventDefault()}
                        onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f?.type.startsWith('image/')) applyPhoto(f); }}
                      >
                        {photoUrl ? (
                          <div className="flex flex-col items-center gap-4">
                            <img src={photoUrl} alt="Preview" className="w-32 h-32 rounded-full object-cover ring-4 ring-white/10" />
                            <p className="text-sm text-white/50">Click to change</p>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-4 pointer-events-none">
                            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                              <svg className="w-8 h-8 text-white/30 group-hover:text-brand-500/70 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                            </div>
                            <div className="text-center">
                              <p className="text-sm text-white/50">
                                Drag & drop or <span className="text-brand-500 font-semibold">choose a file</span>
                              </p>
                              <p className="text-xs text-white/25 mt-1">JPEG, PNG or WebP · Max 5 MB</p>
                            </div>
                          </div>
                        )}
                      </div>

                      {photoUrl && (
                        <button type="button" onClick={removePhoto} className="text-xs text-white/25 hover:text-red-400 transition-colors text-center">
                          Remove photo
                        </button>
                      )}

                      <input ref={fileRef} type="file" accept="image/*" className="sr-only"
                        onChange={e => { const f = e.target.files?.[0]; if (f) applyPhoto(f); }} />
                    </div>
                  </>
                )}

                {/* ── Navigation ──────────────────────────────────────────── */}
                <div className="flex items-center justify-between pt-8 border-t border-white/5">
                  {step > 1 ? (
                    <button type="button" onClick={goBack}
                      className="flex items-center gap-2 px-5 py-3 text-sm font-semibold text-white/50 bg-white/5 hover:bg-white/10 rounded-2xl transition-all">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                      </svg>
                      Back
                    </button>
                  ) : (
                    <p className="text-sm text-white/30">
                      Have an account?{' '}
                      <a href="/login" className="font-semibold text-brand-500 hover:text-brand-400 transition-colors">Sign in</a>
                    </p>
                  )}

                  {authError && step === TOTAL_STEPS && (
                    <p className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-2.5 mb-2">{authError}</p>
                  )}

                  <div className="flex items-center gap-4">
                    {step === TOTAL_STEPS && !photoUrl && (
                      <button type="button" onClick={handleSubmit} disabled={loading}
                        className="text-sm text-white/30 hover:text-white/50 transition-colors">
                        Skip for now
                      </button>
                    )}
                    {step < TOTAL_STEPS ? (
                      <button type="button" onClick={goNext}
                        className="flex items-center gap-2 px-8 py-3.5 text-sm font-bold text-white rounded-2xl active:scale-[.97] transition-all"
                        style={{ background:'linear-gradient(to right,#fd267a,#ff6036)' }}>
                        Continue
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </button>
                    ) : (
                      <button type="button" onClick={handleSubmit} disabled={loading}
                        className="flex items-center gap-2 px-8 py-3.5 text-sm font-bold text-white rounded-2xl active:scale-[.97] transition-all disabled:opacity-60"
                        style={{ background:'linear-gradient(to right,#fd267a,#ff6036)' }}>
                        {loading ? (
                          <>
                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            Creating account…
                          </>
                        ) : 'Create my account'}
                      </button>
                    )}
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
