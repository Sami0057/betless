import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { leaderboardApi } from '../../src/lib/api';
import { useAuthStore } from '../../src/store/auth.store';
import { colors, spacing, radius, fonts } from '../../src/lib/theme';
import { LeaderboardEntry, RANK_CONFIG } from '@betless/shared';
import { Ionicons } from '@expo/vector-icons';

const TABS = [
  { key: 'global', label: 'All Time' },
  { key: 'weekly', label: 'Weekly' },
  { key: 'streak', label: 'Streaks' },
];

export default function LeaderboardTab() {
  const { user } = useAuthStore();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [activeTab, setActiveTab] = useState('global');
  const [refreshing, setRefreshing] = useState(false);

  async function load() {
    try {
      let res;
      if (activeTab === 'global') res = await leaderboardApi.global();
      else if (activeTab === 'weekly') res = await leaderboardApi.weekly();
      else res = await leaderboardApi.streak();
      setEntries(res.data.data || []);
    } catch {}
  }

  useEffect(() => { load(); }, [activeTab]);

  const renderItem = ({ item, index }: { item: LeaderboardEntry; index: number }) => {
    const rankCfg = RANK_CONFIG[item.rankTitle];
    const isMe = user?.id === item.userId;
    const posColors = ['#FFD700', '#C0C0C0', '#CD7F32'];

    return (
      <View style={[styles.row, isMe && styles.rowHighlight]}>
        <View style={[styles.posBox, index < 3 && { borderColor: posColors[index] + '60', backgroundColor: posColors[index] + '15' }]}>
          {index < 3
            ? <Text style={styles.posEmoji}>{['👑', '🥈', '🥉'][index]}</Text>
            : <Text style={[styles.posText, { color: colors.gray[500] }]}>{item.rank}</Text>
          }
        </View>
        <View style={[styles.avatar, { backgroundColor: rankCfg.color }]}>
          <Text style={styles.avatarText}>{item.username.slice(0, 2).toUpperCase()}</Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.username}>{item.username}{isMe ? ' (You)' : ''}</Text>
          <Text style={[styles.rankTitle, { color: rankCfg.color }]}>{rankCfg.icon} {item.rankTitle}</Text>
        </View>
        <View style={styles.stats}>
          {activeTab === 'streak'
            ? <Text style={styles.points}>🔥 {item.currentStreak}</Text>
            : <Text style={styles.points}>{item.totalPoints.toLocaleString()}</Text>
          }
          <Text style={styles.accuracy}>{item.successRate}%</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabs}>
        {TABS.map((t) => (
          <TouchableOpacity key={t.key} onPress={() => setActiveTab(t.key)}
            style={[styles.tab, activeTab === t.key && styles.tabActive]}>
            <Text style={[styles.tabText, activeTab === t.key && styles.tabTextActive]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={entries}
        keyExtractor={(e) => e.userId}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false); }} tintColor={colors.green} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="trophy-outline" size={48} color={colors.gray[700]} />
            <Text style={styles.emptyText}>No data yet</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.black },
  tabs: { flexDirection: 'row', padding: spacing.md, gap: spacing.sm },
  tab: { flex: 1, paddingVertical: 10, borderRadius: radius.md, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  tabActive: { backgroundColor: colors.green + '15', borderColor: colors.green + '40' },
  tabText: { color: colors.gray[400], fontSize: 13, ...fonts.semibold },
  tabTextActive: { color: colors.green },
  list: { padding: spacing.md, paddingTop: 0 },
  row: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, borderRadius: radius.md, marginBottom: spacing.sm, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  rowHighlight: { borderColor: colors.green + '40', backgroundColor: colors.green + '08' },
  posBox: { width: 32, height: 32, borderRadius: 8, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', marginRight: spacing.sm },
  posEmoji: { fontSize: 16 },
  posText: { fontSize: 12, ...fonts.bold },
  avatar: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  avatarText: { color: colors.black, fontSize: 12, ...fonts.black },
  info: { flex: 1 },
  username: { color: colors.white, fontSize: 14, ...fonts.semibold },
  rankTitle: { fontSize: 11, marginTop: 2 },
  stats: { alignItems: 'flex-end' },
  points: { color: colors.green, fontSize: 14, ...fonts.bold },
  accuracy: { color: colors.gray[500], fontSize: 11, marginTop: 2 },
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyText: { color: colors.gray[500], marginTop: 12 },
});
