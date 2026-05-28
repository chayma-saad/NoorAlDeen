import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { signIn, signUp, downloadDataFromCloud } from '../services/firebase';
import { COLORS, FONTS, SPACING, RADIUS } from '../constants/theme';

interface Props {
  onGuest: () => void;
}

export default function AuthScreen({ onGuest }: Props) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);
    if (!email.trim() || !password.trim()) {
      setError('يرجى إدخال البريد الإلكتروني وكلمة المرور');
      return;
    }
    if (password.length < 6) {
      setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'signup') {
        await signUp(email.trim(), password);
      } else {
        const cred = await signIn(email.trim(), password);
        // Pull cloud data on sign-in
        await downloadDataFromCloud(cred.user.uid);
      }
      // onAuthStateChanged in App.tsx will update the UI automatically
    } catch (e: any) {
      const code = e?.code ?? '';
      if (code === 'auth/email-already-in-use') setError('هذا البريد مستخدم بالفعل');
      else if (code === 'auth/invalid-email') setError('بريد إلكتروني غير صالح');
      else if (code === 'auth/wrong-password' || code === 'auth/invalid-credential')
        setError('كلمة المرور غير صحيحة');
      else if (code === 'auth/user-not-found') setError('لا يوجد حساب بهذا البريد');
      else if (code === 'auth/too-many-requests') setError('محاولات كثيرة — حاول لاحقاً');
      else setError('حدث خطأ — حاول مرة أخرى');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Logo */}
        <View style={styles.logoArea}>
          <Text style={styles.logoIcon}>🕌</Text>
          <Text style={styles.logoTitle}>ركز على دينك</Text>
          <Text style={styles.logoSub}>✦ رفيقك الروحي اليومي ✦</Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          {/* Mode toggle */}
          <View style={styles.toggle}>
            <TouchableOpacity
              style={[styles.toggleBtn, mode === 'signin' && styles.toggleBtnActive]}
              onPress={() => { setMode('signin'); setError(null); }}
            >
              <Text style={[styles.toggleText, mode === 'signin' && styles.toggleTextActive]}>
                تسجيل الدخول
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleBtn, mode === 'signup' && styles.toggleBtnActive]}
              onPress={() => { setMode('signup'); setError(null); }}
            >
              <Text style={[styles.toggleText, mode === 'signup' && styles.toggleTextActive]}>
                إنشاء حساب
              </Text>
            </TouchableOpacity>
          </View>

          {/* Fields */}
          <View style={styles.fields}>
            <Text style={styles.label}>البريد الإلكتروني</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="example@email.com"
              placeholderTextColor={COLORS.muted}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Text style={styles.label}>كلمة المرور</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor={COLORS.muted}
              secureTextEntry
            />
          </View>

          {/* Error */}
          {error && <Text style={styles.errorText}>{error}</Text>}

          {/* Submit */}
          <TouchableOpacity
            style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color={COLORS.deep} />
              : <Text style={styles.submitText}>
                  {mode === 'signin' ? 'دخول' : 'إنشاء الحساب'}
                </Text>
            }
          </TouchableOpacity>
        </View>

        {/* Guest option */}
        <TouchableOpacity style={styles.guestBtn} onPress={onGuest}>
          <Text style={styles.guestText}>المتابعة بدون حساب</Text>
          <Text style={styles.guestSub}>ستُحفظ البيانات على هذا الجهاز فقط</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.deep },
  scroll: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
    gap: SPACING.xl,
  },

  logoArea: { alignItems: 'center', gap: SPACING.sm },
  logoIcon: { fontSize: 52 },
  logoTitle: {
    fontFamily: FONTS.amiriBold,
    fontSize: 32,
    color: COLORS.goldLight,
    letterSpacing: 1,
  },
  logoSub: {
    fontFamily: FONTS.cairo,
    fontSize: 13,
    color: COLORS.muted,
    letterSpacing: 2,
  },

  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: COLORS.deep2,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    borderWidth: 1,
    borderColor: 'rgba(201,146,46,0.2)',
    gap: SPACING.lg,
  },

  toggle: {
    flexDirection: 'row',
    backgroundColor: COLORS.deep,
    borderRadius: RADIUS.md,
    padding: 4,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: RADIUS.sm,
  },
  toggleBtnActive: { backgroundColor: COLORS.gold },
  toggleText: {
    fontFamily: FONTS.cairoSemiBold,
    fontSize: 14,
    color: COLORS.muted,
  },
  toggleTextActive: { color: COLORS.deep },

  fields: { gap: SPACING.sm },
  label: {
    fontFamily: FONTS.cairoSemiBold,
    fontSize: 13,
    color: COLORS.cream2,
    textAlign: 'right',
  },
  input: {
    backgroundColor: COLORS.deep,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: 'rgba(201,146,46,0.2)',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    fontFamily: FONTS.cairo,
    fontSize: 15,
    color: COLORS.cream,
    textAlign: 'left',
  },

  errorText: {
    fontFamily: FONTS.cairo,
    fontSize: 13,
    color: COLORS.error,
    textAlign: 'center',
  },

  submitBtn: {
    backgroundColor: COLORS.gold,
    borderRadius: RADIUS.full,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitText: {
    fontFamily: FONTS.cairoBold,
    fontSize: 16,
    color: COLORS.deep,
  },

  guestBtn: {
    alignItems: 'center',
    gap: 4,
    paddingVertical: SPACING.md,
  },
  guestText: {
    fontFamily: FONTS.cairoSemiBold,
    fontSize: 14,
    color: COLORS.mutedLight,
    textDecorationLine: 'underline',
  },
  guestSub: {
    fontFamily: FONTS.cairo,
    fontSize: 11,
    color: COLORS.muted,
  },
});
