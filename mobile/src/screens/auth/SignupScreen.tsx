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
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Building2,
  ChevronDown,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Check,
} from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';

type NavProp = NativeStackNavigationProp<RootStackParamList>;

type StrengthLevel = 'weak' | 'medium' | 'strong' | 'none';

function getPasswordStrength(pwd: string): { label: string; percent: number; color: string } {
  if (!pwd) return { label: '', percent: 0, color: '#E2E8F0' };
  let score = 0;
  if (pwd.length >= 6) score++;
  if (pwd.length >= 10) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  if (score <= 2) return { label: 'Weak', percent: 33, color: '#DC2626' };
  if (score <= 3) return { label: 'Medium', percent: 66, color: '#F59E0B' };
  return { label: 'Strong', percent: 100, color: '#16A34A' };
}

export default function SignupScreen() {
  const navigation = useNavigation<NavProp>();
  const insets = useSafeAreaInsets();
  const { register } = useAuth();

  const [form, setForm] = useState({
    fullName: '', email: '', phone: '', organization: '',
    role: 'ENGINEER' as 'ADMIN' | 'ENGINEER' | 'CONTRACTOR',
    password: '', confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showRolePicker, setShowRolePicker] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [apiError, setApiError] = useState('');

  const update = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (submitted) setErrors((prev) => ({ ...prev, [key]: '' }));
    setApiError('');
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.fullName.trim()) errs.fullName = 'Full name is required';
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Enter a valid email';
    if (!form.phone.trim()) errs.phone = 'Phone number is required';
    else if (form.phone.replace(/\D/g, '').length < 10) errs.phone = 'Enter a valid phone number';
    if (!form.organization.trim()) errs.organization = 'Organization is required';
    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 6) errs.password = 'Min 6 characters';
    if (!form.confirmPassword) errs.confirmPassword = 'Confirm your password';
    else if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    if (!agreeTerms) errs.terms = 'You must agree to the terms';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSignup = async () => {
    setSubmitted(true);
    setApiError('');
    if (!validate()) return;
    setLoading(true);
    try {
      await register({
        name: form.fullName.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        organization: form.organization.trim(),
        password: form.password,
        role: form.role,
      });
      setShowSuccess(true);
    } catch (err: any) {
      const msg = err?.response?.data?.error ?? err?.message ?? 'Registration failed. Try again.';
      setApiError(msg);
    } finally {
      setLoading(false);
    }
  };

  const strength = getPasswordStrength(form.password);
  const roles: Array<{ label: string; value: 'ADMIN' | 'ENGINEER' | 'CONTRACTOR' }> = [
    { label: 'Engineer', value: 'ENGINEER' },
    { label: 'Contractor', value: 'CONTRACTOR' },
    { label: 'Admin', value: 'ADMIN' },
  ];
  const roleLabel = roles.find((r) => r.value === form.role)?.label ?? form.role;

  if (showSuccess) {
    return (
      <View style={[styles.screen, styles.successScreen, { paddingTop: insets.top }]}>
        <View style={styles.successCard}>
          <View style={styles.successIcon}>
            <CheckCircle2 color="#16A34A" size={32} />
          </View>
          <Text style={styles.successTitle}>Account Created!</Text>
          <Text style={styles.successText}>
            Your account has been successfully registered. You can now sign in with your credentials.
          </Text>
          <TouchableOpacity
            onPress={() => navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] })}
            style={styles.successBtn}
          >
            <Text style={styles.successBtnText}>Continue to App</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.backBtn}>
          <ArrowLeft color="white" size={20} />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Create Account</Text>
          <Text style={styles.headerSub}>Register as Engineer or Administrator</Text>
        </View>
      </View>

      <ScrollView style={styles.screen} contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 40 }} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>

          {/* API Error Banner */}
          {apiError ? (
            <View style={styles.errorBanner}>
              <AlertCircle color="#DC2626" size={14} />
              <Text style={styles.errorBannerText}>{apiError}</Text>
            </View>
          ) : null}

          <FormInput label="Full Name" icon={<User color="#94A3B8" size={16} />}
            value={form.fullName} onChangeText={(v) => update('fullName', v)}
            placeholder="e.g., Rajesh Kumar" error={submitted ? errors.fullName : undefined} />

          <FormInput label="Email Address" icon={<Mail color="#94A3B8" size={16} />}
            value={form.email} onChangeText={(v) => update('email', v)}
            placeholder="engineer@example.com" keyboardType="email-address"
            error={submitted ? errors.email : undefined} />

          <FormInput label="Phone Number" icon={<Phone color="#94A3B8" size={16} />}
            value={form.phone} onChangeText={(v) => update('phone', v)}
            placeholder="+91 98765 43210" keyboardType="phone-pad"
            error={submitted ? errors.phone : undefined} />

          <FormInput label="Organization / Company Name" icon={<Building2 color="#94A3B8" size={16} />}
            value={form.organization} onChangeText={(v) => update('organization', v)}
            placeholder="e.g., NHAI" error={submitted ? errors.organization : undefined} />

          {/* Role */}
          <View style={styles.fieldWrap}>
            <Text style={styles.label}>Role</Text>
            <TouchableOpacity onPress={() => setShowRolePicker(true)} style={[styles.inputRow, styles.inputNormal]}>
              <Text style={styles.pickerText}>{roleLabel}</Text>
              <ChevronDown color="#94A3B8" size={16} />
            </TouchableOpacity>
          </View>

          {/* Password */}
          <View style={styles.fieldWrap}>
            <Text style={styles.label}>Password</Text>
            <View style={[styles.inputRow, submitted && errors.password ? styles.inputError : styles.inputNormal]}>
              <Lock color="#94A3B8" size={16} />
              <TextInput
                style={[styles.input, { flex: 1 }]}
                value={form.password}
                onChangeText={(v) => update('password', v)}
                placeholder="Create a strong password"
                placeholderTextColor="#CBD5E1"
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword((v) => !v)} style={{ padding: 4 }}>
                {showPassword ? <EyeOff color="#94A3B8" size={16} /> : <Eye color="#94A3B8" size={16} />}
              </TouchableOpacity>
            </View>
            {form.password ? (
              <View style={{ marginTop: 6 }}>
                <View style={styles.strengthBar}>
                  <View style={[styles.strengthFill, { width: `${strength.percent}%` as any, backgroundColor: strength.color }]} />
                </View>
                <Text style={[styles.strengthLabel, { color: strength.color }]}>{strength.label}</Text>
              </View>
            ) : null}
            {submitted && errors.password ? <ErrorRow msg={errors.password} /> : null}
          </View>

          {/* Confirm Password */}
          <View style={styles.fieldWrap}>
            <Text style={styles.label}>Confirm Password</Text>
            <View style={[styles.inputRow, submitted && errors.confirmPassword ? styles.inputError : styles.inputNormal]}>
              <Lock color="#94A3B8" size={16} />
              <TextInput
                style={[styles.input, { flex: 1 }]}
                value={form.confirmPassword}
                onChangeText={(v) => update('confirmPassword', v)}
                placeholder="Re-enter your password"
                placeholderTextColor="#CBD5E1"
                secureTextEntry={!showConfirm}
              />
              <TouchableOpacity onPress={() => setShowConfirm((v) => !v)} style={{ padding: 4 }}>
                {showConfirm ? <EyeOff color="#94A3B8" size={16} /> : <Eye color="#94A3B8" size={16} />}
              </TouchableOpacity>
            </View>
            {submitted && errors.confirmPassword ? <ErrorRow msg={errors.confirmPassword} /> : null}
          </View>

          {/* Terms */}
          <View style={styles.fieldWrap}>
            <TouchableOpacity
              onPress={() => { setAgreeTerms((v) => !v); if (submitted) setErrors((p) => ({ ...p, terms: '' })); }}
              style={styles.termsRow}
            >
              <View style={[styles.checkbox, agreeTerms && styles.checkboxChecked, submitted && errors.terms && !agreeTerms && styles.checkboxError]}>
                {agreeTerms && <Check color="white" size={12} />}
              </View>
              <Text style={styles.termsText}>
                I agree to the <Text style={styles.termsLink}>Terms & Conditions</Text> and <Text style={styles.termsLink}>Privacy Policy</Text>
              </Text>
            </TouchableOpacity>
            {submitted && errors.terms ? <ErrorRow msg={errors.terms} /> : null}
          </View>

          {/* Submit */}
          <TouchableOpacity onPress={handleSignup} disabled={loading} style={[styles.submitBtn, loading && { opacity: 0.8 }]}>
            {loading ? <ActivityIndicator color="white" size="small" /> : <Text style={styles.submitBtnText}>Create Account</Text>}
          </TouchableOpacity>

          <View style={styles.secureRow}>
            <ShieldCheck color="#0EA5A4" size={14} />
            <Text style={styles.secureText}>Secure Authentication</Text>
          </View>
        </View>

        <View style={styles.bottomLink}>
          <Text style={styles.bottomLinkText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.bottomLinkAction}>Login</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Smart Road Estimator v2.1.0</Text>
          <Text style={styles.footerText}>© 2026 NHAI Engineering Division</Text>
        </View>
      </ScrollView>

      {/* Role Picker Modal */}
      <Modal visible={showRolePicker} transparent animationType="slide">
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setShowRolePicker(false)} activeOpacity={1}>
          <View style={[styles.pickerSheet, { paddingBottom: insets.bottom + 16 }]}>
            <View style={styles.pickerHandle} />
            <Text style={styles.pickerTitle}>Select Role</Text>
            {roles.map((r) => (
              <TouchableOpacity key={r.value} style={styles.pickerOption}
                onPress={() => { update('role', r.value); setShowRolePicker(false); }}>
                <Text style={[styles.pickerOptionText, form.role === r.value && styles.pickerOptionActive]}>{r.label}</Text>
                {form.role === r.value && <Check color="#1E3A8A" size={16} />}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </KeyboardAvoidingView>
  );
}

function FormInput({ label, icon, value, onChangeText, placeholder, keyboardType, error }: {
  label: string; icon: React.ReactNode; value: string;
  onChangeText: (v: string) => void; placeholder: string;
  keyboardType?: any; error?: string;
}) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputRow, error ? styles.inputError : styles.inputNormal]}>
        {icon}
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#CBD5E1"
          keyboardType={keyboardType}
          autoCapitalize="none"
        />
      </View>
      {error ? <ErrorRow msg={error} /> : null}
    </View>
  );
}

function ErrorRow({ msg }: { msg: string }) {
  return (
    <View style={styles.errRow}>
      <AlertCircle color="#DC2626" size={12} />
      <Text style={styles.errText}>{msg}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F5F7FA' },
  header: {
    backgroundColor: '#1E3A8A',
    paddingHorizontal: 16,
    paddingBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backBtn: { padding: 4, marginLeft: -4, borderRadius: 8 },
  headerTitle: { color: 'white', fontSize: 17, fontWeight: '600' },
  headerSub: { color: '#BFDBFE', fontSize: 12 },
  card: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  errorBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FECACA',
    borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 16,
  },
  errorBannerText: { flex: 1, fontSize: 12, color: '#DC2626' },
  fieldWrap: { marginBottom: 16 },
  label: { fontSize: 12, color: '#64748B', marginBottom: 6 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },
  inputNormal: { borderColor: '#E2E8F0' },
  inputError: { borderColor: '#DC2626' },
  input: { flex: 1, fontSize: 14, color: '#1E293B' },
  pickerText: { flex: 1, fontSize: 14, color: '#1E293B' },
  errRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4, paddingLeft: 2 },
  errText: { fontSize: 11, color: '#DC2626' },
  strengthBar: { height: 6, backgroundColor: '#F1F5F9', borderRadius: 3, overflow: 'hidden' },
  strengthFill: { height: '100%', borderRadius: 3 },
  strengthLabel: { fontSize: 10, textAlign: 'right', marginTop: 2 },
  termsRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  checkbox: {
    width: 20, height: 20, borderRadius: 5,
    borderWidth: 2, borderColor: '#CBD5E1',
    alignItems: 'center', justifyContent: 'center',
    marginTop: 1, flexShrink: 0,
  },
  checkboxChecked: { backgroundColor: '#1E3A8A', borderColor: '#1E3A8A' },
  checkboxError: { borderColor: '#DC2626' },
  termsText: { flex: 1, fontSize: 12, color: '#64748B', lineHeight: 18 },
  termsLink: { color: '#1E3A8A' },
  submitBtn: {
    backgroundColor: '#1E3A8A', borderRadius: 12,
    paddingVertical: 14, alignItems: 'center',
    shadowColor: '#1E3A8A', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2, shadowRadius: 8, elevation: 4,
  },
  submitBtnText: { color: 'white', fontSize: 14, fontWeight: '600' },
  secureRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 16 },
  secureText: { fontSize: 11, color: '#94A3B8' },
  bottomLink: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  bottomLinkText: { fontSize: 14, color: '#64748B' },
  bottomLinkAction: { fontSize: 14, color: '#1E3A8A', fontWeight: '500' },
  footer: { alignItems: 'center', marginTop: 24 },
  footerText: { fontSize: 10, color: '#CBD5E1', marginTop: 2 },
  successScreen: { alignItems: 'center', justifyContent: 'center', padding: 24 },
  successCard: {
    backgroundColor: 'white', borderRadius: 20, padding: 32,
    alignItems: 'center', width: '100%',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 12, elevation: 4,
  },
  successIcon: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: '#DCFCE7', alignItems: 'center',
    justifyContent: 'center', marginBottom: 20,
  },
  successTitle: { fontSize: 20, fontWeight: '600', color: '#1E293B', marginBottom: 8 },
  successText: { fontSize: 14, color: '#64748B', textAlign: 'center', lineHeight: 20 },
  successBtn: {
    marginTop: 24, backgroundColor: '#1E3A8A', borderRadius: 12,
    paddingVertical: 14, paddingHorizontal: 32, width: '100%', alignItems: 'center',
  },
  successBtnText: { color: 'white', fontSize: 14, fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  pickerSheet: {
    backgroundColor: 'white', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 20,
  },
  pickerHandle: { width: 40, height: 4, backgroundColor: '#E2E8F0', borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  pickerTitle: { fontSize: 16, fontWeight: '600', color: '#1E293B', marginBottom: 12 },
  pickerOption: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F1F5F9',
  },
  pickerOptionText: { fontSize: 15, color: '#1E293B' },
  pickerOptionActive: { color: '#1E3A8A', fontWeight: '600' },
});
