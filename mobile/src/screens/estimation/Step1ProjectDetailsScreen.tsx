import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import { MapPin, Ruler, Layers, User, FileText, Check } from 'lucide-react-native';
import { PageHeader } from '../../components/PageHeader';
import { ProgressIndicator } from '../../components/ProgressIndicator';
import { projectsApi } from '../../api/projects.api';

type NavProp = NativeStackNavigationProp<RootStackParamList>;

const SURFACE_TYPES = ['ASPHALT', 'CONCRETE', 'GRAVEL', 'DIRT', 'OTHER'];
const surfaceLabel = (s: string) => s.charAt(0) + s.slice(1).toLowerCase();

export default function Step1ProjectDetailsScreen() {
  const navigation = useNavigation<NavProp>();
  const insets = useSafeAreaInsets();

  const [projectName, setProjectName] = useState('');
  const [location, setLocation] = useState('');
  const [roadLength, setRoadLength] = useState('');
  const [roadWidth, setRoadWidth] = useState('');
  const [surfaceType, setSurfaceType] = useState('ASPHALT');
  const [contractor, setContractor] = useState('');
  const [notes, setNotes] = useState('');
  const [surfaceModal, setSurfaceModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; location?: string }>({});
  const [submitted, setSubmitted] = useState(false);

  const validate = () => {
    const errs: { name?: string; location?: string } = {};
    if (!projectName.trim()) errs.name = 'Project name is required';
    if (!location.trim()) errs.location = 'Location is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = async () => {
    setSubmitted(true);
    if (!validate()) return;
    setLoading(true);
    try {
      const project = await projectsApi.create({
        name: projectName.trim(),
        location: location.trim(),
        roadLength: roadLength ? parseFloat(roadLength) : undefined,
        roadWidth: roadWidth ? parseFloat(roadWidth) : undefined,
        surfaceType,
        contractor: contractor.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      navigation.navigate('Step2', { projectId: project.id });
    } catch (err: any) {
      const msg = err?.response?.data?.error ?? err?.message ?? 'Failed to create project.';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.screen}>
      <PageHeader title="Project Details" />
      <ProgressIndicator currentStep={1} />

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>BASIC INFORMATION</Text>

          <View style={styles.field}>
            <Text style={styles.label}>Project Name *</Text>
            <View style={[styles.inputRow, submitted && errors.name ? styles.inputError : styles.inputNormal]}>
              <FileText color="#94A3B8" size={16} />
              <TextInput
                style={styles.input}
                value={projectName}
                onChangeText={(t) => { setProjectName(t); if (submitted) setErrors((p) => ({ ...p, name: undefined })); }}
                placeholder="e.g. NH-44 Pothole Repair"
                placeholderTextColor="#CBD5E1"
              />
            </View>
            {submitted && errors.name ? <Text style={styles.errText}>{errors.name}</Text> : null}
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Location *</Text>
            <View style={[styles.inputRow, submitted && errors.location ? styles.inputError : styles.inputNormal]}>
              <MapPin color="#94A3B8" size={16} />
              <TextInput
                style={styles.input}
                value={location}
                onChangeText={(t) => { setLocation(t); if (submitted) setErrors((p) => ({ ...p, location: undefined })); }}
                placeholder="e.g. Kilometer 12.5, NH-44"
                placeholderTextColor="#CBD5E1"
              />
            </View>
            {submitted && errors.location ? <Text style={styles.errText}>{errors.location}</Text> : null}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>ROAD DIMENSIONS</Text>
          <View style={styles.dimRow}>
            <View style={[styles.field, { flex: 1 }]}>
              <Text style={styles.label}>Length (m)</Text>
              <View style={[styles.inputRow, styles.inputNormal]}>
                <Ruler color="#94A3B8" size={16} />
                <TextInput
                  style={styles.input}
                  value={roadLength}
                  onChangeText={setRoadLength}
                  placeholder="0.00"
                  placeholderTextColor="#CBD5E1"
                  keyboardType="decimal-pad"
                />
              </View>
            </View>
            <View style={[styles.field, { flex: 1 }]}>
              <Text style={styles.label}>Width (m)</Text>
              <View style={[styles.inputRow, styles.inputNormal]}>
                <Ruler color="#94A3B8" size={16} style={{ transform: [{ rotate: '90deg' }] }} />
                <TextInput
                  style={styles.input}
                  value={roadWidth}
                  onChangeText={setRoadWidth}
                  placeholder="0.00"
                  placeholderTextColor="#CBD5E1"
                  keyboardType="decimal-pad"
                />
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>SURFACE TYPE</Text>
          <TouchableOpacity onPress={() => setSurfaceModal(true)} style={[styles.inputRow, styles.inputNormal]}>
            <Layers color="#94A3B8" size={16} />
            <Text style={styles.pickerText}>{surfaceLabel(surfaceType)}</Text>
            <Text style={styles.pickerArrow}>▼</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>OPTIONAL DETAILS</Text>
          <View style={styles.field}>
            <Text style={styles.label}>Contractor Name</Text>
            <View style={[styles.inputRow, styles.inputNormal]}>
              <User color="#94A3B8" size={16} />
              <TextInput
                style={styles.input}
                value={contractor}
                onChangeText={setContractor}
                placeholder="e.g. XYZ Construction Ltd."
                placeholderTextColor="#CBD5E1"
              />
            </View>
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>Additional Notes</Text>
            <TextInput
              style={[styles.notesInput, styles.inputNormal]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Any additional observations or requirements..."
              placeholderTextColor="#CBD5E1"
              multiline
              numberOfLines={3}
            />
          </View>
        </View>
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 12 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleNext} disabled={loading} style={[styles.nextBtn, loading && { opacity: 0.8 }]}>
          {loading ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Text style={styles.nextBtnText}>Next: Image Capture</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Surface Type Modal */}
      <Modal visible={surfaceModal} transparent animationType="slide" onRequestClose={() => setSurfaceModal(false)}>
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setSurfaceModal(false)}>
          <View style={[styles.pickerSheet, { paddingBottom: insets.bottom + 16 }]}>
            <View style={styles.pickerHandle} />
            <Text style={styles.pickerTitle}>Select Surface Type</Text>
            {SURFACE_TYPES.map((s) => (
              <TouchableOpacity
                key={s}
                style={styles.pickerOption}
                onPress={() => { setSurfaceType(s); setSurfaceModal(false); }}
              >
                <Text style={[styles.pickerOptionText, surfaceType === s && styles.pickerOptionActive]}>
                  {surfaceLabel(s)}
                </Text>
                {surfaceType === s && <Check color="#1E3A8A" size={16} />}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F5F7FA' },
  content: { padding: 16, gap: 8 },
  section: { gap: 8 },
  sectionLabel: { fontSize: 11, color: '#94A3B8', fontWeight: '700', letterSpacing: 0.5, marginTop: 8, marginBottom: 4 },
  field: { marginBottom: 4 },
  label: { fontSize: 12, color: '#64748B', marginBottom: 6 },
  inputRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'white', borderWidth: 1,
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, gap: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 3, elevation: 1,
  },
  inputNormal: { borderColor: '#E2E8F0' },
  inputError: { borderColor: '#DC2626' },
  input: { flex: 1, fontSize: 14, color: '#1E293B' },
  pickerText: { flex: 1, fontSize: 14, color: '#1E293B' },
  pickerArrow: { fontSize: 10, color: '#94A3B8' },
  errText: { fontSize: 11, color: '#DC2626', marginTop: 4, marginLeft: 4 },
  dimRow: { flexDirection: 'row', gap: 10 },
  notesInput: {
    backgroundColor: 'white', borderWidth: 1, borderColor: '#E2E8F0',
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 14, color: '#1E293B', textAlignVertical: 'top', minHeight: 80,
  },
  bottomBar: {
    flexDirection: 'row', gap: 12, paddingHorizontal: 16, paddingTop: 12,
    backgroundColor: '#F5F7FA', borderTopWidth: 1, borderTopColor: '#E2E8F0',
  },
  backBtn: {
    flex: 1, paddingVertical: 14, backgroundColor: 'white',
    borderRadius: 14, alignItems: 'center',
    borderWidth: 1, borderColor: '#E2E8F0',
  },
  backBtnText: { fontSize: 14, color: '#64748B', fontWeight: '500' },
  nextBtn: { flex: 2, paddingVertical: 14, backgroundColor: '#1E3A8A', borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  nextBtnText: { color: 'white', fontSize: 14, fontWeight: '600' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  pickerSheet: {
    backgroundColor: 'white', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20,
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
