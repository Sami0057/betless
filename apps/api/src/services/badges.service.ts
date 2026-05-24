import { query, queryOne } from '../db/client';
import { createNotification } from './notifications.service';

export async function checkAndAwardBadges(userId: string): Promise<void> {
  const user = await queryOne<{
    correct_predictions: number;
    total_predictions: number;
    current_streak: number;
    longest_streak: number;
    total_points: number;
  }>(
    'SELECT correct_predictions, total_predictions, current_streak, longest_streak, total_points FROM users WHERE id = $1',
    [userId]
  );

  if (!user) return;

  const badges = await query<{ id: string; requirement_type: string; requirement_value: number }>(
    'SELECT id, requirement_type, requirement_value FROM badges WHERE is_active = true'
  );

  const earned = await query<{ badge_id: string }>(
    'SELECT badge_id FROM user_badges WHERE user_id = $1',
    [userId]
  );
  const earnedIds = new Set(earned.map((e) => e.badge_id));

  for (const badge of badges) {
    if (earnedIds.has(badge.id)) continue;

    let qualifies = false;

    switch (badge.requirement_type) {
      case 'total_predictions':
        qualifies = user.total_predictions >= badge.requirement_value;
        break;
      case 'correct_predictions':
        qualifies = user.correct_predictions >= badge.requirement_value;
        break;
      case 'streak':
        qualifies = user.longest_streak >= badge.requirement_value;
        break;
      case 'total_points':
        qualifies = user.total_points >= badge.requirement_value;
        break;
      case 'success_rate':
        if (user.total_predictions >= 20) {
          const rate = Math.round((user.correct_predictions / user.total_predictions) * 100);
          qualifies = rate >= badge.requirement_value;
        }
        break;
    }

    if (qualifies) {
      await query(
        'INSERT INTO user_badges (user_id, badge_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [userId, badge.id]
      );

      const badgeInfo = await queryOne<{ name: string; name_ar: string; icon: string }>(
        'SELECT name, name_ar, icon FROM badges WHERE id = $1',
        [badge.id]
      );

      if (badgeInfo) {
        await createNotification(userId, {
          type: 'badge_earned',
          title: `Badge Unlocked: ${badgeInfo.icon} ${badgeInfo.name}`,
          titleAr: `شارة جديدة: ${badgeInfo.icon} ${badgeInfo.name_ar || badgeInfo.name}`,
          message: 'You earned a new badge! Check your profile.',
          messageAr: 'ربحت شارة جديدة! تحقق من ملفك الشخصي.',
          metadata: { badgeId: badge.id },
        });
      }
    }
  }
}

export async function getUserBadges(userId: string) {
  return query(
    `SELECT b.*, ub.earned_at
     FROM badges b
     JOIN user_badges ub ON ub.badge_id = b.id
     WHERE ub.user_id = $1
     ORDER BY ub.earned_at DESC`,
    [userId]
  );
}

export async function getAllBadges() {
  return query('SELECT * FROM badges WHERE is_active = true ORDER BY rarity, name');
}
