import express from 'express';
import {
  chatbotStatus,
  queryChatbot,
  rebuildChatbotIndex,
} from '../controllers/chatbot.controller.js';

const router = express.Router();

router.get('/status', chatbotStatus);
router.post('/query', queryChatbot);
router.post('/reindex', rebuildChatbotIndex);

export default router;
