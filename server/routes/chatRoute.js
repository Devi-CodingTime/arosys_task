import express from 'express';
import { getUserChats } from '../controllers/chatController.js';

const router = express.Router();

router.get('/user-chats/:userId', async (req, res) => {
  try {
    const chats = await getUserChats(req.params.userId);
    res.json({ success: true, data: chats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
