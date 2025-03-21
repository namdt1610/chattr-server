import { Router } from 'express'
import MessageController from '../controllers/messageController'
import { authMiddleware } from '@/middlewares/authAPI'

const router = Router()

// Middleware để xác thực token
router.use(authMiddleware)

// Route để gửi tin nhắn
router.post('/send', MessageController.sendMessage)

// Route để lấy lịch sử tin nhắn
router.get('/history', MessageController.getMessageHistory)

export default router
