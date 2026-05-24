import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  RefreshControl, TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { matchesApi } from '../../src/lib/api';
import { colors, spacing, radius, fonts } from '../../src/lib/theme';
import { Match } from '@betless/shared';
import MatchCard from '../../src/components/MatchCard';

const TABS = [
  { key: 'scheduled', label: 'Upcoming' },
  { key: 'live', label: 'Live' },
  { key: 'finished', label: 'Results' },
];

export default function MatchesTab() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('scheduled');
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await matchesApi.getAll({ status: activeTab, limit: '50' });
      setMatches(res.data.data || []);
    } catch {}
    setLoading(false);
  }, [activeTab]);

  useEffect(() => { load(); }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const filtered = matches.filter((m) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return m.homeTeam.name.toLowerCase().includes(q) || m.awayTeam.name.toLowerCase().includes(q);
  });

  return (
    <View style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabBar}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            onPress={() => setActiveTab(tab.key)}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
          >
            <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
              {tab.label}
            </Text>
            {tab.key === 'live' && (
              <View style={styles.liveDot} />
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={16} color={colors.gray[500]} style={styles.searchIcon} />
        <TextInput
          placeholder="Search teams..."
          placeholderTextColor={colors.gray[600]}
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <MatchCard match={item} />}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.green} />}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.empty}>
              <Ionicons name="calendar-outline" size={48} color={colors.gray[700]} />
              <Text style={styles.emptyText}>No matches found</Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.black },
  tabBar: { flexDirection: 'row', padding: spacing.md, paddingBottom: 0, gap: spacing.sm },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: 10, borderRadius: radius.md, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  tabActive: { backgroundColor: colors.green + '20', borderColor: colors.green + '60' },
  tabText: { color: colors.gray[400], fontSize: 13, ...fonts.semibold },
  tabTextActive: { color: colors.green },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.red },
  searchContainer: { flexDirection: 'row', alignItems: 'center', margin: spacing.md, marginBottom: 0, backgroundColor: colors.dark, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 12 },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, color: colors.white, fontSize: 14, paddingVertical: 12 },
  list: { padding: spacing.md },
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyText: { color: colors.gray[500], marginTop: 12, fontSize: 15 },
});
