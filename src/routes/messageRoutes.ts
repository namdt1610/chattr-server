import { Router } from 'express'
import MessageController from '../controllers/messageController'

const router = Router()

// Route để gửi tin nhắn
router.post('/send', MessageController.sendMessage)

// Route để lấy lịch sử tin nhắn
router.get('/history', MessageController.getMessageHistory)

export default router
