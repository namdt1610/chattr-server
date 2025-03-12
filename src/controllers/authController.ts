import { Request, Response } from 'express'
import { registerUser, loginUser } from '@/services/authService'
import cookie from 'cookie'
import jwt from 'jsonwebtoken'

export const register = async (req: Request, res: Response) => {
    try {
        const { username, password } = req.body

        if (!username || !password) {
            res.status(400).json({
                message: 'Username and password are required',
            })
            return
        }

        const user = await registerUser({ username, password })
        res.status(201).json({ message: 'User registered successfully', user })
        return
    } catch (error: any) {
        res.status(500).json({
            message: error.message || 'Internal server error',
        })
        return
    }
}

export const login = async (req: Request, res: Response) => {
    try {
        const { username, password } = req.body

        if (!username || !password) {
            res.status(400).json({
                message: 'Username and password are required',
            })
            return
        }

        const token = await loginUser({ username, password })

        // res.cookie('token', token, {
        //     httpOnly: true,
        //     secure: process.env.NODE_ENV === 'production',
        //     maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
        // })

        res.status(200).json({
            message: 'Login successful',
            token: token,
            user: username,
        })
        return
    } catch (error: any) {
        res.status(401).json({
            message: error.message || 'Invalid credentials',
        })
        return
    }
}

export const me = async (req: Request, res: Response): Promise<void> => {
    try {
        // const cookies = cookie.parse(req.headers.cookie || '')
        // const token = cookies.token
        const authHeader = req.headers.authorization

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ message: 'Unauthorized' })
            return
        }

        const token = authHeader.split(' ')[1]

        if (!token) {
            res.status(401).json({ message: 'Unauthorized' })
            return
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET as string
        ) as any

        if (!decoded || !decoded.userId) {
            res.status(401).json({ message: 'Invalid token' })
            return
        }

        // Trả về thông tin user
        res.status(200).json({
            user: {
                userId: decoded.userId,
                username: decoded.username,
                role: decoded.role || 'user',
            },
        })
    } catch (error: any) {
        res.status(401).json({
            message: 'Invalid token or expired',
        })
    }
}
