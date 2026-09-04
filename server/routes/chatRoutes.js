import express from 'express';
import { AIChatService } from '../services/aiChatService.js';

const router = express.Router();

// POST /api/chat
router.post('/', async (req, res) => {
  try {
    const { userId, message, language } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message content is required.' });
    }

    const response = await AIChatService.handleMessage({ userId, message, language });
    return res.json(response);
  } catch (err) {
    return res.status(500).json({ error: 'AI Assistant error: ' + err.message });
  }
});

export default router;
