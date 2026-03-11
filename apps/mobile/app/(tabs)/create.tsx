import { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Image, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { ImagePlus, ChevronDown } from 'lucide-react-native';
import { supabase } from '../../lib/supabase';
import { colors, spacing, radius, font } from '../../lib/theme';

type Foot      = 'L' | 'R' | 'single';
type Condition = 'new_with_tags' | 'new_without_tags' | 'excellent' | 'good' | 'fair' | 'poor';

const BRANDS = ['Nike', 'Adidas', 'Jordan', 'New Balance', 'Vans', 'Converse', 'Timberland', 'Puma', 'Reebok', 'Other'];
const CONDITIONS: { value: Condition; label: string }[] = [
  { value: 'new_with_tags',    label: 'New (tags on)' },
  { value: 'new_without_tags', label: 'New' },
  { value: 'excellent',        label: 'Excellent' },
  { value: 'good',             label: 'Good' },
  { value: 'fair',             label: 'Fair' },
  { value: 'poor',             label: 'Poor' },
];
const UK_SIZES = [3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10, 10.5, 11, 11.5, 12, 13, 14];

function PickerRow<T extends string>({
  label, value, options, onSelect,
}: {
  label: string;
  value: T | '';
  options: { value: T; label: string }[];
  onSelect: (v: T) => void;
}) {
  const [open, setOpen] = useState(false);
  const selected = options.find(o => o.value === value);
  return (
    <View style={{ marginBottom: spacing.md }}>
      <Text style={s.label}>{label}</Text>
      <TouchableOpacity style={s.pickerBtn} onPress={() => setOpen(v => !v)} activeOpacity={0.8}>
        <Text style={[s.pickerBtnText, !selected && { color: colors.foregroundMuted }]}>
          {selected?.label ?? `Select ${label.replace(' *', '')}`}
        </Text>
        <ChevronDown size={16} color={colors.foregroundMuted} />
      </TouchableOpacity>
      {open && (
        <View style={s.dropdown}>
          {options.map(o => (
            <TouchableOpacity
              key={o.value}
              style={[s.dropdownItem, o.value === value && s.dropdownItemActive]}
              onPress={() => { onSelect(o.value); setOpen(false); }}
            >
              <Text style={[s.dropdownText, o.value === value && { color: colors.accent, fontWeight: '700' }]}>
                {o.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

export default function CreateScreen() {
  const router = useRouter();
  const [userId,     setUserId]     = useState<string | null>(null);
  const [photo,      setPhoto]      = useState<{ uri: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState('');
  const [form, setForm] = useState({
    brand: '', model: '', size: '', side: '' as Foot | '',
    condition: '' as Condition | '', price: '', description: '',
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) setUserId(session.user.id);
    });
  }, []);

  const update = (key: string, value: string) =>
    setForm(prev => ({ ...prev, [key]: value }));

  async function pickPhoto() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
      aspect: [4, 3],
    });
    if (!result.canceled && result.assets[0]) {
      setPhoto({ uri: result.assets[0].uri });
    }
  }

  async function handleSubmit() {
    if (!form.brand || !form.model || !form.size || !form.side || !form.condition || !form.price) {
      setError('Please fill in all required fields.');
      return;
    }
    if (!userId) { setError('You must be logged in.'); return; }

    setSubmitting(true);
    setError('');

    try {
      let photos: string[] = [];

      if (photo) {
        const ext  = photo.uri.split('.').pop() ?? 'jpg';
        const path = `${userId}/${Date.now()}.${ext}`;
        const resp = await fetch(photo.uri);
        const blob = await resp.blob();
        const { error: uploadErr } = await supabase.storage
          .from('shoe-images').upload(path, blob, { contentType: `image/${ext}`, upsert: true });
        if (!uploadErr) {
          const { data: { publicUrl } } = supabase.storage.from('shoe-images').getPublicUrl(path);
          photos = [publicUrl];
        }
      }

      const { error: insertErr } = await supabase.from('listings').insert({
        user_id:     userId,
        shoe_brand:  form.brand,
        shoe_model:  form.model,
        size:        parseFloat(form.size),
        foot_side:   form.side,
        condition:   form.condition,
        price:       parseFloat(form.price),
        description: form.description || null,
        photos,
        status:      'active',
      });

      if (insertErr) throw insertErr;

      Alert.alert('Listed!', 'Your shoe has been listed successfully.', [
        { text: 'View listings', onPress: () => router.push('/listings' as any) },
        { text: 'OK', onPress: () => {
          setForm({ brand: '', model: '', size: '', side: '', condition: '', price: '', description: '' });
          setPhoto(null);
        }},
      ]);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to create listing.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={s.root}>
      <View style={s.header}>
        <Text style={s.headerTitle}>List a shoe</Text>
        <Text style={s.headerSub}>Find a match for your spare</Text>
      </View>

      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

        {/* Photo */}
        <TouchableOpacity style={s.photoBtn} onPress={pickPhoto} activeOpacity={0.8}>
          {photo ? (
            <Image source={{ uri: photo.uri }} style={s.photoPreview} resizeMode="cover" />
          ) : (
            <>
              <View style={s.photoIcon}>
                <ImagePlus size={28} color={colors.accent} />
              </View>
              <Text style={s.photoLabel}>Add photo</Text>
              <Text style={s.photoSub}>Tap to upload</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Brand */}
        <PickerRow
          label="Brand *"
          value={form.brand as any}
          options={BRANDS.map(b => ({ value: b, label: b }))}
          onSelect={v => update('brand', v)}
        />

        {/* Model */}
        <View style={{ marginBottom: spacing.md }}>
          <Text style={s.label}>Model *</Text>
          <TextInput
            style={s.input}
            placeholder="e.g. Air Force 1"
            placeholderTextColor={colors.foregroundMuted}
            value={form.model}
            onChangeText={v => update('model', v)}
          />
        </View>

        {/* Size */}
        <View style={{ marginBottom: spacing.md }}>
          <Text style={s.label}>Size (UK) *</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
            <View style={{ flexDirection: 'row', gap: 6, paddingBottom: 4 }}>
              {UK_SIZES.map(size => (
                <TouchableOpacity
                  key={size}
                  style={[s.sizeBtn, form.size === String(size) && s.sizeBtnActive]}
                  onPress={() => update('size', String(size))}
                  activeOpacity={0.7}
                >
                  <Text style={[s.sizeBtnText, form.size === String(size) && s.sizeBtnTextActive]}>
                    {size}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Side */}
        <PickerRow
          label="Foot side *"
          value={form.side}
          options={[
            { value: 'L',      label: 'Left' },
            { value: 'R',      label: 'Right' },
            { value: 'single', label: 'Either foot' },
          ]}
          onSelect={v => update('side', v)}
        />

        {/* Condition */}
        <PickerRow
          label="Condition *"
          value={form.condition}
          options={CONDITIONS}
          onSelect={v => update('condition', v)}
        />

        {/* Price */}
        <View style={{ marginBottom: spacing.md }}>
          <Text style={s.label}>Price ($) *</Text>
          <TextInput
            style={[s.input, { fontSize: font.xl, fontWeight: '700' }]}
            placeholder="0"
            placeholderTextColor={colors.foregroundMuted}
            value={form.price}
            onChangeText={v => update('price', v)}
            keyboardType="decimal-pad"
          />
        </View>

        {/* Description */}
        <View style={{ marginBottom: spacing.md }}>
          <Text style={s.label}>Description</Text>
          <TextInput
            style={[s.input, { height: 88, paddingTop: 12, textAlignVertical: 'top' }]}
            placeholder="Describe your shoe — colour, condition, any defects..."
            placeholderTextColor={colors.foregroundMuted}
            value={form.description}
            onChangeText={v => update('description', v)}
            multiline
          />
        </View>

        {error ? <Text style={s.error}>{error}</Text> : null}

        <TouchableOpacity style={s.submitBtn} onPress={handleSubmit} disabled={submitting} activeOpacity={0.85}>
          {submitting
            ? <ActivityIndicator color={colors.accentFg} />
            : <Text style={s.submitText}>List shoe</Text>
          }
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root:             { flex: 1, backgroundColor: colors.background },
  header:           { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  headerTitle:      { fontSize: font.xl, fontWeight: '700', color: colors.foreground },
  headerSub:        { fontSize: font.sm, color: colors.foregroundMuted, marginTop: 2 },
  scroll:           { padding: spacing.md, paddingTop: spacing.lg },
  photoBtn:         { aspectRatio: 16 / 10, borderRadius: radius.xl, borderWidth: 2, borderColor: colors.accent + '44', borderStyle: 'dashed', backgroundColor: colors.accent + '08', alignItems: 'center', justifyContent: 'center', marginBottom: spacing.lg, overflow: 'hidden' },
  photoPreview:     { width: '100%', height: '100%' },
  photoIcon:        { width: 56, height: 56, borderRadius: 16, backgroundColor: colors.accent + '18', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  photoLabel:       { fontSize: font.sm, fontWeight: '700', color: colors.accent },
  photoSub:         { fontSize: font.xs, color: colors.foregroundMuted, marginTop: 2 },
  label:            { fontSize: font.xs, color: colors.foregroundMuted, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 },
  input:            { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, height: 48, paddingHorizontal: spacing.md, fontSize: font.base, color: colors.foreground },
  pickerBtn:        { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, height: 48, paddingHorizontal: spacing.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  pickerBtnText:    { fontSize: font.base, color: colors.foreground },
  dropdown:         { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, marginTop: 4, overflow: 'hidden', zIndex: 10 },
  dropdownItem:     { paddingHorizontal: spacing.md, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
  dropdownItemActive:{ backgroundColor: colors.accent + '12' },
  dropdownText:     { fontSize: font.base, color: colors.foreground },
  sizeBtn:          { height: 36, minWidth: 44, paddingHorizontal: 10, borderRadius: radius.sm, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  sizeBtnActive:    { backgroundColor: colors.accent, borderColor: colors.accent },
  sizeBtnText:      { fontSize: font.sm, color: colors.foregroundMuted, fontWeight: '500' },
  sizeBtnTextActive:{ color: colors.accentFg, fontWeight: '700' },
  error:            { backgroundColor: 'rgba(194,54,54,0.12)', borderWidth: 1, borderColor: 'rgba(194,54,54,0.3)', borderRadius: radius.md, padding: spacing.sm, marginBottom: spacing.md, fontSize: font.sm, color: '#E57373' },
  submitBtn:        { backgroundColor: colors.accent, borderRadius: radius.md, height: 52, alignItems: 'center', justifyContent: 'center' },
  submitText:       { color: colors.accentFg, fontSize: font.base, fontWeight: '700', letterSpacing: 0.5 },
});
