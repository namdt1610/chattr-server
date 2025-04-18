import { Request, Response, NextFunction } from 'express'
import request from 'supertest'
import { app } from '../server'
import UserService from '@/services/userService'
import TokenService from '@/services/tokenService'
import bcrypt from 'bcrypt'

// Mock services
jest.mock('@/services/userService')
jest.mock('@/services/tokenService')
jest.mock('bcrypt')

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
    }
}))

describe('AuthController', () => {
    // Mock data
    const mockUser = {
        _id: '12345',
        username: 'testUser', 
        password: 'hashedPassword123',
        createdAt: new Date().toISOString()
    }

    const mockAccessToken = 'mock_access_token'
    const mockRefreshToken = 'mock_refresh_token'
    
    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks()
    })
    
    describe('POST /api/auth/register', () => {
        it('should register a new user successfully', async () => {
            // Mock UserService.findByUsername to return null (no existing user)
            jest.spyOn(UserService, 'findByUsername').mockResolvedValue(null)
            
            // Mock UserService.createUser to return the new user
            jest.spyOn(UserService, 'createUser').mockResolvedValue(mockUser as any)
            
            // Mock bcrypt hash
            jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedPassword123')
            
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    username: 'testUser',
                    password: 'Password123',
                })
            
            expect(res.status).toBe(201)
            expect(res.body.success).toBe(true)
            expect(res.body.message).toBe('User registered successfully')
            expect(res.body.user).toHaveProperty('username', 'testUser')
        })
        
        it('should return 400 if username is already taken', async () => {
            // Mock UserService.findByUsername to return an existing user
            jest.spyOn(UserService, 'findByUsername').mockResolvedValue(mockUser as any)
            
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    username: 'testUser',
                    password: 'Password123',
                })
            
            expect(res.status).toBe(400)
            expect(res.body.success).toBe(false)
            expect(res.body.message).toBe('Username already taken')
        })
        
        it('should return 400 if username or password is missing', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    username: '',
                    password: '',
                })
            
            expect(res.status).toBe(400)
            expect(res.body.success).toBe(false)
            expect(res.body.message).toBe('Username and password are required')
        })
        
        it('should return 500 if server error occurs', async () => {
            jest.spyOn(UserService, 'findByUsername').mockRejectedValue(new Error('Database error'))
            
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    username: 'testUser',
                    password: 'Password123',
                })
            
            expect(res.status).toBe(500)
            expect(res.body.success).toBe(false)
            expect(res.body.message).toBe('Error registering user')
        })
    })
    
    describe('POST /api/auth/login', () => {
        it('should login successfully with correct credentials', async () => {
            // Mock UserService.findByUsername to return user
            jest.spyOn(UserService, 'findByUsername').mockResolvedValue(mockUser as any)
            
            // Mock bcrypt compare to return true
            jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never)
            
            // Mock token generation
            jest.spyOn(TokenService, 'generateAccessToken').mockReturnValue(mockAccessToken)
            jest.spyOn(TokenService, 'generateRefreshToken').mockResolvedValue(mockRefreshToken)
            
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    username: 'testUser',
                    password: 'correctPassword',
                })
            
            expect(res.status).toBe(200)
            expect(res.body.success).toBe(true)
            expect(res.body.accessToken).toBe(mockAccessToken)
            expect(res.body.refreshToken).toBe(mockRefreshToken)
            expect(res.body.user).toHaveProperty('username', 'testUser')
        })
        
        it('should return 401 with incorrect password', async () => {
            // Mock UserService.findByUsername to return user
            jest.spyOn(UserService, 'findByUsername').mockResolvedValue(mockUser as any)
            
            // Mock bcrypt compare to return false (incorrect password)
            jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never)
            
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    username: 'testUser',
                    password: 'wrongPassword',
                })
            
            expect(res.status).toBe(401)
            expect(res.body.success).toBe(false)
            expect(res.body.message).toBe('Invalid username or password')
        })
        
        it('should return 401 if user not found', async () => {
            // Mock UserService.findByUsername to return null (user not found)
            jest.spyOn(UserService, 'findByUsername').mockResolvedValue(null)
            
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    username: 'nonexistentUser',
                    password: 'anyPassword',
                })
            
            expect(res.status).toBe(401)
            expect(res.body.success).toBe(false)
            expect(res.body.message).toBe('Invalid username or password')
        })
        
        it('should return 400 if username or password is missing', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    username: '',
                    password: '',
                })
            
            expect(res.status).toBe(400)
            expect(res.body.success).toBe(false)
            expect(res.body.message).toBe('Username and password are required')
        })
    })
    
    describe('POST /api/auth/refresh', () => {
        it('should refresh tokens successfully', async () => {
            const userId = '12345'
            
            // Mock token verification
            jest.spyOn(TokenService, 'verifyRefreshToken').mockResolvedValue({ userId })
            
            // Mock token generation
            jest.spyOn(TokenService, 'generateAccessToken').mockReturnValue('new_access_token')
            jest.spyOn(TokenService, 'generateRefreshToken').mockResolvedValue('new_refresh_token')
            
            // Mock token revocation
            jest.spyOn(TokenService, 'revokeRefreshToken').mockResolvedValue(true)
            
            // Mock user service
            jest.spyOn(UserService, 'findById').mockResolvedValue({
                _id: userId,
                username: 'testUser'
            } as any)
            
            const res = await request(app)
                .post('/api/auth/refresh')
                .send({
                    refreshToken: 'valid_refresh_token'
                })
            
            expect(res.status).toBe(200)
            expect(res.body.success).toBe(true)
            expect(res.body.accessToken).toBe('new_access_token')
            expect(res.body.refreshToken).toBe('new_refresh_token')
        })
        
        it('should return 401 if refresh token is invalid', async () => {
            // Mock token verification to return null
            jest.spyOn(TokenService, 'verifyRefreshToken').mockResolvedValue(null)
            
            const res = await request(app)
                .post('/api/auth/refresh')
                .send({
                    refreshToken: 'invalid_refresh_token'
                })
            
            expect(res.status).toBe(401)
            expect(res.body.success).toBe(false)
            expect(res.body.message).toBe('Invalid refresh token')
        })
        
        it('should return 400 if refresh token is missing', async () => {
            const res = await request(app)
                .post('/api/auth/refresh')
                .send({})
            
            expect(res.status).toBe(400)
            expect(res.body.success).toBe(false)
            expect(res.body.message).toBe('Refresh token is required')
        })
    })
    
    describe('GET /api/auth/me', () => {
        it('should return authenticated user info', async () => {
            // Mock user service to return user info
            jest.spyOn(UserService, 'findById').mockResolvedValue({
                _id: '12345',
                username: 'testUser',
                role: 'user'
            } as any)
            
            const res = await request(app)
                .get('/api/auth/me')
                .set('Authorization', 'Bearer valid_token')
            
            expect(res.status).toBe(200)
            expect(res.body.username).toBe('testUser')
        })
        
        it('should return 401 if not authenticated', async () => {
            const res = await request(app)
                .get('/api/auth/me')
            
            expect(res.status).toBe(401)
            expect(res.body.success).toBe(false)
            expect(res.body.message).toBe('Unauthorized')
        })
    })
    
    describe('POST /api/auth/logout', () => {
        it('should logout successfully', async () => {
            // Mock token revocation
            jest.spyOn(TokenService, 'revokeRefreshToken').mockResolvedValue(true)
            
            const res = await request(app)
                .post('/api/auth/logout')
                .send({
                    refreshToken: 'valid_refresh_token'
                })
            
            expect(res.status).toBe(200)
            expect(res.body.success).toBe(true)
            expect(res.body.message).toBe('Logged out successfully')
        })
        
        it('should return 400 if refresh token is missing', async () => {
            const res = await request(app)
                .post('/api/auth/logout')
                .send({})
            
            expect(res.status).toBe(400)
            expect(res.body.success).toBe(false)
            expect(res.body.message).toBe('Refresh token is required')
        })
    })
    
    describe('POST /api/auth/logout-all', () => {
        it('should logout from all devices', async () => {
            // Mock revocation of all tokens
            jest.spyOn(TokenService, 'revokeAllUserTokens').mockResolvedValue(true)
            
            const res = await request(app)
                .post('/api/auth/logout-all')
                .set('Authorization', 'Bearer valid_token')
            
            expect(res.status).toBe(200)
            expect(res.body.success).toBe(true)
            expect(res.body.message).toBe('Logged out from all devices')
        })
        
        it('should return 401 if not authenticated', async () => {
            const res = await request(app)
                .post('/api/auth/logout-all')
            
            expect(res.status).toBe(401)
            expect(res.body.success).toBe(false)
            expect(res.body.message).toBe('Unauthorized')
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
        
        await new Promise(resolve => setTimeout(resolve, 500))
    })
})