import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import { PageHeader } from '../../components/PageHeader';
import { ProgressIndicator } from '../../components/ProgressIndicator';
import { Plus, Trash2, RotateCcw } from 'lucide-react-native';
import { analysisApi, Detection } from '../../api/analysis.api';

type Step4Props = NativeStackScreenProps<RootStackParamList, 'Step4'>;

interface Pothole {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
}

const severityColor = (severity: string) => {
  if (severity === 'HIGH') return '#DC2626';
  if (severity === 'MEDIUM') return '#F59E0B';
  return '#0EA5A4';
};

function detectionToPothole(d: Detection): Pothole {
  return {
    id: d.id,
    x: d.x,
    y: d.y,
    w: d.width,
    h: d.height,
    label: d.label ?? `Region #${d.id.slice(-4)}`,
    severity: d.severity,
  };
}

export default function Step4ManualVerificationScreen({ route, navigation }: Step4Props) {
  const insets = useSafeAreaInsets();
  const { projectId } = route.params;

  const [potholes, setPotholes] = useState<Pothole[]>([]);
  const [originalPotholes, setOriginalPotholes] = useState<Pothole[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    analysisApi.getDetections(projectId).then((dets) => {
      const items = dets.map(detectionToPothole);
      setPotholes(items);
      setOriginalPotholes(items);
    }).catch(() => {
      // fallback: empty list
      setPotholes([]);
      setOriginalPotholes([]);
    }).finally(() => setLoading(false));
  }, [projectId]);

  const addPothole = () => {
    const newId = `new-${Date.now()}`;
    const newItem: Pothole = {
      id: newId,
      x: 10 + Math.random() * 50,
      y: 10 + Math.random() * 50,
      w: 20, h: 15,
      label: `Region #${potholes.length + 1}`,
      severity: 'LOW',
    };
    setPotholes((prev) => [...prev, newItem]);
    setSelectedId(newId);
  };

  const removeSelected = () => {
    if (selectedId !== null) {
      setPotholes(potholes.filter((p) => p.id !== selectedId));
      setSelectedId(null);
    }
  };

  const resetChanges = () => {
    setPotholes(originalPotholes);
    setSelectedId(null);
  };

  const handleConfirm = async () => {
    setSaving(true);
    try {
      await analysisApi.updateDetections(projectId, potholes.map((p) => ({
        id: p.id.startsWith('new-') ? undefined : p.id,
        x: p.x,
        y: p.y,
        width: p.w,
        height: p.h,
        severity: p.severity,
        label: p.label,
      })));
      navigation.navigate('Step5', { projectId });
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.error ?? 'Failed to save verifications.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.screen}>
        <PageHeader title="Manual Verification" />
        <ProgressIndicator currentStep={4} />
        <View style={styles.loadingWrap}>
          <ActivityIndicator color="#1E3A8A" size="large" />
          <Text style={styles.loadingText}>Loading detections...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <PageHeader title="Manual Verification" />
      <ProgressIndicator currentStep={4} />

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Tool Buttons */}
        <View style={styles.toolRow}>
          <TouchableOpacity onPress={addPothole} style={styles.toolBtnAdd}>
            <Plus color="white" size={16} />
            <Text style={styles.toolBtnTextLight}>Add</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={removeSelected}
            disabled={selectedId === null}
            style={[styles.toolBtnRemove, selectedId === null && styles.toolBtnDisabled]}
          >
            <Trash2 color={selectedId !== null ? 'white' : '#94A3B8'} size={16} />
            <Text style={[styles.toolBtnTextLight, selectedId === null && { color: '#94A3B8' }]}>Remove</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={resetChanges} style={styles.toolBtnReset}>
            <RotateCcw color="#64748B" size={16} />
            <Text style={styles.toolBtnTextDark}>Reset</Text>
          </TouchableOpacity>
        </View>

        {/* List */}
        <View style={styles.listCard}>
          <Text style={styles.listTitle}>Detected Items ({potholes.length})</Text>
          {potholes.length === 0 ? (
            <Text style={styles.emptyText}>No detections found. You can add them manually.</Text>
          ) : (
            <View style={styles.listItems}>
              {potholes.map((p) => {
                const color = severityColor(p.severity);
                const isSelected = selectedId === p.id;
                return (
                  <TouchableOpacity
                    key={p.id}
                    onPress={() => setSelectedId(selectedId === p.id ? null : p.id)}
                    style={[styles.listItem, isSelected && styles.listItemSelected]}
                  >
                    <View style={[styles.severityDot, { backgroundColor: color }]} />
                    <Text style={styles.listItemName}>{p.label}</Text>
                    <View style={[styles.severityBadge, { backgroundColor: color }]}>
                      <Text style={styles.severityText}>{p.severity}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        {/* Severity Reference */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Severity Guide</Text>
          {[
            { label: 'HIGH — Deep potholes, structural damage', color: '#DC2626' },
            { label: 'MEDIUM — Moderate damage, cracking', color: '#F59E0B' },
            { label: 'LOW — Surface wear, minor depressions', color: '#0EA5A4' },
          ].map((item) => (
            <View key={item.label} style={styles.infoRow}>
              <View style={[styles.infoDot, { backgroundColor: item.color }]} />
              <Text style={styles.infoText}>{item.label}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Bottom Bar */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 12 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleConfirm} disabled={saving} style={[styles.nextBtn, saving && { opacity: 0.8 }]}>
          {saving ? <ActivityIndicator color="white" size="small" /> : <Text style={styles.nextBtnText}>Confirm & Calculate Cost</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F5F7FA' },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { fontSize: 14, color: '#64748B' },
  content: { padding: 16, gap: 14 },
  toolRow: { flexDirection: 'row', gap: 8 },
  toolBtnAdd: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 10, backgroundColor: '#0EA5A4', borderRadius: 12,
  },
  toolBtnRemove: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 10, backgroundColor: '#DC2626', borderRadius: 12,
  },
  toolBtnDisabled: { backgroundColor: '#E2E8F0' },
  toolBtnReset: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 10, backgroundColor: 'white', borderRadius: 12,
    borderWidth: 1, borderColor: '#E2E8F0',
  },
  toolBtnTextLight: { color: 'white', fontSize: 14, fontWeight: '500' },
  toolBtnTextDark: { color: '#64748B', fontSize: 14, fontWeight: '500' },
  listCard: {
    backgroundColor: 'white', borderRadius: 14, padding: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  listTitle: { fontSize: 12, color: '#64748B', marginBottom: 10 },
  listItems: { gap: 6 },
  listItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 12, paddingVertical: 10,
    backgroundColor: '#F8FAFC', borderRadius: 10, gap: 8,
  },
  listItemSelected: { backgroundColor: '#EFF6FF', borderWidth: 1, borderColor: 'rgba(30,58,138,0.2)' },
  severityDot: { width: 10, height: 10, borderRadius: 5 },
  listItemName: { flex: 1, fontSize: 14, color: '#1E293B' },
  severityBadge: { borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3 },
  severityText: { color: 'white', fontSize: 10, fontWeight: '600' },
  emptyText: { fontSize: 13, color: '#94A3B8', textAlign: 'center', paddingVertical: 12 },
  infoCard: {
    backgroundColor: 'white', borderRadius: 14, padding: 14, gap: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  infoTitle: { fontSize: 12, color: '#64748B', marginBottom: 2 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  infoDot: { width: 8, height: 8, borderRadius: 4 },
  infoText: { fontSize: 12, color: '#475569' },
  bottomBar: {
    flexDirection: 'row', gap: 12, paddingHorizontal: 16, paddingTop: 12,
    backgroundColor: '#F5F7FA', borderTopWidth: 1, borderTopColor: '#E2E8F0',
  },
  backBtn: {
    flex: 1, paddingVertical: 14, backgroundColor: 'white', borderRadius: 14, alignItems: 'center',
    borderWidth: 1, borderColor: '#E2E8F0',
  },
  backBtnText: { fontSize: 14, color: '#64748B', fontWeight: '500' },
  nextBtn: { flex: 2, paddingVertical: 14, backgroundColor: '#1E3A8A', borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  nextBtnText: { color: 'white', fontSize: 13, fontWeight: '600' },
});
