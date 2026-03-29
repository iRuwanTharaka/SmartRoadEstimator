import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../../navigation/types';
import Svg, { Path, G } from 'react-native-svg';
import { PageHeader } from '../../components/PageHeader';
import { ProgressIndicator } from '../../components/ProgressIndicator';
import { Ruler, Package, Users, Truck, IndianRupee, ChevronDown, ChevronUp, Save } from 'lucide-react-native';
import { estimateApi, Estimation } from '../../api/estimate.api';

type NavProp = NativeStackNavigationProp<RootStackParamList>;
type RoutePropType = RouteProp<RootStackParamList, 'Step5'>;

function formatCurrency(val: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
}

function DonutChart({ data, size = 180 }: { data: { value: number; color: string }[]; size?: number }) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  if (total === 0) return null;
  const outerR = size * 0.39;
  const innerR = size * 0.25;
  const cx = size / 2;
  const cy = size / 2;
  let angle = -Math.PI / 2;

  const paths = data.map((segment) => {
    const seg = (segment.value / total) * (2 * Math.PI - 0.15);
    const end = angle + seg;
    const large = seg > Math.PI ? 1 : 0;
    const x1 = cx + outerR * Math.cos(angle), y1 = cy + outerR * Math.sin(angle);
    const x2 = cx + outerR * Math.cos(end), y2 = cy + outerR * Math.sin(end);
    const x3 = cx + innerR * Math.cos(end), y3 = cy + innerR * Math.sin(end);
    const x4 = cx + innerR * Math.cos(angle), y4 = cy + innerR * Math.sin(angle);
    const d = `M${x1} ${y1} A${outerR} ${outerR} 0 ${large} 1 ${x2} ${y2} L${x3} ${y3} A${innerR} ${innerR} 0 ${large} 0 ${x4} ${y4}Z`;
    angle = end + 0.05;
    return { d, color: segment.color };
  });

  return (
    <Svg width={size} height={size}>
      <G>{paths.map((p, i) => <Path key={i} d={p.d} fill={p.color} />)}</G>
    </Svg>
  );
}

export default function Step5CostEstimationScreen() {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RoutePropType>();
  const insets = useSafeAreaInsets();
  const { projectId } = route.params;

  const [estimation, setEstimation] = useState<Estimation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    estimateApi.calculate(projectId)
      .then((result) => setEstimation(result))
      .catch((err) => {
        const msg = err?.response?.data?.error ?? err?.message ?? 'Failed to calculate estimation.';
        setError(msg);
      })
      .finally(() => setLoading(false));
  }, [projectId]);

  if (loading) {
    return (
      <View style={styles.screen}>
        <PageHeader title="Cost Estimation" />
        <ProgressIndicator currentStep={5} />
        <View style={styles.loadingWrap}>
          <ActivityIndicator color="#1E3A8A" size="large" />
          <Text style={styles.loadingText}>Calculating cost...</Text>
        </View>
      </View>
    );
  }

  if (error || !estimation) {
    return (
      <View style={styles.screen}>
        <PageHeader title="Cost Estimation" />
        <ProgressIndicator currentStep={5} />
        <View style={styles.loadingWrap}>
          <Text style={styles.errorText}>{error || 'Could not load estimation.'}</Text>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.retryBtn}>
            <Text style={styles.retryBtnText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const costData = [
    { name: 'Material', value: estimation.materialCost, color: '#1E3A8A' },
    { name: 'Labor', value: estimation.laborCost, color: '#0EA5A4' },
    { name: 'Equipment', value: estimation.equipmentCost, color: '#F59E0B' },
  ];

  return (
    <View style={styles.screen}>
      <PageHeader title="Cost Estimation" />
      <ProgressIndicator currentStep={5} />

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Card */}
        <View style={styles.heroCard}>
          <Text style={styles.heroLabel}>Total Estimated Cost</Text>
          <Text style={styles.heroValue}>{formatCurrency(estimation.totalCost)}</Text>
          <Text style={styles.heroSub}>For {estimation.totalArea.toFixed(1)} m² damaged area</Text>
        </View>

        {/* Summary Cards */}
        <View style={styles.grid}>
          <SummaryCard icon={<Ruler color="#1E3A8A" size={16} />} iconBg="#EFF6FF" label="Damaged Area" value={`${estimation.totalArea.toFixed(1)} m²`} />
          <SummaryCard icon={<Package color="#1E3A8A" size={16} />} iconBg="#EFF6FF" label="Material Cost" value={formatCurrency(estimation.materialCost)} />
          <SummaryCard icon={<Users color="#0EA5A4" size={16} />} iconBg="#F0FDFA" label="Labor Cost" value={formatCurrency(estimation.laborCost)} />
          <SummaryCard icon={<Truck color="#F59E0B" size={16} />} iconBg="#FFFBEB" label="Equipment Cost" value={formatCurrency(estimation.equipmentCost)} />
        </View>

        {/* Pie Chart */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Cost Breakdown</Text>
          <View style={{ alignItems: 'center', marginVertical: 8 }}>
            <DonutChart data={costData} size={180} />
          </View>
          <View style={styles.legend}>
            {costData.map((entry) => (
              <View key={entry.name} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: entry.color }]} />
                <Text style={styles.legendText}>{entry.name}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Expandable Details */}
        {estimation.breakdown && estimation.breakdown.length > 0 && (
          <View style={styles.detailsCard}>
            <TouchableOpacity onPress={() => setExpanded(!expanded)} style={styles.detailsHeader}>
              <Text style={styles.detailsTitle}>Calculation Details</Text>
              {expanded ? <ChevronUp color="#94A3B8" size={16} /> : <ChevronDown color="#94A3B8" size={16} />}
            </TouchableOpacity>
            {expanded && (
              <View style={styles.detailsList}>
                {estimation.breakdown.map((item, i) => (
                  <View key={i} style={[styles.detailRow, i === estimation.breakdown.length - 1 && { borderBottomWidth: 0 }]}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.detailLabel}>{item.label}</Text>
                      <Text style={styles.detailSub}>{item.quantity} {item.unit} × ₹{item.rate}</Text>
                    </View>
                    <Text style={styles.detailTotal}>{formatCurrency(item.total)}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Bottom Buttons */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 12 }]}>
        <TouchableOpacity
          onPress={() => navigation.navigate('BOQ', { projectId })}
          style={[styles.actionBtn, styles.boqBtn]}
        >
          <IndianRupee color="white" size={16} />
          <Text style={styles.actionBtnText}>Generate BOQ</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] })}
          style={[styles.actionBtn, styles.saveBtn]}
        >
          <Save color="white" size={16} />
          <Text style={styles.actionBtnText}>Save Project</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function SummaryCard({ icon, iconBg, label, value }: { icon: React.ReactNode; iconBg: string; label: string; value: string }) {
  return (
    <View style={styles.summaryCard}>
      <View style={styles.summaryHeader}>
        <View style={[styles.summaryIcon, { backgroundColor: iconBg }]}>{icon}</View>
        <Text style={styles.summaryLabel}>{label}</Text>
      </View>
      <Text style={styles.summaryValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F5F7FA' },
  content: { padding: 16, gap: 12 },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { fontSize: 14, color: '#64748B' },
  errorText: { fontSize: 14, color: '#DC2626', textAlign: 'center' },
  retryBtn: { backgroundColor: '#1E3A8A', borderRadius: 12, paddingVertical: 12, paddingHorizontal: 24 },
  retryBtnText: { color: 'white', fontSize: 14, fontWeight: '600' },
  heroCard: {
    backgroundColor: '#1E3A8A', borderRadius: 18, padding: 20, alignItems: 'center',
  },
  heroLabel: { color: '#BFDBFE', fontSize: 13 },
  heroValue: { color: 'white', fontSize: 30, fontWeight: '700', marginTop: 4 },
  heroSub: { color: '#93C5FD', fontSize: 12, marginTop: 4 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  summaryCard: {
    width: '48%', backgroundColor: 'white', borderRadius: 14, padding: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  summaryHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  summaryIcon: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  summaryLabel: { fontSize: 11, color: '#64748B', flex: 1 },
  summaryValue: { fontSize: 14, fontWeight: '700', color: '#1E293B', paddingLeft: 40 },
  chartCard: {
    backgroundColor: 'white', borderRadius: 18, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  chartTitle: { fontSize: 13, color: '#64748B', marginBottom: 4 },
  legend: { flexDirection: 'row', justifyContent: 'center', gap: 16, marginTop: 8 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 12, color: '#64748B' },
  detailsCard: {
    backgroundColor: 'white', borderRadius: 18, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  detailsHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
  },
  detailsTitle: { fontSize: 14, color: '#1E293B', fontWeight: '500' },
  detailsList: { borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingHorizontal: 16 },
  detailRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F8FAFC',
  },
  detailLabel: { fontSize: 12, color: '#1E293B' },
  detailSub: { fontSize: 10, color: '#94A3B8', marginTop: 2 },
  detailTotal: { fontSize: 12, color: '#1E3A8A', fontWeight: '600' },
  bottomBar: {
    flexDirection: 'row', gap: 12, paddingHorizontal: 16, paddingTop: 12,
    backgroundColor: '#F5F7FA', borderTopWidth: 1, borderTopColor: '#E2E8F0',
  },
  actionBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 14, borderRadius: 14,
  },
  boqBtn: { backgroundColor: '#1E3A8A' },
  saveBtn: { backgroundColor: '#16A34A' },
  actionBtnText: { color: 'white', fontSize: 13, fontWeight: '600' },
});
