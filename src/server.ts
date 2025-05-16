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
    origin: [
        'http://localhost:3000',
        'https://chattr-namdt1610s-projects.vercel.app',
    ],
    methods: ['GET', 'POST'],
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
