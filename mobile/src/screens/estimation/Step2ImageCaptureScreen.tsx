import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import * as ImagePicker from 'expo-image-picker';
import { PageHeader } from '../../components/PageHeader';
import { ProgressIndicator } from '../../components/ProgressIndicator';
import { Camera, Upload, X, CheckCircle2 } from 'lucide-react-native';
import { imagesApi } from '../../api/images.api';

type Props = NativeStackScreenProps<RootStackParamList, 'Step2'>;

interface UploadedImage {
  uri: string;
  uploading: boolean;
  uploaded: boolean;
  error?: string;
}

export default function Step2ImageCaptureScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const { projectId } = route.params;
  const [images, setImages] = useState<UploadedImage[]>([]);

  const uploadImage = async (uri: string) => {
    setImages((prev) => [...prev, { uri, uploading: true, uploaded: false }]);
    try {
      await imagesApi.upload(projectId, uri);
      setImages((prev) =>
        prev.map((img) => img.uri === uri ? { ...img, uploading: false, uploaded: true } : img)
      );
    } catch {
      setImages((prev) =>
        prev.map((img) => img.uri === uri ? { ...img, uploading: false, error: 'Upload failed' } : img)
      );
    }
  };

  const captureFromCamera = async () => {
    if (images.length >= 5) { Alert.alert('Limit reached', 'Maximum 5 images allowed.'); return; }
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) { Alert.alert('Permission required', 'Camera permission is needed.'); return; }
    const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, quality: 0.8 });
    if (!result.canceled) await uploadImage(result.assets[0].uri);
  };

  const pickFromGallery = async () => {
    if (images.length >= 5) { Alert.alert('Limit reached', 'Maximum 5 images allowed.'); return; }
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) { Alert.alert('Permission required', 'Photo library permission is needed.'); return; }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, quality: 0.8,
    });
    if (!result.canceled) await uploadImage(result.assets[0].uri);
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const allUploaded = images.length > 0 && images.every((img) => img.uploaded || !!img.error);

  return (
    <View style={styles.screen}>
      <PageHeader title="Image Capture" />
      <ProgressIndicator currentStep={2} />

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Preview Area */}
        <View style={styles.previewBox}>
          {images.length > 0 ? (
            <Image source={{ uri: images[images.length - 1].uri }} style={styles.previewImage} />
          ) : (
            <View style={styles.previewEmpty}>
              <Camera color="#94A3B8" size={48} style={{ opacity: 0.5 }} />
              <Text style={styles.previewTitle}>Camera Preview</Text>
              <Text style={styles.previewSubtitle}>Tap capture or upload to add images</Text>
            </View>
          )}
          {images.length > 0 && (
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{images.length}/5</Text>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionRow}>
          <TouchableOpacity onPress={captureFromCamera} style={styles.captureBtn}>
            <Camera color="white" size={18} />
            <Text style={styles.captureBtnText}>Capture Image</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={pickFromGallery} style={styles.uploadBtn}>
            <Upload color="#1E3A8A" size={18} />
            <Text style={styles.uploadBtnText}>Upload Gallery</Text>
          </TouchableOpacity>
        </View>

        {/* Thumbnails */}
        {images.length > 0 && (
          <View>
            <Text style={styles.thumbLabel}>Captured Images</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {images.map((img, i) => (
                <View key={i} style={styles.thumbWrap}>
                  <Image source={{ uri: img.uri }} style={styles.thumb} />
                  {/* Upload status overlay */}
                  {img.uploading && (
                    <View style={styles.uploadOverlay}>
                      <ActivityIndicator color="white" size="small" />
                    </View>
                  )}
                  {img.uploaded && (
                    <View style={[styles.uploadOverlay, { backgroundColor: 'rgba(22,163,74,0.6)' }]}>
                      <CheckCircle2 color="white" size={16} />
                    </View>
                  )}
                  {img.error && (
                    <View style={[styles.uploadOverlay, { backgroundColor: 'rgba(220,38,38,0.6)' }]}>
                      <Text style={{ color: 'white', fontSize: 9 }}>Retry</Text>
                    </View>
                  )}
                  <TouchableOpacity onPress={() => removeImage(i)} style={styles.removeBtn}>
                    <X color="white" size={12} />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>
        )}
      </ScrollView>

      {/* Bottom Bar */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 12 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.navigate('Step3', { projectId })}
          disabled={!allUploaded}
          style={[styles.nextBtn, !allUploaded && styles.nextBtnDisabled]}
        >
          <Text style={styles.nextBtnText}>Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F5F7FA' },
  content: { padding: 16, gap: 16 },
  previewBox: {
    width: '100%', aspectRatio: 4 / 3,
    backgroundColor: '#1E293B', borderRadius: 18,
    overflow: 'hidden', alignItems: 'center', justifyContent: 'center',
  },
  previewImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  previewEmpty: { alignItems: 'center', gap: 8 },
  previewTitle: { color: '#94A3B8', fontSize: 14 },
  previewSubtitle: { color: '#64748B', fontSize: 12 },
  countBadge: {
    position: 'absolute', top: 12, right: 12,
    backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4,
  },
  countText: { color: 'white', fontSize: 12, fontWeight: '600' },
  actionRow: { flexDirection: 'row', gap: 12 },
  captureBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: '#1E3A8A', borderRadius: 14, paddingVertical: 14,
  },
  captureBtnText: { color: 'white', fontSize: 14, fontWeight: '500' },
  uploadBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: 'white', borderRadius: 14, paddingVertical: 14,
    borderWidth: 1.5, borderColor: '#1E3A8A',
  },
  uploadBtnText: { color: '#1E3A8A', fontSize: 14, fontWeight: '500' },
  thumbLabel: { fontSize: 13, color: '#64748B', marginBottom: 8 },
  thumbWrap: { position: 'relative', width: 80, height: 80, borderRadius: 12, overflow: 'hidden' },
  thumb: { width: '100%', height: '100%', resizeMode: 'cover' },
  uploadOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center', justifyContent: 'center',
  },
  removeBtn: {
    position: 'absolute', top: 4, right: 4,
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: '#DC2626', alignItems: 'center', justifyContent: 'center',
  },
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
  nextBtnText: { color: 'white', fontSize: 14, fontWeight: '600' },
});
