import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import {
  MapPin,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';

type NavProp = NativeStackNavigationProp<RootStackParamList>;

export default function LoginScreen() {
  const navigation = useNavigation<NavProp>();
  const insets = useSafeAreaInsets();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [submitted, setSubmitted] = useState(false);
  const [apiError, setApiError] = useState('');

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const cardFade = useRef(new Animated.Value(0)).current;
  const cardSlide = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(cardFade, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(cardSlide, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]).start();
    }, 150);
  }, []);

  const validate = () => {
    const errs: { email?: string; password?: string } = {};
    if (!email.trim()) errs.email = 'Email address is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Enter a valid email address';
    if (!password) errs.password = 'Password is required';
    else if (password.length < 6) errs.password = 'Password must be at least 6 characters';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleLogin = async () => {
    setSubmitted(true);
    setApiError('');
    if (!validate()) return;
    setLoading(true);
    try {
      await login(email.trim().toLowerCase(), password);
      navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
    } catch (err: any) {
      const msg =
        err?.response?.data?.error ?? err?.message ?? 'Login failed. Please try again.';
      setApiError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.screen} contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        {/* Gradient Header */}
        <LinearGradient
          colors={['#1E3A8A', '#1E40AF', '#0EA5A4']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.header, { paddingTop: insets.top + 24 }]}
        >
          <View style={styles.deco1} />
          <View style={styles.deco2} />
          <View style={styles.deco3} />
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            <View style={styles.logoBox}>
              <MapPin color="white" size={32} />
            </View>
            <Text style={styles.appTitle}>Smart Road Estimator</Text>
            <Text style={styles.appSubtitle}>AI-Based Road Damage & Cost Analysis</Text>
          </Animated.View>
        </LinearGradient>

        {/* Card */}
        <Animated.View style={[styles.cardWrap, { opacity: cardFade, transform: [{ translateY: cardSlide }] }]}>
          <View style={styles.card}>
            <View style={{ marginBottom: 20 }}>
              <Text style={styles.welcomeTitle}>Welcome Back</Text>
              <Text style={styles.welcomeSub}>Sign in to your account</Text>
            </View>

            {/* API Error Banner */}
            {apiError ? (
              <View style={styles.errorBanner}>
                <AlertCircle color="#DC2626" size={14} />
                <Text style={styles.errorBannerText}>{apiError}</Text>
              </View>
            ) : null}

            {/* Email */}
            <View style={styles.fieldWrap}>
              <Text style={styles.label}>Email Address</Text>
              <View style={[styles.inputRow, submitted && errors.email ? styles.inputError : styles.inputNormal]}>
                <Mail color="#94A3B8" size={16} />
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={(v) => { setEmail(v); setApiError(''); if (submitted) setErrors((p) => ({ ...p, email: undefined })); }}
                  placeholder="engineer@example.com"
                  placeholderTextColor="#CBD5E1"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              {submitted && errors.email ? (
                <View style={styles.errRow}>
                  <AlertCircle color="#DC2626" size={12} />
                  <Text style={styles.errText}>{errors.email}</Text>
                </View>
              ) : null}
            </View>

            {/* Password */}
            <View style={styles.fieldWrap}>
              <Text style={styles.label}>Password</Text>
              <View style={[styles.inputRow, submitted && errors.password ? styles.inputError : styles.inputNormal]}>
                <Lock color="#94A3B8" size={16} />
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  value={password}
                  onChangeText={(v) => { setPassword(v); setApiError(''); if (submitted) setErrors((p) => ({ ...p, password: undefined })); }}
                  placeholder="Enter your password"
                  placeholderTextColor="#CBD5E1"
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword((v) => !v)} style={{ padding: 4 }}>
                  {showPassword ? <EyeOff color="#94A3B8" size={16} /> : <Eye color="#94A3B8" size={16} />}
                </TouchableOpacity>
              </View>
              {submitted && errors.password ? (
                <View style={styles.errRow}>
                  <AlertCircle color="#DC2626" size={12} />
                  <Text style={styles.errText}>{errors.password}</Text>
                </View>
              ) : null}
            </View>

            {/* Forgot */}
            <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')} style={styles.forgotWrap}>
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>

            {/* Login Button */}
            <TouchableOpacity
              onPress={handleLogin}
              disabled={loading}
              style={[styles.loginBtn, loading && { opacity: 0.8 }]}
            >
              {loading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text style={styles.loginBtnText}>Login</Text>
              )}
            </TouchableOpacity>

            {/* Secure */}
            <View style={styles.secureRow}>
              <ShieldCheck color="#0EA5A4" size={14} />
              <Text style={styles.secureText}>Secure Authentication</Text>
            </View>
          </View>

          {/* Bottom link */}
          <View style={styles.bottomLink}>
            <Text style={styles.bottomLinkText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
              <Text style={styles.bottomLinkAction}>Create Account</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
            <Text style={styles.footerText}>Smart Road Estimator v2.1.0</Text>
            <Text style={styles.footerText}>© 2026 NHAI Engineering Division</Text>
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F5F7FA' },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 48,
    alignItems: 'center',
    overflow: 'hidden',
  },
  deco1: { position: 'absolute', top: 16, left: 16, width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(255,255,255,0.05)' },
  deco2: { position: 'absolute', bottom: 32, right: 24, width: 96, height: 96, borderRadius: 48, backgroundColor: 'rgba(255,255,255,0.05)' },
  deco3: { position: 'absolute', top: 48, right: 40, width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.05)' },
  logoBox: {
    width: 64, height: 64,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  appTitle: { color: 'white', fontSize: 20, fontWeight: '600', textAlign: 'center' },
  appSubtitle: { color: '#BFDBFE', fontSize: 13, textAlign: 'center', marginTop: 4 },
  cardWrap: { flex: 1, paddingHorizontal: 20, marginTop: -24, paddingBottom: 24 },
  card: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  welcomeTitle: { fontSize: 18, fontWeight: '600', color: '#1E293B' },
  welcomeSub: { fontSize: 13, color: '#64748B', marginTop: 2 },
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
  errRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4, paddingLeft: 4 },
  errText: { fontSize: 11, color: '#DC2626' },
  forgotWrap: { alignItems: 'flex-end', marginBottom: 16, marginTop: -8 },
  forgotText: { fontSize: 12, color: '#1E3A8A' },
  loginBtn: {
    backgroundColor: '#1E3A8A',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1E3A8A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  loginBtnText: { color: 'white', fontSize: 14, fontWeight: '600' },
  secureRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 16 },
  secureText: { fontSize: 11, color: '#94A3B8' },
  bottomLink: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  bottomLinkText: { fontSize: 14, color: '#64748B' },
  bottomLinkAction: { fontSize: 14, color: '#1E3A8A', fontWeight: '500' },
  footer: { alignItems: 'center', marginTop: 32 },
  footerText: { fontSize: 10, color: '#CBD5E1', marginTop: 2 },
});
