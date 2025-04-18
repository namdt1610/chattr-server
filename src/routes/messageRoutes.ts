import { Router } from 'express'
import MessageController from '../controllers/messageController'
import { authMiddleware } from '@/middlewares/authAPI'
import { upload } from '@/config/multer'

const router = Router()

router.use(authMiddleware)
router.get('/recent-chats/:userId', MessageController.getRecentChats)
router.post('/send', upload.array('attachments'), MessageController.sendMessage)
router.get('/history', MessageController.getMessageHistory)

export default router
