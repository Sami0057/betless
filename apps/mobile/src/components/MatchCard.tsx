import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Match } from '@betless/shared';
import { colors, spacing, radius, fonts, shadows } from '../lib/theme';
import { predictionsApi } from '../lib/api';
import { useAuthStore } from '../store/auth.store';

interface Props {
  match: Match;
  userPrediction?: string | null;
}

export default function MatchCard({ match, userPrediction }: Props) {
  const { isAuthenticated } = useAuthStore();
  const [active, setActive] = useState(userPrediction);
  const [loading, setLoading] = useState(false);

  const kickoff = new Date(match.kickoffTime);
  const isScheduled = match.status === 'scheduled';
  const canPredict = isScheduled && isAuthenticated && kickoff > new Date();

  async function predict(outcome: string) {
    if (!canPredict || loading) return;
    if (!isAuthenticated) { Alert.alert('Sign In', 'Please sign in to make predictions'); return; }

    setLoading(true);
    try {
      if (active) {
        await predictionsApi.update(match.id, outcome);
      } else {
        await predictionsApi.submit(match.id, outcome);
      }
      setActive(outcome);
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { error?: string } } })?.response?.data?.error;
      Alert.alert('Error', msg || 'Failed to submit prediction');
    }
    setLoading(false);
  }

  const timeStr = kickoff.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dateStr = kickoff.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });

  return (
    <View style={[styles.card, shadows.card]}>
      {/* Status */}
      <View style={styles.header}>
        {match.status === 'live' && (
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
        )}
        <Text style={styles.dateText}>{dateStr} · {timeStr}</Text>
        {match.totalPredictions != null && match.totalPredictions > 0 && (
          <Text style={styles.predCount}>{match.totalPredictions} predictions</Text>
        )}
      </View>

      {/* Teams */}
      <View style={styles.teams}>
        <View style={styles.team}>
          <View style={[styles.teamLogo, { borderColor: match.homeTeam.primaryColor + '40', backgroundColor: match.homeTeam.primaryColor + '15' }]}>
            <Text style={[styles.teamInitial, { color: match.homeTeam.primaryColor }]}>{match.homeTeam.shortName.slice(0, 2)}</Text>
          </View>
          <Text style={styles.teamName}>{match.homeTeam.shortName}</Text>
          {match.homePredictPercentage != null && (
            <Text style={[styles.pct, { color: colors.green }]}>{match.homePredictPercentage}%</Text>
          )}
        </View>

        <View style={styles.vs}>
          {(match.status === 'live' || match.status === 'finished') && match.homeScore != null ? (
            <Text style={styles.score}>{match.homeScore} – {match.awayScore}</Text>
          ) : (
            <Text style={styles.vsText}>VS</Text>
          )}
        </View>

        <View style={styles.team}>
          <View style={[styles.teamLogo, { borderColor: match.awayTeam.primaryColor + '40', backgroundColor: match.awayTeam.primaryColor + '15' }]}>
            <Text style={[styles.teamInitial, { color: match.awayTeam.primaryColor }]}>{match.awayTeam.shortName.slice(0, 2)}</Text>
          </View>
          <Text style={styles.teamName}>{match.awayTeam.shortName}</Text>
          {match.awayPredictPercentage != null && (
            <Text style={[styles.pct, { color: colors.gold }]}>{match.awayPredictPercentage}%</Text>
          )}
        </View>
      </View>

      {/* Prediction buttons */}
      {canPredict && (
        <View style={styles.predictRow}>
          {[
            { key: 'home', label: match.homeTeam.shortName, activeColor: colors.green },
            { key: 'draw', label: 'Draw', activeColor: colors.gray[400] },
            { key: 'away', label: match.awayTeam.shortName, activeColor: colors.gold },
          ].map((btn) => (
            <TouchableOpacity
              key={btn.key}
              onPress={() => predict(btn.key)}
              disabled={loading}
              style={[
                styles.predictBtn,
                active === btn.key && { borderColor: btn.activeColor, backgroundColor: btn.activeColor + '20' },
              ]}
            >
              <Text style={[styles.predictBtnText, active === btn.key && { color: btn.activeColor }]}>
                {btn.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {active && match.status === 'finished' && (
        <View style={[styles.resultBanner, { backgroundColor: active === match.result ? colors.green + '15' : colors.red + '15' }]}>
          <Text style={[styles.resultText, { color: active === match.result ? colors.green : colors.red }]}>
            {active === match.result ? '✓ Correct! +10 pts' : '✗ Incorrect'}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.card, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.md, overflow: 'hidden' },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.md, paddingBottom: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  liveBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.full, backgroundColor: colors.red + '20', borderWidth: 1, borderColor: colors.red + '40' },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.red },
  liveText: { color: colors.red, fontSize: 10, ...fonts.bold },
  dateText: { color: colors.gray[400], fontSize: 12, flex: 1 },
  predCount: { color: colors.gray[600], fontSize: 11 },
  teams: { flexDirection: 'row', alignItems: 'center', padding: spacing.md },
  team: { flex: 1, alignItems: 'center', gap: 6 },
  teamLogo: { width: 52, height: 52, borderRadius: radius.md, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  teamInitial: { fontSize: 18, ...fonts.black },
  teamName: { color: colors.white, fontSize: 13, ...fonts.semibold, textAlign: 'center' },
  pct: { fontSize: 11, ...fonts.medium },
  vs: { alignItems: 'center', paddingHorizontal: spacing.sm },
  vsText: { color: colors.gray[600], fontSize: 18, ...fonts.black },
  score: { color: colors.white, fontSize: 24, ...fonts.black },
  predictRow: { flexDirection: 'row', gap: spacing.sm, padding: spacing.md, paddingTop: 0 },
  predictBtn: { flex: 1, paddingVertical: 12, borderRadius: radius.md, borderWidth: 2, borderColor: colors.border, alignItems: 'center' },
  predictBtnText: { color: colors.gray[400], fontSize: 12, ...fonts.bold },
  resultBanner: { margin: spacing.md, marginTop: 0, borderRadius: radius.md, padding: spacing.sm, alignItems: 'center' },
  resultText: { fontSize: 13, ...fonts.semibold },
});
