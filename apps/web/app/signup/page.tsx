'use client';

import { useState, useEffect, useMemo, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';
import { ArrowLeft, ArrowRight, Info, Eye, EyeOff, Check } from 'lucide-react';
import { Country, City } from 'country-state-city';
import { getPasswordStrength } from '../../lib/passwordStrength';
import { SUPPORTED_COUNTRY_CODES } from '../../lib/countries';
import {
  type SizeSystem,
  getSizes,
  formatSizeLabel,
  toUKCanonical,
  detectSizeSystem,
} from '../../lib/sizeConversion';

// ─── Password strength bar ────────────────────────────────────────────────────

function PasswordStrengthBar({ password }: { password: string }) {
  const result = useMemo(() => getPasswordStrength(password), [password]);
  if (!password) return null;

  return (
    <div className="mt-2 space-y-2">
      {/* 5-segment bar */}
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(i => (
          <div
            key={i}
            className={`flex-1 h-1 rounded-full transition-all duration-300 ${
              i <= result.score ? result.barColor : 'bg-border'
            }`}
          />
        ))}
      </div>
      {/* Label */}
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-x-2 gap-y-0.5">
          {result.checks.map(c => (
            <span
              key={c.label}
              className={`text-[10px] flex items-center gap-0.5 transition-colors ${
                c.pass ? 'text-green-500' : 'text-muted-foreground/60'
              }`}
            >
              {c.pass ? <Check className="h-2.5 w-2.5" /> : <span className="w-2.5 h-2.5 flex items-center justify-center text-[8px]">○</span>}
              {c.label}
            </span>
          ))}
        </div>
        {result.label && (
          <span className={`text-[10px] font-semibold shrink-0 ml-2 ${result.color}`}>
            {result.label}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Tooltip ──────────────────────────────────────────────────────────────────

function ConversionTooltip() {
  const [open, setOpen] = useState(false);
  return (
    <span className="relative inline-flex items-center">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="text-muted-foreground/50 hover:text-accent transition-colors"
        aria-label="Size conversion chart"
      >
        <Info className="h-3.5 w-3.5" />
      </button>
      {open && (
        <div className="absolute bottom-6 left-0 z-50 w-56 bg-card border border-border/40 rounded-xl shadow-lg p-3 text-[11px] text-foreground">
          <p className="font-semibold mb-2 text-[10px] uppercase tracking-widest text-muted-foreground">Quick reference</p>
          <table className="w-full border-collapse">
            <thead>
              <tr className="text-muted-foreground/60">
                <th className="text-left pb-1 font-medium">UK</th>
                <th className="text-left pb-1 font-medium">US</th>
                <th className="text-left pb-1 font-medium">EU</th>
              </tr>
            </thead>
            <tbody>
              {[
                { uk: '5', us: '6', eu: '38' },
                { uk: '6', us: '7', eu: '39' },
                { uk: '7', us: '8', eu: '41' },
                { uk: '8', us: '9', eu: '42' },
                { uk: '9', us: '10', eu: '43' },
                { uk: '10', us: '11', eu: '44' },
                { uk: '11', us: '12', eu: '45' },
              ].map(r => (
                <tr key={r.uk} className="border-t border-border/20">
                  <td className="py-0.5">{r.uk}</td>
                  <td className="py-0.5">{r.us}</td>
                  <td className="py-0.5">{r.eu}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-muted-foreground/50 mt-2 text-[10px]">Mens/unisex. Women's run ~1.5 sizes smaller in US.</p>
        </div>
      )}
    </span>
  );
}

// ─── Size system toggle ───────────────────────────────────────────────────────

interface SizeSystemToggleProps { value: SizeSystem; onChange: (v: SizeSystem) => void; }

function SizeSystemToggle({ value, onChange }: SizeSystemToggleProps) {
  return (
    <div className="flex gap-2">
      {(['UK', 'US', 'EU'] as SizeSystem[]).map(sys => (
        <button
          key={sys}
          type="button"
          onClick={() => onChange(sys)}
          className={`flex-1 h-11 rounded-xl text-sm font-semibold border transition-all duration-200 ${
            value === sys
              ? 'bg-accent text-accent-foreground border-accent shadow-sm'
              : 'bg-muted/50 text-muted-foreground border-border/30 hover:border-border'
          }`}
        >
          {sys}
        </button>
      ))}
    </div>
  );
}

// ─── Size select ──────────────────────────────────────────────────────────────

interface SizeSelectProps { system: SizeSystem; value: string; onChange: (v: string) => void; placeholder?: string; }

function SizeSelect({ system, value, onChange, placeholder = 'Select size' }: SizeSelectProps) {
  const sizes = getSizes(system);
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full h-12 rounded-xl bg-background border border-input text-sm text-foreground px-3 outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-colors appearance-none"
    >
      <option value="">{placeholder}</option>
      {sizes.map(s => <option key={s} value={s}>{formatSizeLabel(s, system)}</option>)}
    </select>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

interface FormState {
  firstName:     string;
  lastName:      string;
  email:         string;
  password:      string;
  countryCode:   string;
  city:          string;
  sizeSystem:    SizeSystem;
  leftFootSize:  string;
  rightFootSize: string;
  isAmputee:     boolean;
  amputeeSide:   '' | 'left' | 'right';
  neededFootSize: string;
}

const ALL_COUNTRIES = Country.getAllCountries().filter(c => SUPPORTED_COUNTRY_CODES.has(c.isoCode));

export default function SignupPage() {
  const router = useRouter();

  const [step,      setStep]      = useState(1);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState('');
  const [authError, setAuthError] = useState('');
  const [showPass,  setShowPass]  = useState(false);

  const [form, setForm] = useState<FormState>({
    firstName: '', lastName: '', email: '', password: '',
    countryCode: '', city: '',
    sizeSystem: 'UK',
    leftFootSize: '', rightFootSize: '',
    isAmputee: false, amputeeSide: '', neededFootSize: '',
  });

  useEffect(() => {
    setForm(p => ({ ...p, sizeSystem: detectSizeSystem() }));
  }, []);

  const cities = useMemo(() => {
    if (!form.countryCode) return [];
    return City.getCitiesOfCountry(form.countryCode) ?? [];
  }, [form.countryCode]);

  const update = (key: keyof FormState, value: string | boolean) =>
    setForm(p => ({ ...p, [key]: value }));

  const strength = useMemo(() => getPasswordStrength(form.password), [form.password]);

  // Step 1 → Step 2
  function handleStep1(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (!form.firstName.trim()) { setError('First name is required.'); return; }
    if (!form.lastName.trim())  { setError('Last name is required.'); return; }
    if (!form.email)            { setError('Email is required.'); return; }
    if (!form.countryCode)      { setError('Please select your country.'); return; }
    if (!form.city.trim())      { setError('Please enter your city.'); return; }
    if (strength.score < 3)     { setError('Password is too weak. Please use a stronger password.'); return; }
    setStep(2);
  }

  // Step 2 → submit
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    if (form.isAmputee) {
      if (!form.amputeeSide || !form.neededFootSize) {
        setError('Please select which foot you need and its size.'); return;
      }
    } else {
      if (!form.leftFootSize || !form.rightFootSize) {
        setError('Please select both foot sizes.'); return;
      }
    }

    setLoading(true);
    setAuthError('');

    const leftUK   = form.isAmputee ? null : toUKCanonical(form.leftFootSize, form.sizeSystem);
    const rightUK  = form.isAmputee ? null : toUKCanonical(form.rightFootSize, form.sizeSystem);
    const neededUK = form.isAmputee ? toUKCanonical(form.neededFootSize, form.sizeSystem) : null;
    const countryName  = ALL_COUNTRIES.find(c => c.isoCode === form.countryCode)?.name ?? form.countryCode;
    const fullName     = `${form.firstName.trim()} ${form.lastName.trim()}`;
    const locationStr  = `${form.city.trim()}, ${countryName}`;

    const { data, error: signUpErr } = await supabase.auth.signUp({
      email:    form.email,
      password: form.password,
      options: {
        data: {
          full_name:        fullName,
          location:         locationStr,
          left_foot_size:   leftUK,
          right_foot_size:  rightUK,
          is_amputee:       form.isAmputee,
          amputee_side:     form.amputeeSide || null,
          needed_foot_size: neededUK,
          size_system:      form.sizeSystem,
        },
      },
    });

    if (signUpErr) { setAuthError(signUpErr.message); setLoading(false); return; }

    const profilePayload = {
      name:            fullName,
      location:        locationStr,
      foot_size_left:  leftUK,
      foot_size_right: rightUK,
      is_amputee:      form.isAmputee,
    };

    if (data.session) {
      const uid = data.session.user.id;
      await supabase.from('users').upsert({ id: uid, email: form.email, ...profilePayload });
      router.replace('/app');
    } else {
      sessionStorage.setItem('signup_profile', JSON.stringify(profilePayload));
      router.replace(`/verify-otp?email=${encodeURIComponent(form.email)}`);
    }
  }

  const changeSizeSystem = (sys: SizeSystem) => {
    setForm(p => ({ ...p, sizeSystem: sys, leftFootSize: '', rightFootSize: '', neededFootSize: '' }));
  };

  const inputCls = 'w-full bg-background border border-input text-foreground placeholder-muted-foreground/50 text-sm px-4 py-3 rounded-xl outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-colors h-12';
  const selectCls = 'w-full bg-background border border-input text-foreground text-sm px-4 py-3 rounded-xl outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-colors h-12 appearance-none';

  return (
    <div className="min-h-screen bg-background flex flex-col">

      {/* Top bar */}
      <div className="px-4 py-4 flex items-center justify-between max-w-lg mx-auto w-full">
        <button
          onClick={() => (step === 1 ? router.push('/') : setStep(1))}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <span className="font-display text-sm font-bold text-foreground tracking-[0.08em] uppercase">myotherpair</span>
        <div className="w-14" />
      </div>

      <div className="flex-1 flex items-start justify-center px-4 pt-4 pb-8">
        <div className="w-full max-w-sm animate-fade-in">

          {/* Progress */}
          <div className="flex gap-2 mb-8">
            <div className="flex-1 h-1 rounded-full bg-accent" />
            <div className={`flex-1 h-1 rounded-full transition-colors duration-300 ${step === 2 ? 'bg-accent' : 'bg-muted'}`} />
          </div>

          <span className="text-[10px] font-bold text-accent uppercase tracking-widest mb-2 block">
            Step {step} of 2
          </span>
          <h1 className="font-display text-3xl font-bold text-foreground mb-1 leading-tight">
            {step === 1 ? 'Create your account' : 'About your feet'}
          </h1>
          <p className="text-sm text-muted-foreground mb-8">
            {step === 1 ? 'Join the community for perfectly matched shoes.' : 'So we can find your ideal match.'}
          </p>

          {/* ── Step 1 ─────────────────────────────────────────────────────── */}
          {step === 1 && (
            <form onSubmit={handleStep1} className="space-y-4">

              {/* First / Last name */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground font-medium block">First name</label>
                  <input
                    value={form.firstName}
                    onChange={e => update('firstName', e.target.value)}
                    placeholder="Jane"
                    required
                    autoComplete="given-name"
                    className={inputCls}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground font-medium block">Last name</label>
                  <input
                    value={form.lastName}
                    onChange={e => update('lastName', e.target.value)}
                    placeholder="Doe"
                    required
                    autoComplete="family-name"
                    className={inputCls}
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground font-medium block">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => update('email', e.target.value)}
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                  className={inputCls}
                />
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground font-medium block">Password</label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={form.password}
                    onChange={e => update('password', e.target.value)}
                    placeholder="••••••••"
                    required
                    autoComplete="new-password"
                    className={inputCls + ' pr-11'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(v => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                    aria-label="Toggle password"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <PasswordStrengthBar password={form.password} />
              </div>

              {/* Country */}
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground font-medium block">Country</label>
                <div className="relative">
                  <select
                    id="country"
                    aria-label="Country"
                    value={form.countryCode}
                    onChange={e => { update('countryCode', e.target.value); update('city', ''); }}
                    required
                    className={selectCls + ' text-' + (form.countryCode ? 'foreground' : 'muted-foreground/50')}
                  >
                    <option value="">Select your country</option>
                    {ALL_COUNTRIES.map(c => (
                      <option key={c.isoCode} value={c.isoCode}>{c.flag} {c.name}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/50">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* City */}
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground font-medium block">City</label>
                <input
                  list="city-options"
                  value={form.city}
                  onChange={e => update('city', e.target.value)}
                  placeholder={form.countryCode ? 'Start typing your city…' : 'Select a country first'}
                  disabled={!form.countryCode}
                  required
                  autoComplete="off"
                  className={inputCls + ' disabled:opacity-40 disabled:cursor-not-allowed'}
                />
                {cities.length > 0 && (
                  <datalist id="city-options">
                    {cities.slice(0, 500).map(c => (
                      <option key={`${c.name}-${c.stateCode}`} value={c.name} />
                    ))}
                  </datalist>
                )}
                {form.countryCode && form.city && cities.length > 0 && !cities.some(c => c.name.toLowerCase() === form.city.toLowerCase()) && (
                  <p className="text-[10px] text-orange-400 mt-1">
                    City not found in our list for this country — you can still proceed.
                  </p>
                )}
              </div>

              {error && (
                <p className="text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-2.5">
                  {error}
                </p>
              )}

              <button
                type="submit"
                className="w-full gradient-warm text-accent-foreground text-sm font-semibold rounded-xl flex items-center justify-center gap-2 shadow-card hover:shadow-card-hover transition-all active:scale-[.98]"
                style={{ height: 52 }}
              >
                Continue <ArrowRight className="h-4 w-4" />
              </button>

              <p className="text-sm text-muted-foreground text-center mt-4">
                Already have an account?{' '}
                <Link href="/login" className="text-accent font-semibold hover:underline">Log in</Link>
              </p>
            </form>
          )}

          {/* ── Step 2: foot sizes ───────────────────────────────────────── */}
          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-4">

              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                  Sizing system <ConversionTooltip />
                </label>
                <SizeSystemToggle value={form.sizeSystem} onChange={changeSizeSystem} />
              </div>

              <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50 border border-border/30">
                <input
                  id="amputee"
                  type="checkbox"
                  checked={form.isAmputee}
                  onChange={e => {
                    const v = e.target.checked;
                    setForm(p => ({ ...p, isAmputee: v, amputeeSide: '', neededFootSize: '', leftFootSize: '', rightFootSize: '' }));
                  }}
                  className="w-4 h-4 accent-[hsl(var(--accent))] cursor-pointer"
                />
                <div>
                  <label htmlFor="amputee" className="text-sm text-foreground cursor-pointer font-medium">I am an amputee</label>
                  <p className="text-[10px] text-muted-foreground mt-0.5">We&apos;ll only ask for the foot you need a shoe for</p>
                </div>
              </div>

              {form.isAmputee ? (
                <>
                  <div className="space-y-1.5">
                    <label className="text-xs text-muted-foreground font-medium">Which foot do you need a shoe for?</label>
                    <div className="grid grid-cols-2 gap-3">
                      {(['left', 'right'] as const).map(side => (
                        <button
                          key={side}
                          type="button"
                          onClick={() => update('amputeeSide', side)}
                          className={`h-12 rounded-xl text-sm font-semibold border transition-all duration-200 flex items-center justify-center gap-2 ${
                            form.amputeeSide === side
                              ? 'bg-accent text-accent-foreground border-accent shadow-sm'
                              : 'bg-muted/50 text-muted-foreground border-border/30 hover:border-border'
                          }`}
                        >
                          <span className={`w-2 h-2 rounded-full ${side === 'left' ? 'bg-left-shoe' : 'bg-right-shoe'}`} />
                          {side.charAt(0).toUpperCase() + side.slice(1)} foot
                        </button>
                      ))}
                    </div>
                  </div>
                  {form.amputeeSide && (
                    <div className="space-y-1.5 animate-fade-in">
                      <label className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${form.amputeeSide === 'left' ? 'bg-left-shoe' : 'bg-right-shoe'}`} />
                        {form.amputeeSide.charAt(0).toUpperCase() + form.amputeeSide.slice(1)} foot size
                      </label>
                      <SizeSelect system={form.sizeSystem} value={form.neededFootSize} onChange={v => update('neededFootSize', v)} />
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-left-shoe" /> Left foot
                      </label>
                      <SizeSelect system={form.sizeSystem} value={form.leftFootSize} onChange={v => update('leftFootSize', v)} placeholder="Size" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-right-shoe" /> Right foot
                      </label>
                      <SizeSelect system={form.sizeSystem} value={form.rightFootSize} onChange={v => update('rightFootSize', v)} placeholder="Size" />
                    </div>
                  </div>
                  {form.leftFootSize && form.rightFootSize && form.leftFootSize !== form.rightFootSize && (
                    <div className="p-4 rounded-xl bg-match-green/[0.08] border border-match-green/20 animate-fade-in">
                      <p className="text-xs font-semibold text-match-green flex items-center gap-2">
                        <span>✨</span> Great — myotherpair is built for you!
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        We&apos;ll help you find single shoes that match each foot perfectly.
                      </p>
                    </div>
                  )}
                </>
              )}

              {(error || authError) && (
                <p className="text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-2.5">
                  {error || authError}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full gradient-warm text-accent-foreground text-sm font-semibold rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-[.98] shadow-card hover:shadow-card-hover flex items-center justify-center gap-2"
                style={{ height: 52 }}
              >
                {loading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Creating account…
                  </>
                ) : 'Create account'}
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
