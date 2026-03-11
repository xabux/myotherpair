import { useState, useMemo, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
  Modal, FlatList, SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Country, City } from 'country-state-city';
import { supabase } from '../lib/supabase';

const SUPPORTED_COUNTRY_CODES = new Set([
  'US', 'GB',
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR',
  'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL',
  'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE',
]);
import { colors, spacing, radius, font } from '../lib/theme';

// ─── Password strength ────────────────────────────────────────────────────────

interface PasswordCheck { label: string; pass: boolean; }
interface StrengthResult { score: number; label: string; color: string; checks: PasswordCheck[]; }

function getPasswordStrength(password: string): StrengthResult {
  const checks: PasswordCheck[] = [
    { label: '8+ characters',     pass: password.length >= 8 },
    { label: 'Uppercase',         pass: /[A-Z]/.test(password) },
    { label: 'Lowercase',         pass: /[a-z]/.test(password) },
    { label: 'Number',            pass: /[0-9]/.test(password) },
    { label: 'Special character', pass: /[^A-Za-z0-9]/.test(password) },
  ];
  const score = checks.filter(c => c.pass).length;
  const levels = [
    { label: '',           color: colors.foregroundMuted },
    { label: 'Very weak',  color: '#E53E3E' },
    { label: 'Weak',       color: '#ED8936' },
    { label: 'Fair',       color: '#ECC94B' },
    { label: 'Good',       color: '#63B3ED' },
    { label: 'Strong',     color: colors.matchGreen },
  ];
  return { score, checks, ...levels[score] };
}

const BAR_COLORS = ['#E53E3E', '#ED8936', '#ECC94B', '#63B3ED', colors.matchGreen];

function PasswordStrengthBar({ password }: { password: string }) {
  const result = useMemo(() => getPasswordStrength(password), [password]);
  if (!password) return null;
  const barColor = BAR_COLORS[result.score - 1] ?? colors.border;
  return (
    <View style={{ marginTop: 8 }}>
      {/* 5 bars */}
      <View style={{ flexDirection: 'row', gap: 4 }}>
        {[1, 2, 3, 4, 5].map(i => (
          <View
            key={i}
            style={{
              flex: 1, height: 3, borderRadius: 2,
              backgroundColor: i <= result.score ? barColor : colors.border,
            }}
          />
        ))}
      </View>
      {/* Label + checks */}
      {result.label ? (
        <Text style={{ fontSize: 10, color: barColor, textAlign: 'right', marginTop: 4, fontWeight: '600' }}>
          {result.label}
        </Text>
      ) : null}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
        {result.checks.map(c => (
          <Text key={c.label} style={{ fontSize: 9, color: c.pass ? colors.matchGreen : colors.foregroundMuted }}>
            {c.pass ? '✓' : '○'} {c.label}
          </Text>
        ))}
      </View>
    </View>
  );
}

// ─── Searchable picker modal ──────────────────────────────────────────────────

interface PickerItem { label: string; value: string; }

function SearchPicker({
  visible, items, onSelect, onClose, title, placeholder,
}: {
  visible: boolean;
  items: PickerItem[];
  onSelect: (item: PickerItem) => void;
  onClose: () => void;
  title: string;
  placeholder?: string;
}) {
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return items;
    return items.filter(i => i.label.toLowerCase().includes(q));
  }, [query, items]);

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={pm.header}>
          <Text style={pm.title}>{title}</Text>
          <TouchableOpacity onPress={onClose} style={pm.closeBtn}>
            <Text style={pm.closeText}>Done</Text>
          </TouchableOpacity>
        </View>
        <View style={pm.searchWrap}>
          <TextInput
            style={pm.searchInput}
            placeholder={placeholder ?? 'Search…'}
            placeholderTextColor={colors.foregroundMuted}
            value={query}
            onChangeText={setQuery}
            autoFocus
            returnKeyType="search"
          />
        </View>
        <FlatList
          data={filtered}
          keyExtractor={i => i.value}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <TouchableOpacity
              style={pm.item}
              onPress={() => { onSelect(item); setQuery(''); onClose(); }}
              activeOpacity={0.7}
            >
              <Text style={pm.itemText}>{item.label}</Text>
            </TouchableOpacity>
          )}
          ItemSeparatorComponent={() => <View style={pm.sep} />}
        />
      </SafeAreaView>
    </Modal>
  );
}

const pm = StyleSheet.create({
  header:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  title:      { fontSize: font.lg, fontWeight: '700', color: colors.foreground },
  closeBtn:   { padding: 4 },
  closeText:  { fontSize: font.base, color: colors.accent, fontWeight: '600' },
  searchWrap: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  searchInput:{ backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, height: 44, paddingHorizontal: spacing.md, fontSize: font.base, color: colors.foreground },
  item:       { paddingVertical: 14, paddingHorizontal: spacing.lg },
  itemText:   { fontSize: font.base, color: colors.foreground },
  sep:        { height: 1, backgroundColor: colors.border + '66', marginHorizontal: spacing.lg },
});

// ─── Size picker ──────────────────────────────────────────────────────────────

const UK_SIZES = [3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10, 10.5, 11, 11.5, 12, 13, 14];

function SizeButton({ size, selected, onPress }: { size: number; selected: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[s.sizeBtn, selected && s.sizeBtnActive]}
      activeOpacity={0.7}
    >
      <Text style={[s.sizeBtnText, selected && s.sizeBtnTextActive]}>{size}</Text>
    </TouchableOpacity>
  );
}

// ─── Main screen ─────────────────────────────────────────────────────────────

const ALL_COUNTRIES: PickerItem[] = Country.getAllCountries()
  .filter(c => SUPPORTED_COUNTRY_CODES.has(c.isoCode))
  .map(c => ({
    label: `${c.flag ?? ''} ${c.name}`.trim(),
    value: c.isoCode,
  }));

export default function SignupScreen() {
  const router = useRouter();

  const [firstName,   setFirstName]   = useState('');
  const [lastName,    setLastName]    = useState('');
  const [email,       setEmail]       = useState('');
  const [password,    setPassword]    = useState('');
  const [showPass,    setShowPass]    = useState(false);
  const [countryCode, setCountryCode] = useState('');
  const [countryName, setCountryName] = useState('');
  const [city,        setCity]        = useState('');
  const [leftSize,    setLeftSize]    = useState('');
  const [rightSize,   setRightSize]   = useState('');
  const [isAmputee,   setIsAmputee]   = useState(false);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState('');

  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [showCityPicker,    setShowCityPicker]    = useState(false);

  const cityItems = useMemo<PickerItem[]>(() => {
    if (!countryCode) return [];
    return (City.getCitiesOfCountry(countryCode) ?? []).map(c => ({ label: c.name, value: c.name }));
  }, [countryCode]);

  const strength = useMemo(() => getPasswordStrength(password), [password]);

  const handleSignup = async () => {
    if (!firstName.trim()) { setError('First name is required.'); return; }
    if (!lastName.trim())  { setError('Last name is required.'); return; }
    if (!email)            { setError('Email is required.'); return; }
    if (!countryCode)      { setError('Please select your country.'); return; }
    if (!city.trim())      { setError('Please enter your city.'); return; }
    if (strength.score < 3) { setError('Password is too weak. Please use a stronger password.'); return; }

    setLoading(true);
    setError('');

    const { error: signUpErr } = await supabase.auth.signUp({ email, password });
    if (signUpErr) { setError(signUpErr.message); setLoading(false); return; }

    router.push({
      pathname: '/verify-otp',
      params: {
        email,
        name:      `${firstName.trim()} ${lastName.trim()}`,
        location:  `${city.trim()}, ${countryName}`,
        leftSize,
        rightSize,
        isAmputee: String(isAmputee),
      },
    });
    setLoading(false);
  };

  return (
    <>
      <SearchPicker
        visible={showCountryPicker}
        items={ALL_COUNTRIES}
        title="Select country"
        placeholder="Search countries…"
        onSelect={item => { setCountryCode(item.value); setCountryName(Country.getCountryByCode(item.value)?.name ?? item.value); setCity(''); }}
        onClose={() => setShowCountryPicker(false)}
      />
      <SearchPicker
        visible={showCityPicker}
        items={cityItems}
        title="Select city"
        placeholder="Search cities…"
        onSelect={item => setCity(item.label)}
        onClose={() => setShowCityPicker(false)}
      />

      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: colors.background }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
          <View style={s.logoArea}>
            <Text style={s.logo}>myother<Text style={{ color: colors.accent }}>pair</Text></Text>
          </View>

          <View style={s.card}>
            <Text style={s.title}>Create account</Text>
            <Text style={s.subtitle}>Join the single-shoe marketplace</Text>

            {/* First / Last name */}
            <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md }}>
              <View style={{ flex: 1 }}>
                <Text style={s.label}>First name *</Text>
                <TextInput style={s.input} placeholder="Jane" placeholderTextColor={colors.foregroundMuted}
                  value={firstName} onChangeText={setFirstName} autoCapitalize="words" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.label}>Last name *</Text>
                <TextInput style={s.input} placeholder="Doe" placeholderTextColor={colors.foregroundMuted}
                  value={lastName} onChangeText={setLastName} autoCapitalize="words" />
              </View>
            </View>

            {/* Email */}
            <View style={s.field}>
              <Text style={s.label}>Email *</Text>
              <TextInput style={s.input} placeholder="you@example.com" placeholderTextColor={colors.foregroundMuted}
                value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
            </View>

            {/* Password */}
            <View style={s.field}>
              <Text style={s.label}>Password *</Text>
              <View style={{ position: 'relative' }}>
                <TextInput
                  style={[s.input, { paddingRight: 48 }]}
                  placeholder="Min. 8 characters"
                  placeholderTextColor={colors.foregroundMuted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPass}
                />
                <TouchableOpacity
                  style={{ position: 'absolute', right: 14, top: 0, bottom: 0, justifyContent: 'center' }}
                  onPress={() => setShowPass(v => !v)}
                >
                  <Text style={{ fontSize: 11, color: colors.foregroundMuted }}>{showPass ? 'HIDE' : 'SHOW'}</Text>
                </TouchableOpacity>
              </View>
              <PasswordStrengthBar password={password} />
            </View>

            {/* Country */}
            <View style={s.field}>
              <Text style={s.label}>Country *</Text>
              <TouchableOpacity style={[s.input, s.pickerBtn]} onPress={() => setShowCountryPicker(true)} activeOpacity={0.8}>
                <Text style={countryCode ? s.pickerText : s.pickerPlaceholder}>
                  {countryCode ? `${Country.getCountryByCode(countryCode)?.flag ?? ''} ${countryName}` : 'Select your country'}
                </Text>
                <Text style={{ color: colors.foregroundMuted, fontSize: 12 }}>▾</Text>
              </TouchableOpacity>
            </View>

            {/* City */}
            <View style={s.field}>
              <Text style={s.label}>City *</Text>
              {cityItems.length > 0 ? (
                <TouchableOpacity
                  style={[s.input, s.pickerBtn, !countryCode && { opacity: 0.4 }]}
                  onPress={() => countryCode && setShowCityPicker(true)}
                  activeOpacity={0.8}
                >
                  <Text style={city ? s.pickerText : s.pickerPlaceholder}>
                    {city || (countryCode ? 'Select your city' : 'Select a country first')}
                  </Text>
                  <Text style={{ color: colors.foregroundMuted, fontSize: 12 }}>▾</Text>
                </TouchableOpacity>
              ) : (
                <TextInput
                  style={[s.input, !countryCode && { opacity: 0.4 }]}
                  placeholder={countryCode ? 'Enter your city' : 'Select a country first'}
                  placeholderTextColor={colors.foregroundMuted}
                  value={city}
                  onChangeText={setCity}
                  editable={!!countryCode}
                />
              )}
            </View>

            {/* Foot sizes */}
            <View style={s.field}>
              <Text style={s.label}>Left foot size (UK)</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
                <View style={{ flexDirection: 'row', gap: 6, paddingBottom: 4 }}>
                  {UK_SIZES.map(size => (
                    <SizeButton key={size} size={size} selected={leftSize === String(size)}
                      onPress={() => setLeftSize(leftSize === String(size) ? '' : String(size))} />
                  ))}
                </View>
              </ScrollView>
            </View>

            <View style={s.field}>
              <Text style={s.label}>Right foot size (UK)</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
                <View style={{ flexDirection: 'row', gap: 6, paddingBottom: 4 }}>
                  {UK_SIZES.map(size => (
                    <SizeButton key={size} size={size} selected={rightSize === String(size)}
                      onPress={() => setRightSize(rightSize === String(size) ? '' : String(size))} />
                  ))}
                </View>
              </ScrollView>
            </View>

            {/* Amputee toggle */}
            <TouchableOpacity style={s.toggleRow} onPress={() => setIsAmputee(v => !v)} activeOpacity={0.8}>
              <View style={[s.toggle, isAmputee && s.toggleActive]}>
                <View style={[s.toggleThumb, isAmputee && s.toggleThumbActive]} />
              </View>
              <Text style={s.toggleLabel}>I am an amputee / missing limb</Text>
            </TouchableOpacity>

            {error ? <Text style={s.error}>{error}</Text> : null}

            <TouchableOpacity style={s.btn} onPress={handleSignup} disabled={loading} activeOpacity={0.85}>
              {loading
                ? <ActivityIndicator color={colors.accentFg} />
                : <Text style={s.btnText}>Create account</Text>
              }
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push('/login')} style={s.link}>
              <Text style={s.linkText}>
                Already have an account? <Text style={{ color: colors.accent }}>Sign in</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

const s = StyleSheet.create({
  scroll:             { flexGrow: 1, padding: spacing.lg, paddingTop: spacing['2xl'] },
  logoArea:           { alignItems: 'center', marginBottom: spacing.lg },
  logo:               { fontSize: font.xl, fontWeight: '700', color: colors.foreground, letterSpacing: 1 },
  card:               { backgroundColor: colors.card, borderRadius: radius.xl, padding: spacing.lg, borderWidth: 1, borderColor: colors.border },
  title:              { fontSize: font.xl, fontWeight: '700', color: colors.foreground, marginBottom: 4 },
  subtitle:           { fontSize: font.sm, color: colors.foregroundMuted, marginBottom: spacing.lg },
  field:              { marginBottom: spacing.md },
  label:              { fontSize: font.xs, color: colors.foregroundMuted, marginBottom: 6, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.8 },
  input:              { backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, height: 48, paddingHorizontal: spacing.md, fontSize: font.base, color: colors.foreground },
  pickerBtn:          { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  pickerText:         { fontSize: font.base, color: colors.foreground },
  pickerPlaceholder:  { fontSize: font.base, color: colors.foregroundMuted },
  sizeBtn:            { height: 36, minWidth: 44, paddingHorizontal: 10, borderRadius: radius.sm, backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  sizeBtnActive:      { backgroundColor: colors.accent, borderColor: colors.accent },
  sizeBtnText:        { fontSize: font.sm, color: colors.foregroundMuted, fontWeight: '500' },
  sizeBtnTextActive:  { color: colors.accentFg, fontWeight: '700' },
  toggleRow:          { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md },
  toggle:             { width: 40, height: 24, borderRadius: 12, backgroundColor: colors.border, paddingHorizontal: 2, justifyContent: 'center' },
  toggleActive:       { backgroundColor: colors.accent },
  toggleThumb:        { width: 20, height: 20, borderRadius: 10, backgroundColor: colors.white, alignSelf: 'flex-start' },
  toggleThumbActive:  { alignSelf: 'flex-end' },
  toggleLabel:        { fontSize: font.sm, color: colors.foregroundMuted, flex: 1 },
  error:              { backgroundColor: 'rgba(194,54,54,0.12)', borderWidth: 1, borderColor: 'rgba(194,54,54,0.3)', borderRadius: radius.md, padding: spacing.sm, marginBottom: spacing.md, fontSize: font.sm, color: '#E57373' },
  btn:                { backgroundColor: colors.accent, borderRadius: radius.md, height: 52, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  btnText:            { color: colors.accentFg, fontSize: font.base, fontWeight: '700', letterSpacing: 0.5 },
  link:               { marginTop: spacing.md, alignItems: 'center' },
  linkText:           { fontSize: font.sm, color: colors.foregroundMuted },
});
