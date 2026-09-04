import express from 'express';
import { db } from '../config/db.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// GET /api/notifications
router.get('/', authenticate, (req, res) => {
  const notifs = db.getNotifications(req.user.id);
  return res.json({ notifications: notifs });
});

// POST /api/notifications/:id/read
router.post('/:id/read', authenticate, (req, res) => {
  const updated = db.markNotificationRead(req.params.id);
  return res.json({ message: 'Marked as read', notification: updated });
});

export default router;
