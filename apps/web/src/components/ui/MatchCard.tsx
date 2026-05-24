'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Clock, Users, ChevronRight, Zap } from 'lucide-react';
import { Match } from '@betless/shared';
import { formatTime, formatDate, getCountdown, cn } from '@/lib/utils';
import { predictionsApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import toast from 'react-hot-toast';

interface MatchCardProps {
  match: Match;
  userPrediction?: string | null;
  compact?: boolean;
}

export default function MatchCard({ match, userPrediction, compact = false }: MatchCardProps) {
  const { isAuthenticated } = useAuthStore();
  const [activePrediction, setActivePrediction] = useState(userPrediction);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isScheduled = match.status === 'scheduled';
  const isLive = match.status === 'live';
  const isFinished = match.status === 'finished';
  const canPredict = isScheduled && isAuthenticated && new Date(match.kickoffTime) > new Date();

  async function handlePredict(outcome: string) {
    if (!canPredict || isSubmitting) return;
    if (!isAuthenticated) { toast.error('Sign in to predict'); return; }

    setIsSubmitting(true);
    try {
      if (activePrediction && activePrediction !== outcome) {
        await predictionsApi.update(match.id, outcome);
        toast.success('Prediction updated!');
      } else if (!activePrediction) {
        await predictionsApi.submit(match.id, outcome);
        toast.success('Prediction submitted! 🎯');
      }
      setActivePrediction(activePrediction === outcome ? null : outcome);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      toast.error(msg || 'Failed to submit prediction');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card overflow-hidden"
    >
      {/* Match header */}
      <div className="px-4 py-3 flex items-center justify-between border-b border-brand-border/50">
        <div className="flex items-center gap-2">
          {isLive && (
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-500/20 border border-red-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
              <span className="text-red-400 text-xs font-semibold">LIVE</span>
            </span>
          )}
          {isScheduled && (
            <span className="flex items-center gap-1 text-gray-400 text-xs">
              <Clock className="w-3.5 h-3.5" />
              {getCountdown(match.kickoffTime)}
            </span>
          )}
          {isFinished && (
            <span className="text-gray-500 text-xs">Finished</span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {match.totalPredictions != null && match.totalPredictions > 0 && (
            <span className="flex items-center gap-1 text-gray-500 text-xs">
              <Users className="w-3.5 h-3.5" />
              {match.totalPredictions}
            </span>
          )}
          <span className="text-gray-500 text-xs">{formatDate(match.matchDate)}</span>
        </div>
      </div>

      {/* Teams */}
      <div className="px-4 py-5">
        <div className="flex items-center justify-between gap-4">
          {/* Home team */}
          <div className="flex flex-col items-center gap-2 flex-1">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl border-2"
              style={{ borderColor: match.homeTeam.primaryColor + '40', backgroundColor: match.homeTeam.primaryColor + '15' }}
            >
              {match.homeTeam.logo
                ? <img src={match.homeTeam.logo} alt={match.homeTeam.name} className="w-10 h-10 object-contain" />
                : <span className="text-xl font-black" style={{ color: match.homeTeam.primaryColor }}>{match.homeTeam.shortName.slice(0, 2)}</span>
              }
            </div>
            <p className="text-white font-semibold text-sm text-center leading-tight">{match.homeTeam.shortName}</p>
            {match.homePredictPercentage != null && (
              <div className="text-brand-green text-xs font-medium">{match.homePredictPercentage}%</div>
            )}
          </div>

          {/* Score / VS */}
          <div className="flex flex-col items-center gap-1 min-w-[80px]">
            {(isLive || isFinished) && match.homeScore != null ? (
              <div className="flex items-center gap-3">
                <span className="text-3xl font-black text-white">{match.homeScore}</span>
                <span className="text-gray-500 text-xl">–</span>
                <span className="text-3xl font-black text-white">{match.awayScore}</span>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <span className="text-gray-600 font-black text-lg">VS</span>
                <span className="text-gray-500 text-xs mt-1">{formatTime(match.kickoffTime)}</span>
              </div>
            )}
            {isLive && <span className="text-red-400 text-xs animate-pulse">● Live</span>}
          </div>

          {/* Away team */}
          <div className="flex flex-col items-center gap-2 flex-1">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl border-2"
              style={{ borderColor: match.awayTeam.primaryColor + '40', backgroundColor: match.awayTeam.primaryColor + '15' }}
            >
              {match.awayTeam.logo
                ? <img src={match.awayTeam.logo} alt={match.awayTeam.name} className="w-10 h-10 object-contain" />
                : <span className="text-xl font-black" style={{ color: match.awayTeam.primaryColor }}>{match.awayTeam.shortName.slice(0, 2)}</span>
              }
            </div>
            <p className="text-white font-semibold text-sm text-center leading-tight">{match.awayTeam.shortName}</p>
            {match.awayPredictPercentage != null && (
              <div className="text-brand-gold text-xs font-medium">{match.awayPredictPercentage}%</div>
            )}
          </div>
        </div>

        {/* Prediction bar */}
        {match.totalPredictions != null && match.totalPredictions > 0 && (
          <div className="mt-4">
            <div className="flex rounded-full overflow-hidden h-1.5">
              <div className="bg-brand-green transition-all duration-700" style={{ width: `${match.homePredictPercentage}%` }} />
              <div className="bg-gray-600 transition-all duration-700" style={{ width: `${match.drawPredictPercentage}%` }} />
              <div className="bg-brand-gold transition-all duration-700" style={{ width: `${match.awayPredictPercentage}%` }} />
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>{match.homePredictPercentage}%</span>
              <span>Draw {match.drawPredictPercentage}%</span>
              <span>{match.awayPredictPercentage}%</span>
            </div>
          </div>
        )}
      </div>

      {/* Prediction buttons */}
      {canPredict && !compact && (
        <div className="px-4 pb-4">
          <div className="flex gap-2">
            <button
              onClick={() => handlePredict('home')}
              disabled={isSubmitting}
              className={cn(
                'predict-btn predict-btn-home text-xs',
                activePrediction === 'home' && 'predict-btn-active-home'
              )}
            >
              <Zap className={cn('w-3 h-3 mx-auto mb-1', activePrediction === 'home' && 'text-brand-green')} />
              {match.homeTeam.shortName}
            </button>
            <button
              onClick={() => handlePredict('draw')}
              disabled={isSubmitting}
              className={cn(
                'predict-btn predict-btn-draw text-xs',
                activePrediction === 'draw' && 'predict-btn-active-draw'
              )}
            >
              Draw
            </button>
            <button
              onClick={() => handlePredict('away')}
              disabled={isSubmitting}
              className={cn(
                'predict-btn predict-btn-away text-xs',
                activePrediction === 'away' && 'predict-btn-active-away'
              )}
            >
              <Zap className={cn('w-3 h-3 mx-auto mb-1', activePrediction === 'away' && 'text-brand-gold')} />
              {match.awayTeam.shortName}
            </button>
          </div>
          {activePrediction && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-brand-green text-xs mt-2"
            >
              ✓ Predicted: {activePrediction === 'home' ? match.homeTeam.name : activePrediction === 'away' ? match.awayTeam.name : 'Draw'}
            </motion.p>
          )}
        </div>
      )}

      {/* Result indicator for finished matches */}
      {isFinished && activePrediction && (
        <div className={cn(
          'mx-4 mb-4 py-2 px-3 rounded-xl text-xs font-semibold text-center',
          activePrediction === match.result
            ? 'bg-brand-green/15 text-brand-green border border-brand-green/20'
            : 'bg-red-500/10 text-red-400 border border-red-500/20'
        )}>
          {activePrediction === match.result ? '✓ Correct! +10 pts' : '✗ Incorrect'}
        </div>
      )}

      {/* View details link */}
      <Link
        href={`/matches/${match.id}`}
        className="flex items-center justify-center gap-1 py-2.5 border-t border-brand-border/50 text-xs text-gray-500 hover:text-brand-green transition-colors"
      >
        Match Details <ChevronRight className="w-3 h-3" />
      </Link>
    </motion.div>
  );
}
