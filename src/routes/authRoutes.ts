import express from 'express'
import {
    register,
    login,
    me,
    refreshToken,
    logout,
} from '@/controllers/authController'

const router = express.Router()

router.post('/register', register)
router.post('/login', login)
router.get('/me', me)
router.post('/refresh-token', refreshToken)
router.post('/logout', logout)

export default router
