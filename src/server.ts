import express from 'express'
import { createServer } from 'http'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import helmet from 'helmet'
import path from 'path'

import connectDB from './config/db'
import authRoutes from './routes/authRoutes'
import userRoutes from './routes/userRoutes'
import chatRoutes from './routes/messageRoutes'
// import redisClient from './config/redis'
// import setupSocket from './config/socket.old'
import setupSocket from './socket'
import limiter from './config/limiter'

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
app.use(cookieParser())
app.use(helmet())
app.use(limiter)
app.use(
    '/uploads',
    (req, res, next) => {
        console.log('Serving file:', req.url)
        next()
    },
    express.static(path.join(__dirname, '../uploads'))
)


app.get('/', (req, res) => {
    res.send('API is running...')
})
app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/messages', chatRoutes)

setupSocket(server)
// redisClient.on('connect', () => { })

export { app, server }
