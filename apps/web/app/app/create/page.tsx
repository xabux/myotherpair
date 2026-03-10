'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabase';
import { Button } from '../../components/ui/Button';
import { ImagePlus } from 'lucide-react';

type Foot      = 'L' | 'R' | 'single';
type Condition = 'new_with_tags' | 'new_without_tags' | 'excellent' | 'good' | 'fair' | 'poor';

const CONDITIONS: { value: Condition; label: string }[] = [
  { value: 'new_with_tags',    label: 'New (tags on)' },
  { value: 'new_without_tags', label: 'New'           },
  { value: 'excellent',        label: 'Excellent'     },
  { value: 'good',             label: 'Good'          },
  { value: 'fair',             label: 'Fair'          },
  { value: 'poor',             label: 'Poor'          },
];

const UK_SIZES = ['3','3.5','4','4.5','5','5.5','6','6.5','7','7.5','8','8.5','9','9.5','10','10.5','11','11.5','12','13','14'];
const BRANDS   = ['Nike','Adidas','Jordan','New Balance','Vans','Converse','Timberland','Puma','Reebok','Other'];

export default function CreatePage() {
  const router  = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [userId,      setUserId]      = useState<string | null>(null);
  const [submitting,  setSubmitting]  = useState(false);
  const [error,       setError]       = useState('');
  const [photoFile,   setPhotoFile]   = useState<File | null>(null);
  const [photoPreview,setPhotoPreview]= useState<string | null>(null);

  const [form, setForm] = useState({
    brand:       '',
    model:       '',
    size:        '',
    side:        '' as Foot | '',
    condition:   '' as Condition | '',
    price:       '',
    description: '',
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) setUserId(session.user.id);
    });
  }, []);

  const update = (key: string, value: string) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.brand || !form.model || !form.size || !form.side || !form.condition || !form.price) {
      setError('Please fill in all required fields.');
      return;
    }
    if (!userId) {
      setError('You must be logged in to create a listing.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      let photos: string[] = [];

      // Upload photo
      if (photoFile) {
        const ext  = photoFile.name.split('.').pop() ?? 'jpg';
        const path = `${userId}/${Date.now()}.${ext}`;
        const { data: stored, error: uploadErr } = await supabase.storage
          .from('shoe-images')
          .upload(path, photoFile, { upsert: true });
        if (uploadErr) throw uploadErr;
        if (stored) {
          const { data: { publicUrl } } = supabase.storage.from('shoe-images').getPublicUrl(path);
          photos = [publicUrl];
        }
      }

      const { error: insertErr } = await supabase.from('listings').insert({
        user_id:    userId,
        shoe_brand: form.brand,
        shoe_model: form.model,
        size:       parseFloat(form.size),
        foot_side:  form.side,
        condition:  form.condition,
        price:      parseFloat(form.price),
        description: form.description || null,
        photos,
        status:     'active',
      });

      if (insertErr) throw insertErr;

      router.push('/app/browse');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to create listing. Please try again.');
      setSubmitting(false);
    }
  };

  const selectCls = 'w-full h-11 rounded-xl bg-card border border-border/40 text-sm text-foreground px-3 outline-none focus:border-accent/50 transition-colors appearance-none';
  const inputCls  = 'w-full h-11 rounded-xl bg-card border border-border/40 text-sm text-foreground px-3 outline-none focus:border-accent/50 transition-colors placeholder:text-muted-foreground';

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-40 glass-nav border-b border-border/50 px-4 py-3.5">
        <h1 className="font-display text-lg font-bold text-foreground">List a shoe</h1>
        <p className="text-[11px] text-muted-foreground mt-0.5">Upload a photo, set your price, and find your match.</p>
      </header>

      <div className="max-w-lg mx-auto px-4 py-5">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Photo upload */}
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="w-full aspect-[16/10] rounded-2xl border-2 border-dashed border-accent/25 bg-accent/[0.03] flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-accent/[0.06] hover:border-accent/40 transition-all duration-300 group overflow-hidden"
          >
            {photoPreview ? (
              <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <>
                <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <ImagePlus className="h-6 w-6 text-accent" />
                </div>
                <p className="text-sm font-semibold text-accent">Add photos</p>
                <p className="text-xs text-muted-foreground">Tap to upload shoe images</p>
              </>
            )}
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />

          {/* Brand & Model */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground font-medium">Brand *</label>
              <select value={form.brand} onChange={e => update('brand', e.target.value)} className={selectCls}>
                <option value="">Select brand</option>
                {BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground font-medium">Model *</label>
              <input
                value={form.model}
                onChange={e => update('model', e.target.value)}
                placeholder="e.g. Air Force 1"
                className={inputCls}
              />
            </div>
          </div>

          {/* Size, Side, Condition */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground font-medium">Size *</label>
              <select value={form.size} onChange={e => update('size', e.target.value)} className={selectCls}>
                <option value="">Size</option>
                {UK_SIZES.map(s => <option key={s} value={s}>UK {s}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground font-medium">Side *</label>
              <select value={form.side} onChange={e => update('side', e.target.value)} className={selectCls}>
                <option value="">Side</option>
                <option value="L">Left</option>
                <option value="R">Right</option>
                <option value="single">Either</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground font-medium">Condition *</label>
              <select value={form.condition} onChange={e => update('condition', e.target.value)} className={selectCls}>
                <option value="">Cond.</option>
                {CONDITIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
          </div>

          {/* Price */}
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground font-medium">Price ($) *</label>
            <input
              type="number"
              value={form.price}
              onChange={e => update('price', e.target.value)}
              placeholder="0"
              className={`${inputCls} text-lg font-bold`}
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground font-medium">Description</label>
            <textarea
              value={form.description}
              onChange={e => update('description', e.target.value)}
              placeholder="Describe your shoe — condition, colour, any defects..."
              rows={3}
              className="w-full rounded-xl bg-card border border-border/40 text-sm text-foreground px-3 py-2.5 outline-none focus:border-accent/50 transition-colors placeholder:text-muted-foreground resize-none"
            />
          </div>

          {error && (
            <p className="text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-2.5">
              {error}
            </p>
          )}

          <Button
            type="submit"
            variant="hero"
            disabled={submitting}
            className="w-full rounded-xl text-base shadow-elevated hover:shadow-glow transition-shadow"
            style={{ height: 52 }}
          >
            {submitting ? 'Listing...' : 'List Shoe'}
          </Button>
        </form>
      </div>
    </div>
  );
}
