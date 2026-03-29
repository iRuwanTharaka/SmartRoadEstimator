import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Plus, Edit2, X, Trash2 } from 'lucide-react-native';
import { ratesApi, MaterialRate, LaborRate, EquipmentRate } from '../../api/rates.api';
import { useAuth } from '../../context/AuthContext';

type TabKey = 'Materials' | 'Labor' | 'Machinery';

interface RateItem {
  id: string;
  name: string;
  unit: string;
  rate: number;
}

const UNIT_OPTIONS = ['ton', 'm3', 'liter', 'hour', 'day', 'kg', 'm²', 'trip', 'unit'];

function toRate(r: MaterialRate | LaborRate | EquipmentRate): RateItem {
  if ('costPerUnit' in r) return { id: r.id, name: r.name, unit: r.unit, rate: (r as MaterialRate).costPerUnit };
  if ('costPerHour' in r) return { id: r.id, name: r.name, unit: r.unit, rate: (r as LaborRate).costPerHour };
  return { id: r.id, name: r.name, unit: r.unit, rate: (r as EquipmentRate).costPerUse };
}

export default function RateManagementScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [activeTab, setActiveTab] = useState<TabKey>('Materials');
  const [rates, setRates] = useState<Record<TabKey, RateItem[]>>({ Materials: [], Labor: [], Machinery: [] });
  const [loading, setLoading] = useState(true);
  const tabs: TabKey[] = ['Materials', 'Labor', 'Machinery'];

  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [editItem, setEditItem] = useState<RateItem | null>(null);
  const [formName, setFormName] = useState('');
  const [formUnit, setFormUnit] = useState('hour');
  const [formRate, setFormRate] = useState('');
  const [unitPickerOpen, setUnitPickerOpen] = useState(false);
  const [nameError, setNameError] = useState('');
  const [rateError, setRateError] = useState('');
  const [saving, setSaving] = useState(false);

  const loadRates = useCallback(async () => {
    try {
      setLoading(true);
      const all = await ratesApi.getAll();
      setRates({
        Materials: all.materials.map(toRate),
        Labor: all.labor.map(toRate),
        Machinery: all.equipment.map(toRate),
      });
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadRates(); }, [loadRates]);

  function openAddModal() {
    setEditItem(null);
    setFormName('');
    setFormUnit('hour');
    setFormRate('');
    setNameError('');
    setRateError('');
    setModalVisible(true);
  }

  function openEditModal(item: RateItem) {
    setEditItem(item);
    setFormName(item.name);
    setFormUnit(item.unit);
    setFormRate(String(item.rate));
    setNameError('');
    setRateError('');
    setModalVisible(true);
  }

  async function handleSave() {
    let valid = true;
    if (!formName.trim()) { setNameError('Name is required'); valid = false; } else setNameError('');
    const parsedRate = parseFloat(formRate);
    if (!formRate.trim() || isNaN(parsedRate) || parsedRate < 0) {
      setRateError('Enter a valid rate'); valid = false;
    } else setRateError('');
    if (!valid) return;

    setSaving(true);
    try {
      if (activeTab === 'Materials') {
        if (editItem) {
          await ratesApi.updateMaterial(editItem.id, { name: formName.trim(), unit: formUnit, costPerUnit: parsedRate });
        } else {
          await ratesApi.createMaterial({ name: formName.trim(), unit: formUnit, costPerUnit: parsedRate });
        }
      } else if (activeTab === 'Labor') {
        if (editItem) {
          await ratesApi.updateLabor(editItem.id, { name: formName.trim(), unit: formUnit, costPerHour: parsedRate });
        } else {
          await ratesApi.createLabor({ name: formName.trim(), unit: formUnit, costPerHour: parsedRate });
        }
      } else {
        if (editItem) {
          await ratesApi.updateEquipment(editItem.id, { name: formName.trim(), unit: formUnit, costPerUse: parsedRate });
        } else {
          await ratesApi.createEquipment({ name: formName.trim(), unit: formUnit, costPerUse: parsedRate });
        }
      }
      setModalVisible(false);
      await loadRates();
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.error ?? 'Failed to save rate.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(item: RateItem) {
    Alert.alert('Delete Rate', `Remove "${item.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          try {
            if (activeTab === 'Materials') await ratesApi.deleteMaterial(item.id);
            else if (activeTab === 'Labor') await ratesApi.deleteLabor(item.id);
            else await ratesApi.deleteEquipment(item.id);
            await loadRates();
          } catch (err: any) {
            Alert.alert('Error', err?.response?.data?.error ?? 'Failed to delete.');
          }
        },
      },
    ]);
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Rate Management</Text>
        {/* Tabs */}
        <View style={styles.tabsRow}>
          {tabs.map((tab) => (
            <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)} style={styles.tabBtn}>
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
              {activeTab === tab && <View style={styles.tabIndicator} />}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* List */}
      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color="#1E3A8A" size="large" />
      ) : (
        <ScrollView
          contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 100 }]}
          showsVerticalScrollIndicator={false}
        >
          {rates[activeTab].length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No {activeTab.toLowerCase()} rates yet.</Text>
            </View>
          ) : (
            rates[activeTab].map((item) => (
              <View key={item.id} style={styles.card}>
                <View style={styles.cardLeft}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemUnit}>Per {item.unit}</Text>
                </View>
                <View style={styles.cardRight}>
                  <Text style={styles.itemRate}>₹{item.rate.toFixed(2)}</Text>
                  {isAdmin && (
                    <>
                      <TouchableOpacity style={styles.editBtn} onPress={() => openEditModal(item)}>
                        <Edit2 color="#0D9488" size={15} />
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item)}>
                        <Trash2 color="#EF4444" size={15} />
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              </View>
            ))
          )}
        </ScrollView>
      )}

      {/* FAB — admin only */}
      {isAdmin && (
        <View style={[styles.fab, { bottom: insets.bottom + 80 }]}>
          <TouchableOpacity style={styles.fabBtn} onPress={openAddModal}>
            <Plus color="white" size={20} />
            <Text style={styles.fabText}>Add Rate</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Add / Edit Modal */}
      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.overlay}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ width: '100%', alignItems: 'center' }}>
              <View style={styles.modalCard}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{editItem ? 'Edit Rate' : 'Add New Rate'}</Text>
                  <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                    <X color="#64748B" size={18} />
                  </TouchableOpacity>
                </View>

                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryBadgeText}>{activeTab}</Text>
                </View>

                {/* Name */}
                <Text style={styles.fieldLabel}>Item Name</Text>
                <TextInput
                  style={[styles.input, nameError ? styles.inputError : null]}
                  placeholder="e.g. Asphalt Mix"
                  placeholderTextColor="#94A3B8"
                  value={formName}
                  onChangeText={(t) => { setFormName(t); if (t.trim()) setNameError(''); }}
                />
                {nameError ? <Text style={styles.errorText}>{nameError}</Text> : null}

                {/* Unit Picker */}
                <Text style={styles.fieldLabel}>Unit</Text>
                <TouchableOpacity style={styles.unitSelector} onPress={() => setUnitPickerOpen(!unitPickerOpen)}>
                  <Text style={styles.unitSelectorText}>{formUnit}</Text>
                  <Text style={styles.unitArrow}>{unitPickerOpen ? '▲' : '▼'}</Text>
                </TouchableOpacity>
                {unitPickerOpen && (
                  <View style={styles.unitDropdown}>
                    {UNIT_OPTIONS.map((u) => (
                      <TouchableOpacity
                        key={u}
                        style={[styles.unitOption, formUnit === u && styles.unitOptionActive]}
                        onPress={() => { setFormUnit(u); setUnitPickerOpen(false); }}
                      >
                        <Text style={[styles.unitOptionText, formUnit === u && styles.unitOptionTextActive]}>{u}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                {/* Rate */}
                <Text style={[styles.fieldLabel, { marginTop: unitPickerOpen ? 4 : 12 }]}>Rate (₹)</Text>
                <TextInput
                  style={[styles.input, rateError ? styles.inputError : null]}
                  placeholder="e.g. 85.00"
                  placeholderTextColor="#94A3B8"
                  keyboardType="decimal-pad"
                  value={formRate}
                  onChangeText={(t) => { setFormRate(t); if (t.trim()) setRateError(''); }}
                />
                {rateError ? <Text style={styles.errorText}>{rateError}</Text> : null}

                {/* Actions */}
                <View style={styles.modalActions}>
                  <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                    <Text style={styles.cancelBtnText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
                    {saving
                      ? <ActivityIndicator color="white" size="small" />
                      : <Text style={styles.saveBtnText}>{editItem ? 'Save Changes' : 'Add Rate'}</Text>
                    }
                  </TouchableOpacity>
                </View>
              </View>
            </KeyboardAvoidingView>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F5F7FA' },
  header: {
    backgroundColor: 'white',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04, shadowRadius: 6, elevation: 2,
  },
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#0F172A', paddingHorizontal: 24, paddingTop: 16, paddingBottom: 14 },
  tabsRow: { flexDirection: 'row', paddingHorizontal: 24, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  tabBtn: { flex: 1, paddingBottom: 12, alignItems: 'center', position: 'relative' },
  tabText: { fontSize: 14, fontWeight: '500', color: '#94A3B8' },
  tabTextActive: { color: '#2563EB' },
  tabIndicator: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, backgroundColor: '#2563EB', borderRadius: 1 },
  listContent: { padding: 20, gap: 10 },
  card: {
    backgroundColor: 'white', borderRadius: 14,
    padding: 16, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'space-between',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
    borderWidth: 1, borderColor: '#F1F5F9',
  },
  cardLeft: { gap: 2, flex: 1 },
  itemName: { fontSize: 15, fontWeight: '600', color: '#0F172A' },
  itemUnit: { fontSize: 12, color: '#64748B' },
  cardRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  itemRate: { fontSize: 16, fontWeight: '700', color: '#0F172A' },
  editBtn: { backgroundColor: '#F0FDFA', borderRadius: 10, padding: 8 },
  deleteBtn: { backgroundColor: '#FEF2F2', borderRadius: 10, padding: 8 },
  fab: { position: 'absolute', right: 24 },
  fabBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#1E3A8A', paddingHorizontal: 20, paddingVertical: 12,
    borderRadius: 50,
    shadowColor: '#1E3A8A', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
  },
  fabText: { color: 'white', fontSize: 15, fontWeight: '600' },
  emptyCard: {
    backgroundColor: 'white', borderRadius: 14, padding: 32,
    alignItems: 'center', borderWidth: 1, borderColor: '#F1F5F9',
  },
  emptyText: { fontSize: 13, color: '#94A3B8' },
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20,
  },
  modalCard: {
    backgroundColor: 'white', borderRadius: 20, padding: 20,
    width: '100%', shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15, shadowRadius: 20, elevation: 10,
  },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  modalTitle: { fontSize: 17, fontWeight: '700', color: '#0F172A' },
  closeBtn: { padding: 4 },
  categoryBadge: {
    alignSelf: 'flex-start', backgroundColor: '#EFF6FF',
    borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, marginBottom: 16,
  },
  categoryBadgeText: { fontSize: 11, color: '#1E3A8A', fontWeight: '600' },
  fieldLabel: { fontSize: 12, color: '#64748B', fontWeight: '500', marginBottom: 6 },
  input: {
    borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 10, fontSize: 14,
    color: '#0F172A', backgroundColor: '#F8FAFC', marginBottom: 4,
  },
  inputError: { borderColor: '#EF4444' },
  errorText: { fontSize: 11, color: '#EF4444', marginBottom: 8 },
  unitSelector: {
    borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 10, backgroundColor: '#F8FAFC',
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  unitSelectorText: { fontSize: 14, color: '#0F172A' },
  unitArrow: { fontSize: 10, color: '#64748B' },
  unitDropdown: {
    borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10,
    backgroundColor: 'white', marginTop: 4, overflow: 'hidden',
  },
  unitOption: { paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  unitOptionActive: { backgroundColor: '#EFF6FF' },
  unitOptionText: { fontSize: 14, color: '#0F172A' },
  unitOptionTextActive: { color: '#1E3A8A', fontWeight: '600' },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 16 },
  cancelBtn: {
    flex: 1, paddingVertical: 12, borderRadius: 10,
    borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center',
  },
  cancelBtnText: { fontSize: 14, color: '#64748B', fontWeight: '500' },
  saveBtn: {
    flex: 1, paddingVertical: 12, borderRadius: 10,
    backgroundColor: '#1E3A8A', alignItems: 'center',
  },
  saveBtnText: { fontSize: 14, color: 'white', fontWeight: '600' },
});
