import React, { useEffect, useState } from 'react';
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
import { FileText, FileSpreadsheet, Share2 } from 'lucide-react-native';
import { boqApi, BOQItem, BOQData } from '../../api/boq.api';

type BOQExportScreenProps = NativeStackScreenProps<RootStackParamList, 'BOQ'>;

function formatCurrency(val: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function BOQExportScreen({ route }: BOQExportScreenProps) {
  const insets = useSafeAreaInsets();
  const { projectId } = route.params;

  const [boqData, setBOQData] = useState<BOQData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pdfLoading, setPdfLoading] = useState(false);
  const [excelLoading, setExcelLoading] = useState(false);

  useEffect(() => {
    boqApi.getData(projectId)
      .then((data) => setBOQData(data))
      .catch((err) => {
        const msg = err?.response?.data?.error ?? err?.message ?? 'Failed to load BOQ data.';
        setError(msg);
      })
      .finally(() => setLoading(false));
  }, [projectId]);

  const handleExportPDF = async () => {
    setPdfLoading(true);
    try {
      await boqApi.downloadAndSharePDF(projectId);
    } catch (err: any) {
      Alert.alert('Export Failed', err?.message ?? 'Could not export PDF.');
    } finally {
      setPdfLoading(false);
    }
  };

  const handleExportExcel = async () => {
    setExcelLoading(true);
    try {
      await boqApi.downloadAndShareExcel(projectId);
    } catch (err: any) {
      Alert.alert('Export Failed', err?.message ?? 'Could not export Excel.');
    } finally {
      setExcelLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.screen}>
        <PageHeader title="Bill of Quantities" />
        <View style={styles.centerWrap}>
          <ActivityIndicator color="#1E3A8A" size="large" />
          <Text style={styles.loadingText}>Loading BOQ data...</Text>
        </View>
      </View>
    );
  }

  if (error || !boqData) {
    return (
      <View style={styles.screen}>
        <PageHeader title="Bill of Quantities" />
        <View style={styles.centerWrap}>
          <Text style={styles.errorText}>{error || 'No data found.'}</Text>
        </View>
      </View>
    );
  }

  const items: BOQItem[] = boqData.items ?? [];
  const grandTotal = boqData.grandTotal ?? boqData.estimation?.totalCost ?? 0;

  return (
    <View style={styles.screen}>
      <PageHeader title="Bill of Quantities" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}>
        {/* Project Info */}
        <View style={styles.projectInfo}>
          <View>
            <Text style={styles.infoLabel}>Project</Text>
            <Text style={styles.infoValue}>{boqData.project?.name ?? '—'}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.infoLabel}>Date</Text>
            <Text style={styles.infoValue}>{formatDate(boqData.project?.createdAt)}</Text>
          </View>
        </View>

        {/* Table */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ minWidth: 580 }}>
            {/* Header Row */}
            <View style={styles.tableHeader}>
              <Text style={[styles.thCell, { width: 30 }]}>#</Text>
              <Text style={[styles.thCell, { flex: 1 }]}>Item</Text>
              <Text style={[styles.thCell, styles.thRight, { width: 50 }]}>Qty</Text>
              <Text style={[styles.thCell, styles.thCenter, { width: 60 }]}>Unit</Text>
              <Text style={[styles.thCell, styles.thRight, { width: 70 }]}>Rate</Text>
              <Text style={[styles.thCell, styles.thRight, { width: 80 }]}>Total</Text>
            </View>

            {/* Data Rows */}
            {items.length === 0 ? (
              <View style={[styles.tableRow, { justifyContent: 'center', paddingVertical: 24 }]}>
                <Text style={{ color: '#94A3B8', fontSize: 13 }}>No BOQ items available</Text>
              </View>
            ) : (
              items.map((item, i) => (
                <View key={item.id ?? i} style={[styles.tableRow, i % 2 === 1 && styles.tableRowAlt]}>
                  <Text style={[styles.tdCell, styles.tdMuted, { width: 30 }]}>{i + 1}</Text>
                  <View style={{ flex: 1, paddingRight: 8 }}>
                    <Text style={styles.tdCell}>{item.item}</Text>
                    <Text style={styles.tdSubCell}>{item.description}</Text>
                  </View>
                  <Text style={[styles.tdCell, styles.tdRight, { width: 50 }]}>{item.qty}</Text>
                  <Text style={[styles.tdCell, styles.tdCenter, styles.tdMuted, { width: 60 }]}>{item.unit}</Text>
                  <Text style={[styles.tdCell, styles.tdRight, styles.tdMuted, { width: 70 }]}>{formatCurrency(item.rate)}</Text>
                  <Text style={[styles.tdCell, styles.tdRight, styles.tdPrimary, { width: 80 }]}>{formatCurrency(item.total)}</Text>
                </View>
              ))
            )}
          </View>
        </ScrollView>

        {/* Grand Total */}
        <View style={styles.totalCard}>
          <View style={{ flex: 1 }}>
            <Text style={styles.totalLabel}>Grand Total</Text>
            <Text style={styles.totalSub}>Including all materials, labor & equipment</Text>
          </View>
          <Text style={styles.totalValue}>{formatCurrency(grandTotal)}</Text>
        </View>

        {/* Tax Note */}
        <View style={styles.taxNote}>
          <Text style={styles.taxText}>
            Note: GST @18% and contractor profit @15% not included. Add as applicable.
          </Text>
        </View>
      </ScrollView>

      {/* Export Buttons */}
      <View style={[styles.exportBar, { paddingBottom: insets.bottom + 12 }]}>
        <TouchableOpacity
          style={[styles.exportBtn, { backgroundColor: '#DC2626' }]}
          onPress={handleExportPDF}
          disabled={pdfLoading}
        >
          {pdfLoading
            ? <ActivityIndicator color="white" size="small" />
            : <FileText color="white" size={20} />}
          <Text style={styles.exportBtnText}>PDF</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.exportBtn, { backgroundColor: '#16A34A' }]}
          onPress={handleExportExcel}
          disabled={excelLoading}
        >
          {excelLoading
            ? <ActivityIndicator color="white" size="small" />
            : <FileSpreadsheet color="white" size={20} />}
          <Text style={styles.exportBtnText}>Excel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.exportBtn, { backgroundColor: '#1E3A8A' }]}
          onPress={handleExportPDF}
          disabled={pdfLoading}
        >
          <Share2 color="white" size={20} />
          <Text style={styles.exportBtnText}>Share</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F5F7FA' },
  centerWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { fontSize: 14, color: '#64748B' },
  errorText: { fontSize: 14, color: '#DC2626', textAlign: 'center', paddingHorizontal: 24 },
  projectInfo: {
    backgroundColor: 'white', flexDirection: 'row', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9',
  },
  infoLabel: { fontSize: 11, color: '#64748B' },
  infoValue: { fontSize: 13, color: '#1E293B', fontWeight: '500', marginTop: 2 },
  tableHeader: {
    flexDirection: 'row', backgroundColor: '#1E3A8A', paddingHorizontal: 12, paddingVertical: 10,
  },
  thCell: { fontSize: 10, color: 'white', fontWeight: '600' },
  thRight: { textAlign: 'right' },
  thCenter: { textAlign: 'center' },
  tableRow: {
    flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 10,
    backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#F1F5F9',
  },
  tableRowAlt: { backgroundColor: '#F8FAFC' },
  tdCell: { fontSize: 11, color: '#1E293B' },
  tdSubCell: { fontSize: 9, color: '#94A3B8', marginTop: 2 },
  tdRight: { textAlign: 'right' },
  tdCenter: { textAlign: 'center' },
  tdMuted: { color: '#64748B' },
  tdPrimary: { color: '#1E3A8A', fontWeight: '600' },
  totalCard: {
    margin: 16, backgroundColor: '#1E3A8A', borderRadius: 18,
    padding: 16, flexDirection: 'row', alignItems: 'center',
  },
  totalLabel: { color: '#BFDBFE', fontSize: 14 },
  totalSub: { color: '#93C5FD', fontSize: 11, marginTop: 2 },
  totalValue: { color: 'white', fontSize: 20, fontWeight: '700' },
  taxNote: {
    marginHorizontal: 16, marginBottom: 8, backgroundColor: '#FFFBEB',
    borderRadius: 12, padding: 12,
  },
  taxText: { fontSize: 12, color: '#92400E' },
  exportBar: {
    flexDirection: 'row', gap: 10, paddingHorizontal: 16, paddingTop: 12,
    backgroundColor: '#F5F7FA', borderTopWidth: 1, borderTopColor: '#E2E8F0',
  },
  exportBtn: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 12, borderRadius: 14,
  },
  exportBtnText: { color: 'white', fontSize: 10, fontWeight: '600' },
});
