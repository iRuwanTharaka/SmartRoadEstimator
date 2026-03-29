import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Search, Filter, MapPin, Calendar, ChevronRight } from 'lucide-react-native';
import { projectsApi, Project } from '../../api/projects.api';

const statusStyle = (status: string) => {
  if (status === 'COMPLETED') return { bg: '#DCFCE7', text: '#16A34A' };
  if (status === 'PENDING') return { bg: '#FEF9C3', text: '#CA8A04' };
  return { bg: '#DBEAFE', text: '#1D4ED8' };
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

const STATUS_FILTERS = ['All', 'PENDING', 'COMPLETED', 'IN_PROGRESS'];

export default function PastProjectsScreen() {
  const insets = useSafeAreaInsets();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  // Debounce search
  const [debouncedSearch, setDebouncedSearch] = useState('');
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm), 400);
    return () => clearTimeout(t);
  }, [searchTerm]);

  const loadProjects = useCallback(async (pg = 1, replace = true) => {
    try {
      if (replace) setLoading(true);
      else setLoadingMore(true);
      const res = await projectsApi.getAll(pg, 20, debouncedSearch || undefined);
      setProjects((prev) => replace ? (res.data ?? []) : [...prev, ...(res.data ?? [])]);
      setTotalPages(res.totalPages ?? 1);
      setPage(pg);
    } catch {
      // ignore
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  }, [debouncedSearch]);

  useEffect(() => { loadProjects(1, true); }, [debouncedSearch]);

  const onRefresh = () => { setRefreshing(true); loadProjects(1, true); };

  const onLoadMore = () => {
    if (!loadingMore && page < totalPages) loadProjects(page + 1, false);
  };

  const filtered = statusFilter === 'All'
    ? projects
    : projects.filter((p) => p.status === statusFilter);

  const filterLabels: Record<string, string> = {
    'All': 'All',
    'PENDING': 'Pending',
    'COMPLETED': 'Completed',
    'IN_PROGRESS': 'In Progress',
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Past Projects</Text>

        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <Search color="#94A3B8" size={18} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search projects..."
              placeholderTextColor="#94A3B8"
              value={searchTerm}
              onChangeText={setSearchTerm}
            />
          </View>
          <TouchableOpacity style={styles.filterBtn}>
            <Filter color="#64748B" size={18} />
          </TouchableOpacity>
        </View>

        {/* Filter Pills */}
        <View style={styles.filterRow}>
          {STATUS_FILTERS.map((f) => (
            <TouchableOpacity
              key={f}
              onPress={() => setStatusFilter(f)}
              style={[styles.pill, statusFilter === f && styles.pillActive]}
            >
              <Text style={[styles.pillText, statusFilter === f && styles.pillTextActive]}>
                {filterLabels[f]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Project List */}
      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color="#1E3A8A" size="large" />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 20 }]}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#1E3A8A" />}
          onEndReached={onLoadMore}
          onEndReachedThreshold={0.3}
          ListEmptyComponent={
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No projects found.</Text>
            </View>
          }
          ListFooterComponent={loadingMore ? <ActivityIndicator color="#1E3A8A" style={{ marginTop: 12 }} /> : null}
          renderItem={({ item }) => {
            const s = statusStyle(item.status);
            return (
              <TouchableOpacity activeOpacity={0.85} style={styles.card}>
                <View style={styles.cardTop}>
                  <Text style={styles.cardName}>{item.name}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: s.bg }]}>
                    <Text style={[styles.statusText, { color: s.text }]}>{item.status}</Text>
                  </View>
                </View>

                <View style={styles.cardMeta}>
                  <View style={styles.metaRow}>
                    <MapPin color="#94A3B8" size={13} />
                    <Text style={styles.metaText}>{item.location}</Text>
                  </View>
                  <View style={styles.metaRow}>
                    <Calendar color="#94A3B8" size={13} />
                    <Text style={styles.metaText}>{formatDate(item.createdAt)}</Text>
                  </View>
                </View>

                <View style={styles.cardFooter}>
                  <View>
                    <Text style={styles.surfaceLabel}>{item.surfaceType ?? '—'}</Text>
                  </View>
                  <View style={styles.detailBtn}>
                    <Text style={styles.detailText}>View Details</Text>
                    <ChevronRight color="#1E3A8A" size={16} />
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F5F7FA' },
  header: {
    backgroundColor: 'white',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#0F172A', marginBottom: 14 },
  searchRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  searchBox: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F1F5F9', borderRadius: 14,
    paddingHorizontal: 14, paddingVertical: 10, gap: 8,
  },
  searchInput: { flex: 1, fontSize: 14, color: '#1E293B' },
  filterBtn: {
    backgroundColor: '#F1F5F9', borderRadius: 14,
    padding: 10, alignItems: 'center', justifyContent: 'center',
  },
  filterRow: { flexDirection: 'row', gap: 8, paddingBottom: 8 },
  pill: {
    paddingHorizontal: 14, paddingVertical: 6,
    borderRadius: 20, backgroundColor: '#F1F5F9',
  },
  pillActive: { backgroundColor: '#1E3A8A' },
  pillText: { fontSize: 12, color: '#64748B', fontWeight: '500' },
  pillTextActive: { color: 'white' },
  listContent: { padding: 20, gap: 14 },
  card: {
    backgroundColor: 'white', borderRadius: 18,
    padding: 18,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
    borderWidth: 1, borderColor: '#F1F5F9',
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  cardName: { fontSize: 15, fontWeight: '700', color: '#0F172A', flex: 1, marginRight: 10 },
  statusBadge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  statusText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  cardMeta: { gap: 6, marginBottom: 14 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { fontSize: 12, color: '#64748B' },
  cardFooter: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-end', borderTopWidth: 1, borderTopColor: '#F8FAFC', paddingTop: 12,
  },
  surfaceLabel: { fontSize: 11, color: '#94A3B8' },
  detailBtn: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  detailText: { fontSize: 13, color: '#1E3A8A', fontWeight: '500' },
  emptyCard: {
    backgroundColor: 'white', borderRadius: 14, padding: 32,
    alignItems: 'center', borderWidth: 1, borderColor: '#F1F5F9',
  },
  emptyText: { fontSize: 13, color: '#94A3B8' },
});
