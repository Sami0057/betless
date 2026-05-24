import { v4 as uuidv4 } from 'uuid';
import { query } from '../db/client';
import { NotificationType } from '@betless/shared';

interface NotificationPayload {
  type: NotificationType;
  title: string;
  titleAr?: string;
  message: string;
  messageAr?: string;
  metadata?: Record<string, unknown>;
}

export async function createNotification(userId: string, payload: NotificationPayload): Promise<void> {
  await query(
    `INSERT INTO notifications (id, user_id, type, title, title_ar, message, message_ar, metadata)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [
      uuidv4(),
      userId,
      payload.type,
      payload.title,
      payload.titleAr || payload.title,
      payload.message,
      payload.messageAr || payload.message,
      payload.metadata ? JSON.stringify(payload.metadata) : null,
    ]
  );
}

export async function broadcastNotification(payload: NotificationPayload): Promise<void> {
  await query(
    `INSERT INTO notifications (id, user_id, type, title, title_ar, message, message_ar, metadata)
     SELECT uuid_generate_v4(), id, $1, $2, $3, $4, $5, $6
     FROM users WHERE is_banned = false`,
    [payload.type, payload.title, payload.titleAr || payload.title, payload.message, payload.messageAr || payload.message, payload.metadata ? JSON.stringify(payload.metadata) : null]
  );
}

export async function getUserNotifications(userId: string, limit = 30) {
  return query(
    `SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2`,
    [userId, limit]
  );
}

export async function markAsRead(userId: string, notificationId?: string): Promise<void> {
  if (notificationId) {
    await query('UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2', [notificationId, userId]);
  } else {
    await query('UPDATE notifications SET is_read = true WHERE user_id = $1', [userId]);
  }
}
