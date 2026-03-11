import { useState, useRef, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '../lib/supabase';
import { colors, spacing, radius, font } from '../lib/theme';

export default function VerifyOtpScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    email: string;
    name: string;
    location: string;
    leftSize: string;
    rightSize: string;
    isAmputee: string;
  }>();

  const [digits,    setDigits]    = useState(['', '', '', '', '', '']);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState('');
  const [resending, setResending] = useState(false);
  const [resent,    setResent]    = useState(false);

  const refs = useRef<Array<TextInput | null>>([null, null, null, null, null, null]);

  const handleChange = useCallback((val: string, idx: number) => {
    const digit = val.replace(/[^0-9]/g, '').slice(-1);
    setDigits(prev => {
      const next = [...prev];
      next[idx] = digit;
      return next;
    });
    if (digit && idx < 5) {
      refs.current[idx + 1]?.focus();
    }
  }, []);

  const handleKeyPress = useCallback((e: any, idx: number) => {
    if (e.nativeEvent.key === 'Backspace' && !digits[idx] && idx > 0) {
      const next = [...digits];
      next[idx - 1] = '';
      setDigits(next);
      refs.current[idx - 1]?.focus();
    }
  }, [digits]);

  const handleVerify = async () => {
    const token = digits.join('');
    if (token.length !== 6) { setError('Please enter all 6 digits.'); return; }
    setLoading(true);
    setError('');

    const { data, error: verifyErr } = await supabase.auth.verifyOtp({
      email: params.email,
      token,
      type: 'signup',
    });

    if (verifyErr || !data.session) {
      setError(verifyErr?.message ?? 'Invalid or expired code. Please try again.');
      setLoading(false);
      return;
    }

    // Email verified — now safely create the user profile
    const uid = data.session.user.id;
    await supabase.from('users').upsert({
      id:              uid,
      email:           params.email,
      name:            params.name || null,
      location:        params.location || null,
      foot_size_left:  params.leftSize  ? parseFloat(params.leftSize)  : null,
      foot_size_right: params.rightSize ? parseFloat(params.rightSize) : null,
      is_amputee:      params.isAmputee === 'true',
    });

    router.replace('/(tabs)');
  };

  const handleResend = async () => {
    setResending(true);
    await supabase.auth.resend({ type: 'signup', email: params.email });
    setResending(false);
    setResent(true);
    setTimeout(() => setResent(false), 5000);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={s.container}>
        <View style={s.logoArea}>
          <Text style={s.logo}>
            myother<Text style={{ color: colors.accent }}>pair</Text>
          </Text>
        </View>

        <View style={s.card}>
          <Text style={s.icon}>📬</Text>
          <Text style={s.title}>Check your email</Text>
          <Text style={s.subtitle}>
            We sent a 6-digit code to{'\n'}
            <Text style={{ color: colors.foreground, fontWeight: '600' }}>{params.email}</Text>
          </Text>

          {/* 6-digit OTP boxes */}
          <View style={s.otpRow}>
            {digits.map((d, i) => (
              <TextInput
                key={i}
                ref={r => { refs.current[i] = r; }}
                style={[s.otpBox, d ? s.otpBoxFilled : null]}
                value={d}
                onChangeText={val => handleChange(val, i)}
                onKeyPress={e => handleKeyPress(e, i)}
                keyboardType="number-pad"
                maxLength={2}
                textAlign="center"
                selectTextOnFocus
                caretHidden
                autoFocus={i === 0}
              />
            ))}
          </View>

          {error ? (
            <Text style={s.error}>{error}</Text>
          ) : null}

          <TouchableOpacity
            style={s.btn}
            onPress={handleVerify}
            disabled={loading || digits.join('').length < 6}
            activeOpacity={0.85}
          >
            {loading
              ? <ActivityIndicator color={colors.accentFg} />
              : <Text style={s.btnText}>Verify email</Text>
            }
          </TouchableOpacity>

          <TouchableOpacity
            style={s.resendBtn}
            onPress={handleResend}
            disabled={resending || resent}
            activeOpacity={0.7}
          >
            <Text style={[s.resendText, resent && { color: colors.matchGreen }]}>
              {resent
                ? '✓ Code resent!'
                : resending
                ? 'Sending…'
                : "Didn't receive it? Resend code"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.replace('/signup')} style={s.backBtn}>
            <Text style={s.backText}>← Back to sign up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container:   { flex: 1, justifyContent: 'center', padding: spacing.lg },
  logoArea:    { alignItems: 'center', marginBottom: spacing.lg },
  logo:        { fontSize: font.xl, fontWeight: '700', color: colors.foreground, letterSpacing: 1 },
  card:        { backgroundColor: colors.card, borderRadius: radius.xl, padding: spacing.lg, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  icon:        { fontSize: 40, marginBottom: spacing.sm },
  title:       { fontSize: font.xl, fontWeight: '700', color: colors.foreground, marginBottom: 8, textAlign: 'center' },
  subtitle:    { fontSize: font.sm, color: colors.foregroundMuted, textAlign: 'center', lineHeight: 20, marginBottom: spacing.lg },
  otpRow:      { flexDirection: 'row', gap: 10, marginBottom: spacing.md },
  otpBox:      { width: 44, height: 56, borderRadius: radius.md, borderWidth: 2, borderColor: colors.border, backgroundColor: colors.background, fontSize: font.xl, fontWeight: '700', color: colors.foreground, textAlign: 'center' },
  otpBoxFilled:{ borderColor: colors.accent, backgroundColor: colors.accent + '15' },
  error:       { backgroundColor: 'rgba(194,54,54,0.12)', borderWidth: 1, borderColor: 'rgba(194,54,54,0.3)', borderRadius: radius.md, padding: spacing.sm, marginBottom: spacing.md, fontSize: font.sm, color: '#E57373', textAlign: 'center', width: '100%' },
  btn:         { backgroundColor: colors.accent, borderRadius: radius.md, height: 52, alignItems: 'center', justifyContent: 'center', width: '100%', marginTop: 4 },
  btnText:     { color: colors.accentFg, fontSize: font.base, fontWeight: '700', letterSpacing: 0.5 },
  resendBtn:   { marginTop: spacing.md, padding: spacing.sm },
  resendText:  { fontSize: font.sm, color: colors.foregroundMuted, textAlign: 'center' },
  backBtn:     { marginTop: spacing.xs, padding: spacing.sm },
  backText:    { fontSize: font.sm, color: colors.foregroundMuted + '99', textAlign: 'center' },
});
