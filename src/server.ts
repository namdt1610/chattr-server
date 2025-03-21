import express from 'express'
import { createServer } from 'http'
import cors from 'cors'
import connectDB from './config/db'
import authRoutes from './routes/authRoutes'
import userRoutes from './routes/userRoutes'
import chatRoutes from './routes/messageRoutes'
import setupSocket from './config/socket'
import redisClient from './config/redis'

const app = express()
const server = createServer(app)

connectDB()

const corsOptions = {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
}

app.use(cors(corsOptions))
app.use(express.json())
app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/messages', chatRoutes)

setupSocket(server)
redisClient.on('connect', () => { })

export { app, server }
