import { Request, Response } from 'express'
import MessageService from '../services/messageService'
import UserService from '../services/userService'

class MessageController {
    // API gửi tin nhắn
    async sendMessage(req: Request, res: Response): Promise<void> {
        const { content, selectedUserId } = req.body; // Sử dụng `selectedUserId` thay cho `receiverUsername`
        const senderUsername = req.user!.username; // Username của người gửi
        const senderId = req.user!.id; // ID của người gửi

        if (!content || !selectedUserId) {
            res.status(400).json({
                success: false,
                message: 'Content and selectedUserId are required',
            });
            return
        }

        try {
            // Kiểm tra nếu người nhận có tồn tại
            const receiver = await UserService.findById(selectedUserId); // Tìm người nhận theo `selectedUserId`
            if (!receiver) {
                res.status(404).json({
                    success: false,
                    message: 'Receiver not found',
                });
                return
            }

            // Tạo `conversationId` dựa trên `senderId` và `selectedUserId` để xác định cuộc trò chuyện
            const conversationId = [senderId, selectedUserId].sort().join('_')

            // Lưu tin nhắn vào cơ sở dữ liệu
            const message = await MessageService.saveMessage(senderId, selectedUserId, content, conversationId);


            // Emit tin nhắn vào phòng trò chuyện (room) dựa trên `conversationId`
            if (req.app.locals.socket) {
                req.app.locals.socket.to(conversationId).emit('private_message', { senderUsername, content });
            }

            // Gửi phản hồi thành công
            res.status(200).json({ success: true, message });

        } catch (error) {
            console.error(error); // Log lỗi để dễ dàng chẩn đoán
            res.status(500).json({
                success: false,
                message: 'Error saving message',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }


    // async sendMessage(req: Request, res: Response): Promise<void> {
    //     const { receiverUsername, content } = req.body
    //     const senderUsername = req.user!.username;

    //     try {
    //         const message = await MessageService.saveMessage(
    //             senderUsername,
    //             receiverUsername,
    //             content
    //         )
    //         res.status(200).json({ success: true, message })
    //     } catch (error) {
    //         res.status(500).json({
    //             success: false,
    //             message: 'Error saving message',
    //             error,
    //         })
    //     }
    // }

    // API lấy lịch sử tin nhắn
    // async getMessageHistory(req: Request, res: Response): Promise<void> {
    //     const { receiverUsername } = req.query
    //     const senderUsername = req.user!.username;

    //     try {
    //         const messages = await MessageService.getMessageHistory(
    //             senderUsername as string,
    //             receiverUsername as string
    //         )
    //         // console.log('Message History: ', messages)
    //         res.status(200).json({ success: true, messages })
    //     } catch (error) {
    //         res.status(500).json({
    //             success: false,
    //             message: 'Error fetching message history',
    //             error,
    //         })
    //     }
    // }

    async getMessageHistory(req: Request, res: Response): Promise<void> {
        const { conversationId } = req.query;

        if (!conversationId) {
            res.status(400).json({
                success: false,
                message: 'Missing conversationId in query parameters.',
            });
            return
        }

        try {
            const messages = await MessageService.getMessageHistory(conversationId as string);

            res.status(200).json({
                success: true,
                messages,
            });
            return
        } catch (error) {
            console.error('Error fetching message history:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error while fetching message history.',
                error,
            });
            return
        }
    }

}

export default new MessageController()
