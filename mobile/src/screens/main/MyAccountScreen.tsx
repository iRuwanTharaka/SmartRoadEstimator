import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import {
  Mail, Phone, BadgeCheck, Shield, Lock, Bell, Moon, Globe,
  RefreshCw, Crown, HardDrive, ChevronRight, LogOut, Trash2, Pencil, User,
} from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';

type NavProp = NativeStackNavigationProp<RootStackParamList>;

export default function MyAccountScreen() {
  const navigation = useNavigation<NavProp>();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const handleLogout = async () => {
    setShowLogout(false);
    await logout();
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  };

  const roleLabel = user?.role === 'ADMIN' ? 'Admin' : user?.role === 'ENGINEER' ? 'Engineer' : 'Contractor';

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <Text style={styles.screenTitle}>My Account</Text>
          <View style={styles.profileWrap}>
            <View style={styles.avatarWrap}>
              <View style={styles.avatarInitials}>
                <User color="white" size={32} />
              </View>
              <TouchableOpacity style={styles.editAvatar}>
                <Pencil color="white" size={12} />
              </TouchableOpacity>
            </View>
            <Text style={styles.userName}>{user?.name ?? '—'}</Text>
            <Text style={styles.userRole}>{roleLabel}</Text>
            <Text style={styles.userOrg}>{user?.organization ?? ''}</Text>
          </View>
        </View>

        <View style={styles.cards}>
          {/* Account Info */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardLabel}>ACCOUNT INFORMATION</Text>
              <TouchableOpacity style={styles.editBtn}>
                <Pencil color="#0EA5A4" size={12} />
                <Text style={styles.editBtnText}>Edit</Text>
              </TouchableOpacity>
            </View>
            <AccountRow icon={<Mail color="#1E3A8A" size={16} />} label="Email" value={user?.email ?? '—'} />
            <AccountRow icon={<Phone color="#1E3A8A" size={16} />} label="Phone" value={user?.phone ?? '—'} />
            <AccountRow icon={<BadgeCheck color="#1E3A8A" size={16} />} label="Organization" value={user?.organization ?? '—'} />
            <AccountRow icon={<Shield color="#1E3A8A" size={16} />} label="Role" value={roleLabel} badge />
          </View>

          {/* App Settings */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardLabel}>APP SETTINGS</Text>
            </View>
            <SettingsRow icon={<Lock color="#64748B" size={16} />} label="Change Password" action={<ChevronRight color="#94A3B8" size={16} />} />
            <SettingsRow
              icon={<Bell color="#64748B" size={16} />}
              label="Notifications"
              action={<ToggleSwitch checked={notifications} onChange={setNotifications} />}
            />
            <SettingsRow
              icon={<Moon color="#64748B" size={16} />}
              label="Dark Mode"
              action={<ToggleSwitch checked={darkMode} onChange={setDarkMode} />}
            />
            <SettingsRow
              icon={<Globe color="#64748B" size={16} />}
              label="Language"
              action={
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Text style={{ fontSize: 12, color: '#64748B' }}>English</Text>
                  <ChevronRight color="#94A3B8" size={16} />
                </View>
              }
            />
            <SettingsRow
              icon={<RefreshCw color="#64748B" size={16} />}
              label="Data Sync"
              action={
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <View style={styles.syncDot} />
                  <Text style={{ fontSize: 12, color: '#16A34A' }}>Synced</Text>
                </View>
              }
            />
          </View>

          {/* Subscription */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardLabel}>SUBSCRIPTION & PLAN</Text>
            </View>
            <View style={{ padding: 16, gap: 14 }}>
              <View style={styles.planRow}>
                <View style={styles.planIcon}>
                  <Crown color="#F59E0B" size={16} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.planName}>Professional Plan</Text>
                  <Text style={styles.planValidity}>Valid until Dec 2026</Text>
                </View>
                <View style={styles.activeBadge}>
                  <Text style={styles.activeBadgeText}>Active</Text>
                </View>
              </View>
              <View>
                <View style={styles.storageRow}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <HardDrive color="#64748B" size={14} />
                    <Text style={{ fontSize: 12, color: '#64748B' }}>Storage Used</Text>
                  </View>
                  <Text style={{ fontSize: 12, color: '#1E293B' }}>2.4 GB / 10 GB</Text>
                </View>
                <View style={styles.storageBar}>
                  <View style={styles.storageBarFill} />
                </View>
              </View>
              <TouchableOpacity style={styles.upgradeBtn}>
                <Crown color="#1E3A8A" size={16} />
                <Text style={styles.upgradeBtnText}>Upgrade Plan</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Danger Zone */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={[styles.cardLabel, { color: '#DC2626' }]}>DANGER ZONE</Text>
            </View>
            <View style={{ padding: 16, gap: 8 }}>
              <TouchableOpacity onPress={() => setShowLogout(true)} style={styles.logoutBtn}>
                <LogOut color="#64748B" size={16} />
                <Text style={styles.logoutBtnText}>Logout</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowDelete(true)} style={styles.deleteBtn}>
                <Trash2 color="#DC2626" size={16} />
                <Text style={styles.deleteBtnText}>Delete Account</Text>
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.version}>Smart Road Estimator v2.1.0</Text>
        </View>
      </ScrollView>

      {/* Logout Modal */}
      <ConfirmModal
        visible={showLogout}
        icon={<LogOut color="#DC2626" size={24} />}
        iconBg="#FEF2F2"
        title="Logout?"
        message="Are you sure you want to logout from your account?"
        confirmText="Logout"
        confirmStyle={{ backgroundColor: '#DC2626' }}
        onCancel={() => setShowLogout(false)}
        onConfirm={handleLogout}
        insets={insets}
      />

      {/* Delete Modal */}
      <ConfirmModal
        visible={showDelete}
        icon={<Trash2 color="#DC2626" size={24} />}
        iconBg="#FEF2F2"
        title="Delete Account?"
        message="This action cannot be undone. All your data will be permanently deleted."
        confirmText="Delete"
        confirmStyle={{ backgroundColor: '#DC2626' }}
        onCancel={() => setShowDelete(false)}
        onConfirm={() => setShowDelete(false)}
        insets={insets}
      />
    </View>
  );
}

function AccountRow({ icon, label, value, badge }: { icon: React.ReactNode; label: string; value: string; badge?: boolean }) {
  return (
    <View style={styles.rowWrap}>
      <View style={styles.rowIcon}>{icon}</View>
      <View style={styles.rowContent}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowValue}>{value}</Text>
      </View>
      {badge && (
        <View style={styles.roleBadge}>
          <Text style={styles.roleBadgeText}>{value}</Text>
        </View>
      )}
    </View>
  );
}

function SettingsRow({ icon, label, action }: { icon: React.ReactNode; label: string; action: React.ReactNode }) {
  return (
    <View style={styles.rowWrap}>
      <View style={[styles.rowIcon, { backgroundColor: '#F1F5F9' }]}>{icon}</View>
      <Text style={[styles.rowValue, { flex: 1 }]}>{label}</Text>
      {action}
    </View>
  );
}

function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: (val: boolean) => void }) {
  return (
    <TouchableOpacity
      onPress={() => onChange(!checked)}
      style={[styles.toggle, { backgroundColor: checked ? '#0EA5A4' : '#CBD5E1' }]}
    >
      <View style={[styles.toggleThumb, { transform: [{ translateX: checked ? 20 : 2 }] }]} />
    </TouchableOpacity>
  );
}

function ConfirmModal({ visible, icon, iconBg, title, message, confirmText, confirmStyle, onCancel, onConfirm, insets }: any) {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onCancel}>
        <View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>
          <View style={styles.sheetHandle} />
          <View style={[styles.sheetIcon, { backgroundColor: iconBg }]}>{icon}</View>
          <Text style={styles.sheetTitle}>{title}</Text>
          <Text style={styles.sheetMessage}>{message}</Text>
          <View style={styles.sheetBtns}>
            <TouchableOpacity onPress={onCancel} style={styles.cancelBtn}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onConfirm} style={[styles.confirmBtn, confirmStyle]}>
              <Text style={styles.confirmBtnText}>{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F5F7FA' },
  profileHeader: {
    backgroundColor: '#1E3A8A',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  screenTitle: { color: 'white', fontSize: 18, fontWeight: '600', textAlign: 'center', marginBottom: 16 },
  profileWrap: { alignItems: 'center' },
  avatarWrap: { position: 'relative', marginBottom: 12 },
  avatarInitials: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 3, borderColor: 'rgba(255,255,255,0.3)',
  },
  editAvatar: {
    position: 'absolute', bottom: -4, right: -4,
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: '#0EA5A4', alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: 'white',
  },
  userName: { color: 'white', fontSize: 18, fontWeight: '600' },
  userRole: { color: '#BFDBFE', fontSize: 14, marginTop: 2 },
  userOrg: { color: '#93C5FD', fontSize: 12, marginTop: 2 },
  cards: { paddingHorizontal: 16, paddingTop: 16, gap: 12 },
  card: {
    backgroundColor: 'white', borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingTop: 14, paddingBottom: 8,
  },
  cardLabel: { fontSize: 11, color: '#94A3B8', fontWeight: '700', letterSpacing: 0.5 },
  editBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  editBtnText: { fontSize: 12, color: '#0EA5A4' },
  rowWrap: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12, gap: 12,
    borderTopWidth: 1, borderTopColor: '#F8FAFC',
  },
  rowIcon: {
    width: 34, height: 34, borderRadius: 10,
    backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center',
  },
  rowContent: { flex: 1 },
  rowLabel: { fontSize: 10, color: '#94A3B8' },
  rowValue: { fontSize: 14, color: '#1E293B' },
  roleBadge: { backgroundColor: '#EFF6FF', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 3 },
  roleBadgeText: { fontSize: 10, color: '#1E3A8A', fontWeight: '600' },
  planRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  planIcon: { width: 34, height: 34, borderRadius: 10, backgroundColor: '#FFFBEB', alignItems: 'center', justifyContent: 'center' },
  planName: { fontSize: 14, color: '#1E293B', fontWeight: '500' },
  planValidity: { fontSize: 10, color: '#64748B' },
  activeBadge: { backgroundColor: '#DCFCE7', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3 },
  activeBadgeText: { fontSize: 10, color: '#16A34A', fontWeight: '600' },
  storageRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  storageBar: { height: 8, backgroundColor: '#E2E8F0', borderRadius: 4, overflow: 'hidden' },
  storageBarFill: { width: '24%', height: '100%', backgroundColor: '#1E3A8A', borderRadius: 4 },
  upgradeBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, backgroundColor: '#EFF6FF', borderRadius: 12, paddingVertical: 10,
  },
  upgradeBtnText: { fontSize: 14, color: '#1E3A8A', fontWeight: '500' },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, borderWidth: 1, borderColor: '#E2E8F0',
    borderRadius: 12, paddingVertical: 12,
  },
  logoutBtnText: { fontSize: 14, color: '#64748B' },
  deleteBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, borderWidth: 1, borderColor: '#FCA5A5',
    borderRadius: 12, paddingVertical: 12,
  },
  deleteBtnText: { fontSize: 14, color: '#DC2626' },
  syncDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#16A34A' },
  toggle: { width: 44, height: 24, borderRadius: 12, position: 'relative', justifyContent: 'center' },
  toggleThumb: {
    position: 'absolute', width: 20, height: 20, borderRadius: 10,
    backgroundColor: 'white',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15, shadowRadius: 2, elevation: 2,
  },
  version: { textAlign: 'center', fontSize: 10, color: '#94A3B8', paddingVertical: 8 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: 'white', borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 24, alignItems: 'center',
  },
  sheetHandle: { width: 40, height: 4, backgroundColor: '#E2E8F0', borderRadius: 2, marginBottom: 20 },
  sheetIcon: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  sheetTitle: { fontSize: 18, fontWeight: '600', color: '#1E293B', marginBottom: 6 },
  sheetMessage: { fontSize: 13, color: '#64748B', textAlign: 'center', marginBottom: 20 },
  sheetBtns: { flexDirection: 'row', gap: 10, width: '100%' },
  cancelBtn: { flex: 1, paddingVertical: 13, backgroundColor: '#F1F5F9', borderRadius: 12, alignItems: 'center' },
  cancelBtnText: { fontSize: 14, color: '#64748B' },
  confirmBtn: { flex: 1, paddingVertical: 13, borderRadius: 12, alignItems: 'center' },
  confirmBtnText: { fontSize: 14, color: 'white', fontWeight: '600' },
});
