import { Request, Response, NextFunction } from 'express'
import request from 'supertest'
import { app } from '../server' // Đảm bảo rằng app của bạn được export ở đâu đó
import MessageService from '@/services/messageService'
import UserService from '@/services/userService'

jest.mock('../middlewares/authAPI', () => ({
    authMiddleware: (req: Request, res: Response, next: NextFunction) => {
        // Thiết lập user giả lập khi nhận token 'valid_token'
        const authHeader = req.headers.authorization

        if (authHeader === 'Bearer valid_token') {
            req.user = {
                id: '12345',
                username: 'testUser',
                role: 'user',
            }
            return next()
        }

        // Nếu không có token hoặc token không đúng
        return res.status(401).json({ success: false, message: 'Unauthorized' })
    },
}))

// Mock các service (MessageService và UserService)
jest.mock('../services/messageService')
jest.mock('../services/userService')

describe('MessageController', () => {
    let mockFindById: jest.Mock
    let mockSaveMessage: jest.Mock

    beforeAll(() => {
        // Mock các method của service
        mockFindById = UserService.findById as jest.Mock
        mockSaveMessage = MessageService.saveMessage as jest.Mock
    })

    describe('GET /api/messages/recent-chats/:userId', () => {
        it('should return recent chats for a user', async () => {
            const userId = '12345'
            const mockChats = [
                {
                    conversationId: '1_2',
                    lastMessage: 'Hello',
                    partner: {
                        _id: '123' as any,
                        username: 'testUser',
                    },
                    createdAt: new Date().toISOString(),
                },
            ]

            // Mock trả về từ MessageService
            jest.spyOn(MessageService, 'getRecentChats').mockResolvedValue(
                mockChats
            )

            const res = await request(app)
                .get(`/api/messages/recent-chats/${userId}`)
                .set('Authorization', 'Bearer valid_token')

            expect(res.status).toBe(200)
            expect(res.body).toEqual(mockChats)
        })

        it('should return 500 if an error occurs', async () => {
            const userId = '12345'

            // Mock lỗi trả về từ MessageService
            jest.spyOn(MessageService, 'getRecentChats').mockRejectedValue(
                new Error('Something went wrong')
            )

            const res = await request(app)
                .get(`/api/messages/recent-chats/${userId}`)
                .set('Authorization', 'Bearer valid_token')

            expect(res.status).toBe(500)
            expect(res.body.message).toBe('Something went wrong')
        })
    })

    describe('POST /api/messages/send', () => {
        it('should send a message successfully', async () => {
            const mockReceiver = { id: '67890', username: 'receiver' }
            const mockMessage = {
                senderId: '12345',
                receiverId: '67890',
                content: 'Hello!',
                conversationId: '12345_67890',
                createdAt: new Date().toISOString(),
            }

            // Mock các service
            mockFindById.mockResolvedValue(mockReceiver)
            mockSaveMessage.mockResolvedValue(mockMessage)

            const res = await request(app)
                .post('/api/messages/send')
                .send({
                    content: 'Hello!',
                    selectedUserId: '67890',
                })
                .set('Authorization', 'Bearer valid_token') // Giả sử bạn có authentication middleware

            expect(res.status).toBe(200)
            expect(res.body.success).toBe(true)
            expect(res.body.message).toEqual(mockMessage)
        })

        it('should return 400 if content or selectedUserId is missing', async () => {
            const res = await request(app)
                .post('/api/messages/send')
                .send({
                    content: '',
                    selectedUserId: '',
                })
                .set('Authorization', 'Bearer valid_token')

            expect(res.status).toBe(400)
            expect(res.body.message).toBe(
                'Content and selectedUserId are required'
            )
        })

        it('should return 404 if receiver is not found', async () => {
            mockFindById.mockResolvedValue(null) // Không tìm thấy người nhận

            const res = await request(app)
                .post('/api/messages/send')
                .send({
                    content: 'Hello!',
                    selectedUserId: '67890',
                })
                .set('Authorization', 'Bearer valid_token')

            expect(res.status).toBe(404)
            expect(res.body.message).toBe('Receiver not found')
        })

        it('should return 500 if an error occurs', async () => {
            mockFindById.mockResolvedValue({
                id: '67890',
                username: 'receiver',
            })
            jest.spyOn(MessageService, 'saveMessage').mockRejectedValue(
                new Error('Error saving message')
            )

            const res = await request(app)
                .post('/api/messages/send')
                .send({
                    content: 'Hello!',
                    selectedUserId: '67890',
                })
                .set('Authorization', 'Bearer valid_token')

            expect(res.status).toBe(500)
            expect(res.body.message).toBe('Error saving message')
        })
    })

    describe('GET /api/messages/history', () => {
        it('should return message history', async () => {
            const conversationId = '12345_67890'
            const mockMessages = [
                {
                    sender: '12345',
                    content: 'Hello!',
                    createdAt: new Date().toISOString(),
                },
            ]

            // Mock trả về từ MessageService
            jest.spyOn(MessageService, 'getMessageHistory').mockResolvedValue(
                mockMessages
            )

            const res = await request(app)
                .get(`/api/messages/history?conversationId=${conversationId}`)
                .set('Authorization', 'Bearer valid_token')

            expect(res.status).toBe(200)
            expect(res.body.success).toBe(true)
            expect(res.body.messages).toEqual(mockMessages)
        })

        it('should return 400 if conversationId is missing', async () => {
            const res = await request(app)
                .get('/api/messages/history')
                .set('Authorization', 'Bearer valid_token')

            expect(res.status).toBe(400)
            expect(res.body.message).toBe(
                'Missing conversationId in query parameters.'
            )
        })

        it('should return 500 if an error occurs while fetching history', async () => {
            jest.spyOn(MessageService, 'getMessageHistory').mockRejectedValue(
                new Error('Error fetching history')
            )

            const res = await request(app)
                .get('/api/messages/history?conversationId=12345_67890')
                .set('Authorization', 'Bearer valid_token')

            expect(res.status).toBe(500)
            expect(res.body.message).toBe(
                'Internal server error while fetching message history.'
            )
        })
    })
})

afterAll(async () => {
    // Đóng các kết nối
    // Nếu bạn có một instance mongoose
    const mongoose = require('mongoose')
    await mongoose.connection.close()

    // Nếu bạn có Redis client
    const redisClient = require('../config/redis').default
    await redisClient.quit()

    // Đợi mọi hành động không đồng bộ hoàn thành
    await new Promise((resolve) => setTimeout(resolve, 500))
})
