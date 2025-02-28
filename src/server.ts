import express, { Application } from 'express'
import cors from 'cors'
import connectDB from './config/db'
import authRoutes from './routes/authRoutes'
import messageRoutes from './routes/msgRoutes'
import { createServer } from 'http'

const app: Application = express()
const server = createServer(app)

connectDB()
app.use(cors())
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/messages', messageRoutes)

export { app, server }
