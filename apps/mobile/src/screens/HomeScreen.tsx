import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  RefreshControl, StatusBar, Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../store/auth.store';
import { matchesApi, leaderboardApi } from '../lib/api';
import { colors, spacing, radius, fonts, shadows } from '../lib/theme';
import { Match, LeaderboardEntry, getRankFromWins, RANK_CONFIG } from '@betless/shared';
import MatchCard from '../components/MatchCard';

export default function HomeScreen() {
  const { user, isAuthenticated } = useAuthStore();
  const [todayMatches, setTodayMatches] = useState<Match[]>([]);
  const [topPlayers, setTopPlayers] = useState<LeaderboardEntry[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const [matchRes, leaderRes] = await Promise.all([
        matchesApi.getToday(),
        leaderboardApi.global(),
      ]);
      setTodayMatches(matchRes.data.data || []);
      setTopPlayers((leaderRes.data.data || []).slice(0, 5));
    } catch {}
  }, []);

  useEffect(() => { load(); }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const rankConfig = user ? RANK_CONFIG[user.rankTitle] : null;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.black} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.green} />}
      >
        {/* Hero / User stats */}
        <LinearGradient
          colors={['#111118', '#16161F', '#111118']}
          style={styles.hero}
        >
          {isAuthenticated && user ? (
            <View>
              <Text style={styles.heroGreeting}>Welcome back,</Text>
              <Text style={styles.heroUsername}>{user.username}</Text>
              {rankConfig && (
                <View style={[styles.rankBadge, { borderColor: rankConfig.color + '40', backgroundColor: rankConfig.color + '15' }]}>
                  <Text>{rankConfig.icon} </Text>
                  <Text style={[styles.rankText, { color: rankConfig.color }]}>{user.rankTitle}</Text>
                </View>
              )}

              <View style={styles.statsRow}>
                {[
                  { label: 'Points', value: user.totalPoints.toLocaleString(), color: colors.green },
                  { label: 'Correct', value: user.correctPredictions, color: colors.white },
                  { label: 'Streak', value: `${user.currentStreak}🔥`, color: colors.gold },
                  { label: 'Rate', value: `${user.totalPredictions > 0 ? Math.round((user.correctPredictions / user.totalPredictions) * 100) : 0}%`, color: colors.white },
                ].map((s) => (
                  <View key={s.label} style={styles.statItem}>
                    <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
                    <Text style={styles.statLabel}>{s.label}</Text>
                  </View>
                ))}
              </View>
            </View>
          ) : (
            <View>
              <Text style={styles.heroTagline}>Saudi League</Text>
              <Text style={styles.heroTitle}>Predict.</Text>
              <Text style={[styles.heroTitle, { color: colors.green }]}>Compete.</Text>
              <Text style={styles.heroTitle}>Dominate.</Text>
              <Text style={styles.heroSub}>Make predictions, earn points, climb the leaderboard.</Text>
            </View>
          )}
        </LinearGradient>

        {/* Today's matches */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Matches</Text>
          {todayMatches.length > 0 ? (
            todayMatches.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))
          ) : (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No matches today</Text>
              <Text style={styles.emptySubText}>Check back for upcoming fixtures</Text>
            </View>
          )}
        </View>

        {/* Top Players */}
        {topPlayers.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Top Predictors</Text>
            <View style={styles.leaderCard}>
              {topPlayers.map((entry, i) => {
                const rankCfg = RANK_CONFIG[entry.rankTitle];
                return (
                  <View key={entry.userId} style={styles.leaderRow}>
                    <Text style={styles.leaderPos}>{i + 1}</Text>
                    <View style={[styles.leaderAvatar, { backgroundColor: rankCfg.color }]}>
                      <Text style={styles.leaderAvatarText}>{entry.username.slice(0, 2).toUpperCase()}</Text>
                    </View>
                    <View style={styles.leaderInfo}>
                      <Text style={styles.leaderName}>{entry.username}</Text>
                      <Text style={[styles.leaderRank, { color: rankCfg.color }]}>{rankCfg.icon} {entry.rankTitle}</Text>
                    </View>
                    <Text style={styles.leaderPoints}>{entry.totalPoints.toLocaleString()}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.black },
  hero: { padding: spacing.lg, paddingTop: spacing.xl },
  heroGreeting: { color: colors.gray[400], fontSize: 16, marginBottom: 4 },
  heroUsername: { color: colors.white, fontSize: 28, ...fonts.black, marginBottom: 8 },
  rankBadge: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', borderWidth: 1, borderRadius: radius.full, paddingHorizontal: 10, paddingVertical: 4, marginBottom: 16 },
  rankText: { fontSize: 13, ...fonts.semibold },
  statsRow: { flexDirection: 'row', gap: spacing.sm },
  statItem: { flex: 1, backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.sm, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  statValue: { fontSize: 18, ...fonts.black },
  statLabel: { color: colors.gray[500], fontSize: 11, marginTop: 2 },
  heroTagline: { color: colors.green, fontSize: 14, ...fonts.semibold, marginBottom: 8 },
  heroTitle: { color: colors.white, fontSize: 40, ...fonts.black, lineHeight: 46 },
  heroSub: { color: colors.gray[400], fontSize: 15, marginTop: 12, lineHeight: 22 },
  section: { padding: spacing.lg, paddingTop: spacing.md },
  sectionTitle: { color: colors.white, fontSize: 20, ...fonts.black, marginBottom: 12 },
  emptyCard: { backgroundColor: colors.card, borderRadius: radius.lg, padding: 32, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  emptyText: { color: colors.white, fontSize: 16, ...fonts.semibold },
  emptySubText: { color: colors.gray[500], fontSize: 13, marginTop: 6 },
  leaderCard: { backgroundColor: colors.card, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  leaderRow: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  leaderPos: { color: colors.gray[500], fontSize: 14, ...fonts.bold, width: 24 },
  leaderAvatar: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  leaderAvatarText: { color: colors.black, fontSize: 12, ...fonts.black },
  leaderInfo: { flex: 1 },
  leaderName: { color: colors.white, fontSize: 14, ...fonts.semibold },
  leaderRank: { fontSize: 11, marginTop: 2 },
  leaderPoints: { color: colors.green, fontSize: 14, ...fonts.bold },
});
