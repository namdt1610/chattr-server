import { Router } from 'express'
import { Message } from '@/models/Message'
import MessageController from '@/controllers/messageController'
import { protect, restrictToOwner } from '@/middlewares/apiProtect'

const router = Router()

// Route để gửi tin nhắn
router.post('/send', protect, restrictToOwner(Message,'id'), MessageController.sendMessage)

// Route để lấy lịch sử tin nhắn
router.get('/history', protect, MessageController.getMessageHistory)

export default router
