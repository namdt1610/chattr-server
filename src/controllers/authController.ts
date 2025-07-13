import { Request, Response } from 'express'
import { registerUser, loginUser } from '@/services/authService'
import cookie from 'cookie'
import jwt from 'jsonwebtoken'
import { getCookieOptions, getClearCookieOptions } from '@/config/cookieConfig'

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

        // Generate tokens after successful registration
        const { access_token, refresh_token } = await loginUser({
            username,
            password,
        })

        // Set cookies
        res.cookie(
            'access_token',
            access_token,
            getCookieOptions(15 * 60 * 1000)
        )

        res.cookie(
            'refresh_token',
            refresh_token,
            getCookieOptions(7 * 24 * 60 * 60 * 1000)
        )

        res.status(201).json({
            message: 'User registered successfully',
            user,
            access_token,
            refresh_token,
        })
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

        const { access_token, refresh_token } = await loginUser({
            username,
            password,
        })

        // Set cookies
        res.cookie(
            'access_token',
            access_token,
            getCookieOptions(15 * 60 * 1000)
        )

        res.cookie(
            'refresh_token',
            refresh_token,
            getCookieOptions(7 * 24 * 60 * 60 * 1000)
        )

        res.status(200).json({
            message: 'Login successful',
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
        // Check for token in cookies first
        const cookies = cookie.parse(req.headers.cookie || '')
        let token = cookies.access_token

        // If no token in cookies, check Authorization header
        if (!token) {
            const authHeader = req.headers.authorization

            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                res.status(401).json({ message: 'Unauthorized' })
                return
            }

            token = authHeader.split(' ')[1]
        }

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

export const refreshToken = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const cookies = cookie.parse(req.headers.cookie || '')
        const refreshToken = cookies.refresh_token

        if (!refreshToken) {
            res.status(401).json({ message: 'Refresh token required' })
            return
        }

        // Verify refresh token
        const decoded = jwt.verify(
            refreshToken,
            (process.env.JWT_REFRESH_SECRET as string) ||
                (process.env.JWT_SECRET as string)
        ) as any

        if (!decoded || !decoded.userId) {
            res.status(401).json({ message: 'Invalid refresh token' })
            return
        }

        // Generate new access token
        const access_token = jwt.sign(
            { userId: decoded.userId },
            process.env.JWT_SECRET as string,
            { expiresIn: '15m' }
        )

        // Set new access token cookie
        res.cookie(
            'access_token',
            access_token,
            getCookieOptions(15 * 60 * 1000)
        )

        res.status(200).json({
            message: 'Token refreshed successfully',
            access_token,
        })
    } catch (error: any) {
        res.status(401).json({
            message: error.message || 'Invalid refresh token',
        })
    }
}

export const logout = async (req: Request, res: Response): Promise<void> => {
    try {
        // Clear both access and refresh token cookies
        res.clearCookie('access_token', getClearCookieOptions())
        res.clearCookie('refresh_token', getClearCookieOptions())

        res.status(200).json({
            message: 'Logged out successfully',
        })
    } catch (error: any) {
        res.status(500).json({
            message: error.message || 'Error during logout',
        })
    }
}
