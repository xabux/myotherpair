import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../lib/supabase';
import { colors, spacing, radius, font } from '../lib/theme';

const UK_SIZES = [3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10, 10.5, 11, 11.5, 12, 13, 14];

export default function SignupScreen() {
  const router = useRouter();
  const [name,       setName]       = useState('');
  const [email,      setEmail]      = useState('');
  const [password,   setPassword]   = useState('');
  const [location,   setLocation]   = useState('');
  const [leftSize,   setLeftSize]   = useState('');
  const [rightSize,  setRightSize]  = useState('');
  const [isAmputee,  setIsAmputee]  = useState(false);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState('');

  const handleSignup = async () => {
    if (!name || !email || !password) { setError('Name, email and password are required.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);
    setError('');

    const { error: signUpErr } = await supabase.auth.signUp({ email, password });

    if (signUpErr) { setError(signUpErr.message); setLoading(false); return; }

    // Navigate to OTP screen — profile is created only after email is verified
    router.push({
      pathname: '/verify-otp',
      params: {
        email,
        name,
        location,
        leftSize:   leftSize,
        rightSize:  rightSize,
        isAmputee:  String(isAmputee),
      },
    });
    setLoading(false);
  };

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

  return (
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

          {/* Name */}
          <View style={s.field}>
            <Text style={s.label}>Name *</Text>
            <TextInput style={s.input} placeholder="Your name" placeholderTextColor={colors.foregroundMuted}
              value={name} onChangeText={setName} autoCapitalize="words" />
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
            <TextInput style={s.input} placeholder="Min. 6 characters" placeholderTextColor={colors.foregroundMuted}
              value={password} onChangeText={setPassword} secureTextEntry />
          </View>

          {/* Location */}
          <View style={s.field}>
            <Text style={s.label}>Location</Text>
            <TextInput style={s.input} placeholder="City, Country" placeholderTextColor={colors.foregroundMuted}
              value={location} onChangeText={setLocation} />
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
  );
}

const s = StyleSheet.create({
  scroll:           { flexGrow: 1, padding: spacing.lg, paddingTop: spacing['2xl'] },
  logoArea:         { alignItems: 'center', marginBottom: spacing.lg },
  logo:             { fontSize: font.xl, fontWeight: '700', color: colors.foreground, letterSpacing: 1 },
  card:             { backgroundColor: colors.card, borderRadius: radius.xl, padding: spacing.lg, borderWidth: 1, borderColor: colors.border },
  title:            { fontSize: font.xl, fontWeight: '700', color: colors.foreground, marginBottom: 4 },
  subtitle:         { fontSize: font.sm, color: colors.foregroundMuted, marginBottom: spacing.lg },
  field:            { marginBottom: spacing.md },
  label:            { fontSize: font.xs, color: colors.foregroundMuted, marginBottom: 6, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.8 },
  input:            { backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, height: 48, paddingHorizontal: spacing.md, fontSize: font.base, color: colors.foreground },
  sizeBtn:          { height: 36, minWidth: 44, paddingHorizontal: 10, borderRadius: radius.sm, backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  sizeBtnActive:    { backgroundColor: colors.accent, borderColor: colors.accent },
  sizeBtnText:      { fontSize: font.sm, color: colors.foregroundMuted, fontWeight: '500' },
  sizeBtnTextActive:{ color: colors.accentFg, fontWeight: '700' },
  toggleRow:        { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md },
  toggle:           { width: 40, height: 24, borderRadius: 12, backgroundColor: colors.border, paddingHorizontal: 2, justifyContent: 'center' },
  toggleActive:     { backgroundColor: colors.accent },
  toggleThumb:      { width: 20, height: 20, borderRadius: 10, backgroundColor: colors.white, alignSelf: 'flex-start' },
  toggleThumbActive:{ alignSelf: 'flex-end' },
  toggleLabel:      { fontSize: font.sm, color: colors.foregroundMuted, flex: 1 },
  error:            { backgroundColor: 'rgba(194,54,54,0.12)', borderWidth: 1, borderColor: 'rgba(194,54,54,0.3)', borderRadius: radius.md, padding: spacing.sm, marginBottom: spacing.md, fontSize: font.sm, color: '#E57373' },
  btn:              { backgroundColor: colors.accent, borderRadius: radius.md, height: 52, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  btnText:          { color: colors.accentFg, fontSize: font.base, fontWeight: '700', letterSpacing: 0.5 },
  link:             { marginTop: spacing.md, alignItems: 'center' },
  linkText:         { fontSize: font.sm, color: colors.foregroundMuted },
});
