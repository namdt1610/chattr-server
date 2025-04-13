import express from 'express'
import { register, login, me, logoutAllDevices, refresh, logoutUser } from '@/controllers/authController'
import { authMiddleware } from '@/middlewares/authAPI'

const router = express.Router()

router.post('/register', register)
router.post('/login', login)
router.post('/refresh', refresh)
router.post('/logout', logoutUser)

// Routes cần xác thực
router.get('/me', authMiddleware, me)
router.post('/logout-all', authMiddleware, logoutAllDevices)


export default router
