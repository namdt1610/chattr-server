import express from 'express'
import { createMessage, fetchMessages } from '@/controllers/msgController'
import { authMiddleware } from '@/middlewares/auth'

const router = express.Router()

router.post('/send', authMiddleware, createMessage)
router.get('/chat/:user2', authMiddleware, fetchMessages)

export default router
