import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../../navigation/types';
import { PageHeader } from '../../components/PageHeader';
import { ProgressIndicator } from '../../components/ProgressIndicator';
import { AlertTriangle, Target, Ruler } from 'lucide-react-native';
import { analysisApi, Detection } from '../../api/analysis.api';

type NavProp = NativeStackNavigationProp<RootStackParamList>;
type RoutePropType = RouteProp<RootStackParamList, 'Step3'>;

const severityColor = (s: string) => {
  if (s === 'HIGH') return '#DC2626';
  if (s === 'MEDIUM') return '#F59E0B';
  return '#0EA5A4';
};

export default function Step3AIAnalysisScreen() {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RoutePropType>();
  const insets = useSafeAreaInsets();
  const { projectId } = route.params;

  const [analyzing, setAnalyzing] = useState(true);
  const [progress, setProgress] = useState(0);
  const [detections, setDetections] = useState<Detection[]>([]);
  const [totalArea, setTotalArea] = useState(0);
  const [severity, setSeverity] = useState('');
  const [error, setError] = useState('');

  const spinAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start spinner
    Animated.loop(
      Animated.timing(spinAnim, { toValue: 1, duration: 1000, useNativeDriver: true })
    ).start();

    // Simulate progress while API runs
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) { clearInterval(interval); return 90; }
        return prev + 3;
      });
    }, 100);

    // Run analysis
    analysisApi.run(projectId)
      .then((result) => {
        setDetections(result.detections ?? []);
        setTotalArea(result.totalArea ?? 0);
        setSeverity(result.severity ?? '');
        clearInterval(interval);
        setProgress(100);
        setTimeout(() => setAnalyzing(false), 400);
      })
      .catch((err) => {
        clearInterval(interval);
        const msg = err?.response?.data?.error ?? err?.message ?? 'Analysis failed.';
        setError(msg);
        setAnalyzing(false);
      });

    return () => clearInterval(interval);
  }, [projectId]);

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 100,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const spin = spinAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const progressWidth = progressAnim.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] });

  return (
    <View style={styles.screen}>
      <PageHeader title="AI Analysis" />
      <ProgressIndicator currentStep={3} />

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Analysis Progress Card */}
        {analyzing && (
          <View style={styles.progressCard}>
            <View style={{ alignItems: 'center', marginBottom: 16 }}>
              <Animated.View style={[styles.spinner, { transform: [{ rotate: spin }] }]} />
              <Text style={styles.analyzingTitle}>Analyzing road surface...</Text>
              <Text style={styles.analyzingPct}>{progress}%</Text>
            </View>
            <View style={styles.progressBar}>
              <Animated.View style={[styles.progressFill, { width: progressWidth as any }]} />
            </View>
          </View>
        )}

        {/* Error State */}
        {!analyzing && error ? (
          <View style={styles.errorCard}>
            <AlertTriangle color="#DC2626" size={32} />
            <Text style={styles.errorTitle}>Analysis Failed</Text>
            <Text style={styles.errorMsg}>{error}</Text>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.retryBtn}
            >
              <Text style={styles.retryBtnText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* Results */}
        {!analyzing && !error && (
          <View style={styles.results}>
            <StatCard
              icon={<Target color="#DC2626" size={20} />}
              iconBg="#FEF2F2"
              label="Detected Potholes"
              value={String(detections.length)}
            />
            <StatCard
              icon={<Ruler color="#1E3A8A" size={20} />}
              iconBg="#EFF6FF"
              label="Total Damaged Area"
              value={`${totalArea.toFixed(1)} m²`}
            />
            <StatCard
              icon={<AlertTriangle color="#F59E0B" size={20} />}
              iconBg="#FFFBEB"
              label="Severity Level"
              value={severity ? (severity.charAt(0) + severity.slice(1).toLowerCase()) : '—'}
              valueColor="#F59E0B"
            />

            {/* Detections list */}
            {detections.length > 0 && (
              <View style={styles.detectionList}>
                <Text style={styles.detectionTitle}>Detected Regions</Text>
                {detections.map((d, i) => (
                  <View key={d.id ?? i} style={styles.detectionRow}>
                    <View style={[styles.detectionDot, { backgroundColor: severityColor(d.severity) }]} />
                    <Text style={styles.detectionLabel}>{d.label ?? `Region #${i + 1}`}</Text>
                    <View style={[styles.severityBadge, { backgroundColor: severityColor(d.severity) }]}>
                      <Text style={styles.severityText}>{d.severity}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Bottom Bar */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 12 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.navigate('Step4', { projectId })}
          disabled={analyzing || !!error}
          style={[styles.nextBtn, (analyzing || !!error) && styles.nextBtnDisabled]}
        >
          <Text style={styles.nextBtnText}>Proceed to Verification</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function StatCard({ icon, iconBg, label, value, valueColor = '#1E293B' }: {
  icon: React.ReactNode; iconBg: string; label: string; value: string; valueColor?: string;
}) {
  return (
    <View style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: iconBg }]}>{icon}</View>
      <View style={{ flex: 1 }}>
        <Text style={styles.statLabel}>{label}</Text>
        <Text style={[styles.statValue, { color: valueColor }]}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F5F7FA' },
  content: { padding: 16, gap: 14 },
  progressCard: {
    backgroundColor: 'white', borderRadius: 18,
    padding: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 10, elevation: 3,
  },
  spinner: {
    width: 56, height: 56, borderRadius: 28,
    borderWidth: 4, borderColor: '#E2E8F0', borderTopColor: '#1E3A8A',
    marginBottom: 16,
  },
  analyzingTitle: { color: '#1E293B', fontSize: 15, fontWeight: '600', marginBottom: 4 },
  analyzingPct: { color: '#1E3A8A', fontSize: 24, fontWeight: '700', marginBottom: 16 },
  progressBar: { height: 10, backgroundColor: '#E2E8F0', borderRadius: 5, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#1E3A8A', borderRadius: 5 },
  errorCard: {
    backgroundColor: 'white', borderRadius: 18, padding: 32, alignItems: 'center', gap: 8,
  },
  errorTitle: { fontSize: 17, fontWeight: '600', color: '#1E293B' },
  errorMsg: { fontSize: 13, color: '#64748B', textAlign: 'center' },
  retryBtn: { marginTop: 8, backgroundColor: '#DC2626', borderRadius: 12, paddingVertical: 12, paddingHorizontal: 24 },
  retryBtnText: { color: 'white', fontSize: 14, fontWeight: '600' },
  results: { gap: 8 },
  statCard: {
    backgroundColor: 'white', borderRadius: 14, padding: 14,
    flexDirection: 'row', alignItems: 'center', gap: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  statIcon: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  statLabel: { fontSize: 12, color: '#64748B' },
  statValue: { fontSize: 18, fontWeight: '600', marginTop: 2 },
  detectionList: {
    backgroundColor: 'white', borderRadius: 14, padding: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 4, elevation: 1, gap: 6,
  },
  detectionTitle: { fontSize: 12, color: '#64748B', marginBottom: 4 },
  detectionRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  detectionDot: { width: 8, height: 8, borderRadius: 4 },
  detectionLabel: { flex: 1, fontSize: 14, color: '#1E293B' },
  severityBadge: { borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3 },
  severityText: { color: 'white', fontSize: 10, fontWeight: '600' },
  bottomBar: {
    flexDirection: 'row', gap: 12, paddingHorizontal: 16, paddingTop: 12,
    backgroundColor: '#F5F7FA', borderTopWidth: 1, borderTopColor: '#E2E8F0',
  },
  backBtn: {
    flex: 1, paddingVertical: 14, backgroundColor: 'white', borderRadius: 14, alignItems: 'center',
    borderWidth: 1, borderColor: '#E2E8F0',
  },
  backBtnText: { fontSize: 14, color: '#64748B', fontWeight: '500' },
  nextBtn: { flex: 2, paddingVertical: 14, backgroundColor: '#1E3A8A', borderRadius: 14, alignItems: 'center' },
  nextBtnDisabled: { backgroundColor: '#94A3B8' },
  nextBtnText: { color: 'white', fontSize: 13, fontWeight: '600' },
});
