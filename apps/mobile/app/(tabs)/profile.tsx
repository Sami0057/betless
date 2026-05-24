import React, { useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../../src/store/auth.store';
import { colors, spacing, radius, fonts, shadows } from '../../src/lib/theme';
import { RANK_CONFIG } from '@betless/shared';

export default function ProfileTab() {
  const { user, isAuthenticated, logout, fetchMe } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) fetchMe();
  }, []);

  if (!isAuthenticated || !user) {
    return (
      <View style={styles.authPrompt}>
        <Ionicons name="person-circle-outline" size={80} color={colors.gray[700]} />
        <Text style={styles.authTitle}>Sign in to Betless</Text>
        <Text style={styles.authSub}>Track your predictions, rank, and achievements</Text>
        <TouchableOpacity onPress={() => router.push('/login')} style={styles.signInBtn}>
          <Text style={styles.signInBtnText}>Sign In</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/register')} style={styles.registerBtn}>
          <Text style={styles.registerBtnText}>Create Account</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const rankCfg = RANK_CONFIG[user.rankTitle];
  const successRate = user.totalPredictions > 0
    ? Math.round((user.correctPredictions / user.totalPredictions) * 100)
    : 0;

  async function handleLogout() {
    Alert.alert('Sign Out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: async () => { await logout(); } },
    ]);
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Profile header */}
      <LinearGradient colors={['#111118', '#16161F']} style={styles.header}>
        <View style={[styles.avatar, { backgroundColor: rankCfg.color }]}>
          <Text style={styles.avatarText}>{user.username.slice(0, 2).toUpperCase()}</Text>
        </View>
        <Text style={styles.username}>{user.username}</Text>
        <View style={[styles.rankBadge, { borderColor: rankCfg.color + '40', backgroundColor: rankCfg.color + '15' }]}>
          <Text style={[styles.rankText, { color: rankCfg.color }]}>{rankCfg.icon} {user.rankTitle}</Text>
        </View>
      </LinearGradient>

      {/* Stats */}
      <View style={styles.statsGrid}>
        {[
          { label: 'Points', value: user.totalPoints.toLocaleString(), color: colors.green },
          { label: 'Correct', value: user.correctPredictions, color: colors.white },
          { label: 'Total', value: user.totalPredictions, color: colors.white },
          { label: 'Accuracy', value: `${successRate}%`, color: colors.gold },
          { label: 'Streak', value: user.currentStreak, color: colors.red },
          { label: 'Best', value: user.longestStreak, color: colors.orange },
        ].map((s) => (
          <View key={s.label} style={styles.statItem}>
            <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* Menu */}
      <View style={styles.menu}>
        {[
          { icon: 'notifications-outline', label: 'Notifications', onPress: () => router.push('/notifications') },
          { icon: 'medal-outline', label: 'My Badges', onPress: () => router.push('/badges') },
          { icon: 'bar-chart-outline', label: 'Prediction History', onPress: () => router.push('/predictions') },
          { icon: 'settings-outline', label: 'Settings', onPress: () => router.push('/settings') },
          { icon: 'shield-outline', label: 'Privacy Policy', onPress: () => router.push('/privacy') },
          { icon: 'document-text-outline', label: 'Terms of Service', onPress: () => router.push('/terms') },
        ].map((item) => (
          <TouchableOpacity key={item.label} style={styles.menuItem} onPress={item.onPress}>
            <Ionicons name={item.icon as never} size={20} color={colors.gray[400]} />
            <Text style={styles.menuLabel}>{item.label}</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.gray[600]} />
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={[styles.menuItem, styles.logoutItem]} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={colors.red} />
          <Text style={[styles.menuLabel, { color: colors.red }]}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.black },
  header: { alignItems: 'center', padding: spacing.xl, paddingTop: spacing.xxl },
  avatar: { width: 80, height: 80, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md },
  avatarText: { color: colors.black, fontSize: 28, ...fonts.black },
  username: { color: colors.white, fontSize: 24, ...fonts.black, marginBottom: spacing.sm },
  rankBadge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: radius.full, borderWidth: 1 },
  rankText: { fontSize: 14, ...fonts.semibold },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: spacing.md, gap: spacing.sm },
  statItem: { flex: 1, minWidth: '30%', backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.md, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  statValue: { fontSize: 20, ...fonts.black },
  statLabel: { color: colors.gray[500], fontSize: 11, marginTop: 4 },
  menu: { padding: spacing.md, gap: spacing.sm },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.md, borderWidth: 1, borderColor: colors.border },
  menuLabel: { flex: 1, color: colors.white, fontSize: 15, ...fonts.medium },
  logoutItem: { borderColor: colors.red + '30', backgroundColor: colors.red + '08' },
  authPrompt: { flex: 1, backgroundColor: colors.black, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  authTitle: { color: colors.white, fontSize: 24, ...fonts.black, marginTop: spacing.lg, marginBottom: spacing.sm },
  authSub: { color: colors.gray[400], fontSize: 15, textAlign: 'center', lineHeight: 22, marginBottom: spacing.xl },
  signInBtn: { width: '100%', backgroundColor: colors.green, borderRadius: radius.lg, paddingVertical: 14, alignItems: 'center', marginBottom: spacing.md },
  signInBtnText: { color: colors.black, fontSize: 16, ...fonts.bold },
  registerBtn: { width: '100%', backgroundColor: colors.card, borderRadius: radius.lg, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  registerBtnText: { color: colors.white, fontSize: 16, ...fonts.medium },
});
