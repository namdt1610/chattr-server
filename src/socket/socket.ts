import { Server, Socket } from 'socket.io'
import User from '../models/User'
import Message from '../models/Message'

interface OnlineUsers {
    [key: string]: string // userId -> socketId
}

let onlineUsers: OnlineUsers = {}

export const initSocket = (server: any) => {
    const io = new Server(server, { cors: { origin: '*' } })

    io.on('connection', (socket: Socket) => {
        console.log('User connected:', socket.id)

        socket.on('register', async (userId: string) => {
            onlineUsers[userId] = socket.id
            await User.findByIdAndUpdate(userId, { socketId: socket.id })
            console.log(`User ${userId} registered with socket ${socket.id}`)
        })

        socket.on(
            'send_message',
            async ({
                senderId,
                receiverId,
                message,
            }: {
                senderId: string
                receiverId: string
                message: string
            }) => {
                const receiverSocketId = onlineUsers[receiverId]

                if (receiverSocketId) {
                    io.to(receiverSocketId).emit('receive_message', {
                        senderId,
                        message,
                    })
                }

                await Message.create({ senderId, receiverId, message })
            }
        )

        socket.on('disconnect', async () => {
            const userId = Object.keys(onlineUsers).find(
                (key) => onlineUsers[key] === socket.id
            )
            if (userId) {
                delete onlineUsers[userId]
                await User.findByIdAndUpdate(userId, { socketId: null })
            }
            console.log('User disconnected:', socket.id)
        })
    })
}
