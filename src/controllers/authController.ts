import { Request, Response } from 'express'
import { registerUser, loginUser } from '@/services/authService'

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

        const data = await loginUser({ username, password })
        res.status(200).json({ message: 'Login successful', ...data })
        return
    } catch (error: any) {
        res.status(401).json({
            message: error.message || 'Invalid credentials',
        })
        return
    }
}
