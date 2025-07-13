import express from 'express'
import { createServer } from 'http'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import connectDB from './config/db'
import authRoutes from './routes/authRoutes'
import userRoutes from './routes/userRoutes'
import chatRoutes from './routes/messageRoutes'
import setupSocket from './socket'

const app = express()
const server = createServer(app)

connectDB()

const corsOptions = {
    origin:
        process.env.NODE_ENV === 'production'
            ? ['https://chattr-namdt1610s-projects.vercel.app']
            : ['http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
}

app.use(cors(corsOptions))
app.use(express.json())
app.use(cookieParser())

app.get('/', (req, res) => {
    res.send('Your Chattr is running, wish you a good day!')
})
app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/messages', chatRoutes)

setupSocket(server)

export { app, server }
