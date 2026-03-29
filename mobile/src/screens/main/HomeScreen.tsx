import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import { Plus, FolderOpen, Settings, MapPin, Clock, ArrowRight, User } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { projectsApi, Project } from '../../api/projects.api';

type NavProp = NativeStackNavigationProp<RootStackParamList>;

const statusStyle = (status: string) => {
  if (status === 'COMPLETED') return { bg: '#DCFCE7', text: '#16A34A' };
  if (status === 'PENDING') return { bg: '#FEF9C3', text: '#CA8A04' };
  return { bg: '#DBEAFE', text: '#1D4ED8' };
};

function formatCost(cost: number | null | undefined): string {
  if (!cost) return '—';
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(cost);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function HomeScreen() {
  const navigation = useNavigation<NavProp>();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadProjects = useCallback(async () => {
    try {
      const res = await projectsApi.getAll(1, 5);
      setProjects(res.data ?? []);
    } catch {
      // silently fail on home screen
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadProjects(); }, [loadProjects]);

  const onRefresh = () => { setRefreshing(true); loadProjects(); };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 80 }]}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#1E3A8A" />}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <View style={styles.titleRow}>
            <View style={styles.logoIcon}>
              <MapPin color="white" size={18} />
            </View>
            <Text style={styles.appName}>RoadEstimator</Text>
          </View>
          <Text style={styles.welcome}>Welcome back, {user?.name?.split(' ')[0] ?? 'Engineer'}</Text>
        </View>
        <View style={styles.avatarCircle}>
          <User color="white" size={20} />
        </View>
      </View>

      {/* Action Cards */}
      <View style={styles.section}>
        <ActionCard
          icon={<Plus color="#2563EB" size={22} />}
          iconBg="#EFF6FF"
          title="New Estimation"
          subtitle="Start a new road damage analysis"
          onPress={() => navigation.navigate('Step1')}
        />
        <ActionCard
          icon={<FolderOpen color="#0D9488" size={22} />}
          iconBg="#F0FDFA"
          title="Past Projects"
          subtitle="View completed and ongoing projects"
          onPress={() => navigation.navigate('MainTabs', { screen: 'PastProjects' })}
        />
        <ActionCard
          icon={<Settings color="#EA580C" size={22} />}
          iconBg="#FFF7ED"
          title="Rate Management"
          subtitle="Manage material and labor rates"
          onPress={() => navigation.navigate('MainTabs', { screen: 'RateManagement' })}
        />
      </View>

      {/* Recent Projects */}
      <View>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Projects</Text>
          <TouchableOpacity onPress={() => navigation.navigate('MainTabs', { screen: 'PastProjects' })}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.projectList}>
          {loading ? (
            <ActivityIndicator color="#1E3A8A" style={{ marginTop: 16 }} />
          ) : projects.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No projects yet. Start your first estimation!</Text>
            </View>
          ) : (
            projects.map((project) => {
              const s = statusStyle(project.status);
              return (
                <View key={project.id} style={styles.projectCard}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.projectName}>{project.name}</Text>
                    <View style={styles.projectMeta}>
                      <Clock color="#94A3B8" size={12} />
                      <Text style={styles.projectDate}>{formatDate(project.createdAt)}</Text>
                    </View>
                  </View>
                  <View style={styles.projectRight}>
                    <View style={[styles.statusBadge, { backgroundColor: s.bg }]}>
                      <Text style={[styles.statusText, { color: s.text }]}>{project.status}</Text>
                    </View>
                  </View>
                </View>
              );
            })
          )}
        </View>
      </View>
    </ScrollView>
  );
}

function ActionCard({ icon, iconBg, title, subtitle, onPress }: {
  icon: React.ReactNode; iconBg: string;
  title: string; subtitle: string; onPress: () => void;
}) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={styles.actionCard}>
      <View style={[styles.actionIcon, { backgroundColor: iconBg }]}>{icon}</View>
      <View style={styles.actionText}>
        <Text style={styles.actionTitle}>{title}</Text>
        <Text style={styles.actionSubtitle}>{subtitle}</Text>
      </View>
      <ArrowRight color="#CBD5E1" size={18} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F5F7FA' },
  content: { paddingHorizontal: 24 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  logoIcon: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: '#1E3A8A', alignItems: 'center', justifyContent: 'center',
  },
  appName: { fontSize: 22, fontWeight: '700', color: '#0F172A' },
  welcome: { fontSize: 13, color: '#64748B' },
  avatarCircle: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#1E3A8A', alignItems: 'center', justifyContent: 'center',
  },
  section: { gap: 12, marginBottom: 28 },
  actionCard: {
    backgroundColor: 'white', borderRadius: 18,
    padding: 18, flexDirection: 'row', alignItems: 'center', gap: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
    borderWidth: 1, borderColor: '#F1F5F9',
  },
  actionIcon: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  actionText: { flex: 1 },
  actionTitle: { fontSize: 15, fontWeight: '600', color: '#0F172A' },
  actionSubtitle: { fontSize: 12, color: '#64748B', marginTop: 2 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: '#0F172A' },
  seeAll: { fontSize: 13, color: '#1E3A8A', fontWeight: '500' },
  projectList: { gap: 10 },
  projectCard: {
    backgroundColor: 'white', borderRadius: 14,
    padding: 14, flexDirection: 'row', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 6, elevation: 1,
    borderWidth: 1, borderColor: '#F1F5F9',
  },
  projectName: { fontSize: 14, fontWeight: '600', color: '#0F172A' },
  projectMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  projectDate: { fontSize: 12, color: '#94A3B8' },
  projectRight: { alignItems: 'flex-end', gap: 4 },
  statusBadge: { borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2 },
  statusText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  emptyCard: {
    backgroundColor: 'white', borderRadius: 14, padding: 24, alignItems: 'center',
    borderWidth: 1, borderColor: '#F1F5F9',
  },
  emptyText: { fontSize: 13, color: '#94A3B8', textAlign: 'center' },
});
