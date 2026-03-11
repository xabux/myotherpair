import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../lib/supabase';
import { colors, spacing, radius, font } from '../lib/theme';

export default function LoginScreen() {
  const router = useRouter();
  const [email,     setEmail]     = useState('');
  const [password,  setPassword]  = useState('');
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState('');

  const handleLogin = async () => {
    if (!email || !password) { setError('Please enter email and password.'); return; }
    setLoading(true);
    setError('');
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) {
      setError(err.message);
      setLoading(false);
    } else {
      router.replace('/(tabs)');
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
        {/* Logo */}
        <View style={s.logoArea}>
          <Text style={s.logo}>myother<Text style={{ color: colors.accent }}>pair</Text></Text>
          <Text style={s.tagline}>Every shoe deserves a match.</Text>
        </View>

        {/* Card */}
        <View style={s.card}>
          <Text style={s.title}>Welcome back</Text>
          <Text style={s.subtitle}>Sign in to your account</Text>

          <View style={s.field}>
            <Text style={s.label}>Email</Text>
            <TextInput
              style={s.input}
              placeholder="you@example.com"
              placeholderTextColor={colors.foregroundMuted}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
              returnKeyType="next"
            />
          </View>

          <View style={s.field}>
            <Text style={s.label}>Password</Text>
            <TextInput
              style={s.input}
              placeholder="••••••••"
              placeholderTextColor={colors.foregroundMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="password"
              returnKeyType="done"
              onSubmitEditing={handleLogin}
            />
          </View>

          {error ? <Text style={s.error}>{error}</Text> : null}

          <TouchableOpacity style={s.btn} onPress={handleLogin} disabled={loading} activeOpacity={0.85}>
            {loading
              ? <ActivityIndicator color={colors.accentFg} />
              : <Text style={s.btnText}>Sign in</Text>
            }
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/signup')} style={s.link}>
            <Text style={s.linkText}>
              Don't have an account? <Text style={{ color: colors.accent }}>Sign up</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  scroll:   { flexGrow: 1, justifyContent: 'center', padding: spacing.lg },
  logoArea: { alignItems: 'center', marginBottom: spacing['2xl'] },
  logo:     { fontSize: font['2xl'], fontWeight: '700', color: colors.foreground, letterSpacing: 1 },
  tagline:  { fontSize: font.sm, color: colors.foregroundMuted, marginTop: 6, letterSpacing: 0.5 },
  card:     { backgroundColor: colors.card, borderRadius: radius.xl, padding: spacing.lg, borderWidth: 1, borderColor: colors.border },
  title:    { fontSize: font.xl, fontWeight: '700', color: colors.foreground, marginBottom: 4 },
  subtitle: { fontSize: font.sm, color: colors.foregroundMuted, marginBottom: spacing.lg },
  field:    { marginBottom: spacing.md },
  label:    { fontSize: font.xs, color: colors.foregroundMuted, marginBottom: 6, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.8 },
  input:    { backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, height: 48, paddingHorizontal: spacing.md, fontSize: font.base, color: colors.foreground },
  error:    { backgroundColor: 'rgba(194,54,54,0.12)', borderWidth: 1, borderColor: 'rgba(194,54,54,0.3)', borderRadius: radius.md, padding: spacing.sm, marginBottom: spacing.md, fontSize: font.sm, color: '#E57373' },
  btn:      { backgroundColor: colors.accent, borderRadius: radius.md, height: 52, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  btnText:  { color: colors.accentFg, fontSize: font.base, fontWeight: '700', letterSpacing: 0.5 },
  link:     { marginTop: spacing.md, alignItems: 'center' },
  linkText: { fontSize: font.sm, color: colors.foregroundMuted },
});
