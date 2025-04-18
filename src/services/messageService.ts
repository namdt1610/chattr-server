import { IMessage, Message } from '../models/Message'
import { User } from '../models/User'
import mongoose from 'mongoose'

class MessageService {
    // Tìm ObjectId của user dựa trên username
    async getUserIdByUsername(username: string) {
        const user = await User.findOne({ username })
        if (!user) {
            throw new Error('User not found')
        }
        return user._id
    }

    async getRecentChats(userId: string) {
        try {
            const recentChats = await Message.aggregate([
                {
                    $match: {
                        $or: [
                            { senderId: new mongoose.Types.ObjectId(userId) },
                            { receiverId: new mongoose.Types.ObjectId(userId) },
                        ],
                    },
                },
                {
                    $sort: { createdAt: -1 },
                },
                {
                    $group: {
                        _id: '$conversationId',
                        lastMessage: { $first: '$content' },
                        lastSenderId: { $first: '$senderId' },
                        lastReceiverId: { $first: '$receiverId' },
                        createdAt: { $first: '$createdAt' },
                    },
                },
                {
                    $sort: { createdAt: -1 },
                },
            ])

            const populatedChats = await Promise.all(
                recentChats.map(async (chat) => {
                    const partnerId =
                        String(chat.lastSenderId) === userId
                            ? chat.lastReceiverId
                            : chat.lastSenderId

                    const partner = await User.findById(partnerId).select(
                        'username avatar'
                    )

                    return {
                        conversationId: chat._id,
                        partner: partner
                            ? {
                                  _id: partner._id,
                                  username: partner.username,
                                  // avatar: partner.avatar
                              }
                            : null,
                        lastMessage: chat.lastMessage,
                        createdAt: chat.createdAt,
                    }
                })
            )

            return populatedChats
        } catch (error) {
            console.error('Error fetching recent chats:', error)
            throw new Error('Could not fetch recent chats.')
        }
    }

    // Lưu tin nhắn vào DB
    async saveMessage(
        senderId: string,
        receiverId: string,
        content: string,
        conversationId: string,
        attachments: string[] = []
    ): Promise<any> {
        try {
            // Tạo một đối tượng tin nhắn mới
            const newMessage = new Message({
                senderId,
                receiverId,
                content,
                conversationId,
                createdAt: new Date(),
                attachments,
            })

            // Lưu tin nhắn vào cơ sở dữ liệu
            const savedMessage = await newMessage.save()
            return savedMessage
        } catch (error: any) {
            throw new Error('Error saving message: ' + error.message)
        }
    }

    async getMessageHistory(conversationId: string) {
        try {
            const messages = await Message.find({ conversationId })
                .sort({ createdAt: 1 })
                .populate('senderId', 'username _id') // Lấy tin nhắn cũ -> mới

            return messages.map((msg) => ({
                sender: msg.senderId, // senderId sau khi populate thành object { _id, username }
                content: msg.content,
                attachments: msg.attachments,
                createdAt: msg.createdAt,
            }))
        } catch (error) {
            console.error(
                `Failed to fetch messages for conversation ${conversationId}:`,
                error
            )
            throw new Error('Could not fetch message history.')
        }
    }
}

export default new MessageService()
