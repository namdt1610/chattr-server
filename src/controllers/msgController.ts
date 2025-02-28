import { Request, Response } from 'express'
import { sendMessage, getMessages } from '@/services/msgService'
import { AuthRequest } from '@/middlewares/auth'

export const createMessage = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    try {
        const senderId = req.userId // Lấy từ middleware JWT
        const { receiverId, message } = req.body

        if (!receiverId || !message) {
            res.status(400).json({
                message: 'Receiver and message are required',
            })
            return
        }

        const newMessage = await sendMessage({ senderId, receiverId, message })
        res.status(201).json({
            message: 'Message sent successfully',
            data: newMessage,
        })
        return
    } catch (error: any) {
        res.status(500).json({
            message: error.message || 'Internal server error',
        })
        return
    }
}

export const fetchMessages = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    try {
        const user1 = req.userId as string // Lấy từ middleware JWT
        const { user2 } = req.params // Lấy user còn lại từ params

        if (!user2) {
            res.status(400).json({ message: 'User2 ID is required' })
            return
        }

        const messages = await getMessages(user1, user2)
        res.status(200).json({ messages })
        return
    } catch (error: any) {
        res.status(500).json({
            message: error.message || 'Internal server error',
        })
        return
    }
}
