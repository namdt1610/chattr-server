import { Request, Response } from 'express'
import MessageService from '../services/messageService'

class MessageController {
    // API gửi tin nhắn
    async sendMessage(req: Request, res: Response): Promise<void> {
        const { receiverUsername, content } = req.body
        const senderUsername = req.user!.username;

        try {
            const message = await MessageService.saveMessage(
                senderUsername,
                receiverUsername,
                content
            )
            res.status(200).json({ success: true, message })
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error saving message',
                error,
            })
        }
    }

    // API lấy lịch sử tin nhắn
    async getMessageHistory(req: Request, res: Response): Promise<void> {
        const { receiverUsername } = req.query
        const senderUsername = req.user!.username;

        try {
            const messages = await MessageService.getMessageHistory(
                senderUsername as string,
                receiverUsername as string
            )
            // console.log('Message History: ', messages)
            res.status(200).json({ success: true, messages })
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error fetching message history',
                error,
            })
        }
    }
}

export default new MessageController()
