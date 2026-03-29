import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import {
  ArrowLeft,
  Mail,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  KeyRound,
} from 'lucide-react-native';
import { authApi } from '../../api/auth.api';

type NavProp = NativeStackNavigationProp<RootStackParamList>;

export default function ForgotPasswordScreen() {
  const navigation = useNavigation<NavProp>();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSend = async () => {
    setSubmitted(true);
    setApiError('');
    if (!email.trim()) { setError('Email address is required'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Enter a valid email address'); return; }
    setError('');
    setLoading(true);
    try {
      await authApi.forgotPassword(email.trim().toLowerCase());
      setSent(true);
    } catch (err: any) {
      const msg = err?.response?.data?.error ?? err?.message ?? 'Failed to send reset link.';
      setApiError(msg);
    } finally {
      setLoading(false);
    }
  };

  const Header = () => (
    <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
      <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.backBtn}>
        <ArrowLeft color="white" size={20} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Forgot Password</Text>
    </View>
  );

  if (sent) {
    return (
      <View style={[styles.screen, { flex: 1 }]}>
        <Header />
        <View style={styles.successWrap}>
          <View style={styles.card}>
            <View style={styles.successIcon}>
              <CheckCircle2 color="#16A34A" size={32} />
            </View>
            <Text style={styles.successTitle}>Check Your Email</Text>
            <Text style={styles.successText}>
              We've sent a password reset link to{' '}
              <Text style={{ color: '#1E293B', fontWeight: '500' }}>{email}</Text>. Please check your inbox and follow the instructions.
            </Text>
            <View style={styles.tipBox}>
              <Text style={styles.tipText}>Didn't receive the email? Check your spam folder or try again.</Text>
            </View>
            <TouchableOpacity onPress={() => { setSent(false); setLoading(false); }} style={styles.resendBtn}>
              <Text style={styles.resendBtnText}>Resend Link</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.loginBtn}>
              <Text style={styles.loginBtnText}>Back to Login</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
          <Text style={styles.footerText}>Smart Road Estimator v2.1.0</Text>
          <Text style={styles.footerText}>© 2026 NHAI Engineering Division</Text>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.screen, { flex: 1 }]}>
        <Header />
        <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]} keyboardShouldPersistTaps="handled">
          <View style={styles.card}>
            {/* Icon & Description */}
            <View style={styles.topSection}>
              <View style={styles.iconBox}>
                <KeyRound color="#1E3A8A" size={28} />
              </View>
              <Text style={styles.cardTitle}>Reset Your Password</Text>
              <Text style={styles.cardDesc}>
                Enter the email address associated with your account and we'll send you a link to reset your password.
              </Text>
            </View>

            {/* API Error */}
            {apiError ? (
              <View style={styles.errorBanner}>
                <AlertCircle color="#DC2626" size={14} />
                <Text style={styles.errorBannerText}>{apiError}</Text>
              </View>
            ) : null}

            {/* Email Input */}
            <View style={styles.fieldWrap}>
              <Text style={styles.label}>Email Address</Text>
              <View style={[styles.inputRow, submitted && error ? styles.inputError : styles.inputNormal]}>
                <Mail color="#94A3B8" size={16} />
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={(v) => { setEmail(v); setApiError(''); if (submitted) setError(''); }}
                  placeholder="engineer@example.com"
                  placeholderTextColor="#CBD5E1"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              {submitted && error ? (
                <View style={styles.errRow}>
                  <AlertCircle color="#DC2626" size={12} />
                  <Text style={styles.errText}>{error}</Text>
                </View>
              ) : null}
            </View>

            {/* Send Button */}
            <TouchableOpacity onPress={handleSend} disabled={loading} style={[styles.sendBtn, loading && { opacity: 0.8 }]}>
              {loading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text style={styles.sendBtnText}>Send Reset Link</Text>
              )}
            </TouchableOpacity>

            <View style={styles.secureRow}>
              <ShieldCheck color="#0EA5A4" size={14} />
              <Text style={styles.secureText}>Secure Authentication</Text>
            </View>
          </View>

          <View style={styles.bottomLink}>
            <Text style={styles.bottomLinkText}>Remember your password? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.bottomLinkAction}>Back to Login</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Smart Road Estimator v2.1.0</Text>
            <Text style={styles.footerText}>© 2026 NHAI Engineering Division</Text>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: '#F5F7FA' },
  header: {
    backgroundColor: '#1E3A8A',
    paddingHorizontal: 16,
    paddingBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backBtn: { padding: 4, marginLeft: -4, borderRadius: 8 },
  headerTitle: { flex: 1, color: 'white', fontSize: 17, fontWeight: '600' },
  content: { padding: 20 },
  card: {
    backgroundColor: 'white', borderRadius: 20, padding: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06, shadowRadius: 10, elevation: 3,
  },
  topSection: { alignItems: 'center', marginBottom: 24 },
  iconBox: {
    width: 56, height: 56, borderRadius: 16,
    backgroundColor: '#EFF6FF', alignItems: 'center',
    justifyContent: 'center', marginBottom: 16,
  },
  cardTitle: { fontSize: 18, fontWeight: '600', color: '#1E293B', marginBottom: 6 },
  cardDesc: { fontSize: 13, color: '#64748B', textAlign: 'center', lineHeight: 20 },
  errorBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FECACA',
    borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 16,
  },
  errorBannerText: { flex: 1, fontSize: 12, color: '#DC2626' },
  fieldWrap: { marginBottom: 16 },
  label: { fontSize: 12, color: '#64748B', marginBottom: 6 },
  inputRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F8FAFC', borderWidth: 1,
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, gap: 10,
  },
  inputNormal: { borderColor: '#E2E8F0' },
  inputError: { borderColor: '#DC2626' },
  input: { flex: 1, fontSize: 14, color: '#1E293B' },
  errRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  errText: { fontSize: 11, color: '#DC2626' },
  sendBtn: {
    backgroundColor: '#1E3A8A', borderRadius: 12,
    paddingVertical: 14, alignItems: 'center',
    shadowColor: '#1E3A8A', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2, shadowRadius: 8, elevation: 4,
  },
  sendBtnText: { color: 'white', fontSize: 14, fontWeight: '600' },
  secureRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 16 },
  secureText: { fontSize: 11, color: '#94A3B8' },
  bottomLink: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  bottomLinkText: { fontSize: 14, color: '#64748B' },
  bottomLinkAction: { fontSize: 14, color: '#1E3A8A', fontWeight: '500' },
  footer: { alignItems: 'center', marginTop: 24 },
  footerText: { fontSize: 10, color: '#CBD5E1', marginTop: 2 },
  successWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  successIcon: {
    width: 64, height: 64, borderRadius: 32, backgroundColor: '#DCFCE7',
    alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginBottom: 16,
  },
  successTitle: { fontSize: 20, fontWeight: '600', color: '#1E293B', textAlign: 'center', marginBottom: 8 },
  successText: { fontSize: 13, color: '#64748B', textAlign: 'center', lineHeight: 20 },
  tipBox: {
    backgroundColor: '#F8FAFC', borderRadius: 12, padding: 12,
    marginTop: 16, borderWidth: 1, borderColor: '#E2E8F0',
  },
  tipText: { fontSize: 12, color: '#64748B', textAlign: 'center' },
  resendBtn: {
    marginTop: 20, borderWidth: 1, borderColor: '#E2E8F0',
    borderRadius: 12, paddingVertical: 12, alignItems: 'center',
  },
  resendBtnText: { fontSize: 14, color: '#64748B' },
  loginBtn: {
    marginTop: 8, backgroundColor: '#1E3A8A', borderRadius: 12,
    paddingVertical: 14, alignItems: 'center',
  },
  loginBtnText: { color: 'white', fontSize: 14, fontWeight: '600' },
});
