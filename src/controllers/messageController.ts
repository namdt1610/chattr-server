import { Request, Response } from 'express'
import MessageService from '../services/messageService'
import UserService from '../services/userService'

class MessageController {
    // API lấy danh sách cuộc trò chuyện gần đây
    async getRecentChats(req: Request, res: Response) {
        try {
            const userId = req.params.userId // Lấy userId từ URL
            const chats = await MessageService.getRecentChats(userId)
            res.status(200).json(chats) // Trả về danh sách chat gần đây
        } catch (error: any) {
            res.status(500).json({ message: error.message })
        }
    }

    // API gửi tin nhắn
    async sendMessage(req: Request, res: Response): Promise<void> {
        console.log('req.body:', req.body)
        console.log('req.files:', req.files) 
        
        const { content, selectedUserId } = req.body
        const senderUsername = req.user!.username
        const senderId = req.user!.id

        const hasFiles =
            req.files && Array.isArray(req.files) && req.files.length > 0
        if ((!content && !hasFiles) || !selectedUserId) {
            res.status(400).json({
                success: false,
                message: 'Content and selectedUserId are required',
            })
            return
        }

        try {
            const receiver = await UserService.findById(selectedUserId) // Tìm người nhận theo `selectedUserId`
            if (!receiver) {
                res.status(404).json({
                    success: false,
                    message: 'Receiver not found',
                })
                return
            }

            // Tạo `conversationId` dựa trên `senderId` và `selectedUserId` để xác định cuộc trò chuyện
            const conversationId = [senderId, selectedUserId].sort().join('_')

            const attachments: string[] = []

            // Handle multiple file uploads if they exist
            if (hasFiles) {
                // Cast req.files to appropriate type - assuming it's an array of files
                const files = req.files as Express.Multer.File[]
                files.forEach((file) => {
                    attachments.push(file.path)
                })
            }
            // Lưu tin nhắn vào cơ sở dữ liệu
            const message = await MessageService.saveMessage(
                senderId,
                selectedUserId,
                content || '',
                conversationId,
                attachments
            )

            // Emit tin nhắn vào phòng trò chuyện (room) dựa trên `conversationId`
            if (req.app.locals.socket) {
                req.app.locals.socket
                    .to(conversationId)
                    .emit('private_message', { senderUsername, content })
            }

            // Gửi phản hồi thành công
            res.status(200).json({ success: true, message })
        } catch (error) {
            console.error(error) // Log lỗi để dễ dàng chẩn đoán
            res.status(500).json({
                success: false,
                message: 'Error saving message',
                error: error instanceof Error ? error.message : 'Unknown error',
            })
        }
    }

    async getMessageHistory(req: Request, res: Response): Promise<void> {
        const { conversationId } = req.query

        if (!conversationId) {
            res.status(400).json({
                success: false,
                message: 'Missing conversationId in query parameters.',
            })
            return
        }

        try {
            const messages = await MessageService.getMessageHistory(
                conversationId as string
            )

            res.status(200).json({
                success: true,
                messages,
            })
            return
        } catch (error) {
            console.error('Error fetching message history:', error)
            res.status(500).json({
                success: false,
                message:
                    'Internal server error while fetching message history.',
                error,
            })
            return
        }
    }
}

export default new MessageController()
