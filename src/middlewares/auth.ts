import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

export interface AuthRequest extends Request {
    userId?: string
}

export const authMiddleware = (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): void => {
    const token = req.header('Authorization')?.split(' ')[1] // Lấy token từ header

    if (!token) {
        res.status(401).json({ message: 'Unauthorized' })
        return
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
            userId: string
        }
        req.userId = decoded.userId
        next()
    } catch (error) {
        res.status(403).json({ message: 'Invalid token' })
        return
    }
}
