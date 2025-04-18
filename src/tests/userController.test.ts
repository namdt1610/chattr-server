import { Request, Response, NextFunction } from 'express'
import request from 'supertest'
import { app } from '../server'
import UserService from '@/services/userService'

// Mock middleware xác thực
jest.mock('../middlewares/authAPI', () => ({
    authMiddleware: (req: Request, res: Response, next: NextFunction) => {
        const authHeader = req.headers.authorization

        if (authHeader === 'Bearer valid_token') {
            req.user = {
                id: '12345',
                username: 'testUser',
                role: 'user',
            }
            return next()
        }

        return res.status(401).json({ success: false, message: 'Unauthorized' })
    },
}))

// Mock UserService
jest.mock('../services/userService')

describe('UserController', () => {
    // Mock data
    const mockUsers = [
        {
            _id: '12345',
            username: 'user1',
            createdAt: new Date().toISOString(),
        },
        {
            _id: '67890',
            username: 'user2',
            createdAt: new Date().toISOString(),
        },
    ]

    describe('GET /api/users', () => {
        it('should return all users', async () => {
            // Mock trả về danh sách người dùng
            ;(UserService.getAllUsers as jest.Mock).mockImplementation(() => {
                return Promise.resolve(mockUsers)
            })

            const res = await request(app)
                .get('/api/users')
                .set('Authorization', 'Bearer valid_token')

            expect(res.status).toBe(200)
            expect(res.body).toEqual(mockUsers)
        })

        it('should return 500 if an error occurs', async () => {
            // Mock lỗi khi lấy danh sách người dùng
            jest.spyOn(UserService, 'getAllUsers').mockRejectedValue(
                new Error('Failed to fetch users')
            )

            const res = await request(app)
                .get('/api/users')
                .set('Authorization', 'Bearer valid_token')

            expect(res.status).toBe(500)
            expect(res.body.message).toBe('Failed to fetch users')
        })
    })

    describe('GET /api/users/:username', () => {
        it('should return users matching username search', async () => {
            const username = 'user'
            const mockSearchResults = [
                { _id: '12345', username: 'user1' },
                { _id: '67890', username: 'user2' },
            ] as any

            // Mock trả về kết quả tìm kiếm
            jest.spyOn(UserService, 'getUserByUsername').mockResolvedValue(
                mockSearchResults
            )

            const res = await request(app)
                .get(`/api/users/${username}`)
                .set('Authorization', 'Bearer valid_token')

            expect(res.status).toBe(200)
            expect(res.body).toEqual(mockSearchResults)
        })

        it('should return 404 if no users found', async () => {
            const username = 'nonexistent'

            // Mock không tìm thấy người dùng
            jest.spyOn(UserService, 'getUserByUsername').mockResolvedValue(
                null as any
            )

            const res = await request(app)
                .get(`/api/users/${username}`)
                .set('Authorization', 'Bearer valid_token')

            expect(res.status).toBe(404)
            expect(res.body.message).toBe('User not found')
        })

        it('should return 500 if an error occurs', async () => {
            const username = 'user'

            // Mock lỗi khi tìm người dùng
            jest.spyOn(UserService, 'getUserByUsername').mockRejectedValue(
                new Error('Database error')
            )

            const res = await request(app)
                .get(`/api/users/${username}`)
                .set('Authorization', 'Bearer valid_token')

            expect(res.status).toBe(500)
            expect(res.body.message).toBe('Database error')
        })
    })

    // Clean up connections
    afterAll(async () => {
        try {
            const mongoose = require('mongoose')
            await mongoose.connection.close()

            const redisClient = require('../config/redis').default
            await redisClient.quit()
        } catch (error) {
            console.log('Error closing connections:', error)
        }

        await new Promise((resolve) => setTimeout(resolve, 500))
    })
})
