import { Server as HttpServer } from 'http'
import { Server, Socket } from 'socket.io'
import jwt, { JwtPayload } from 'jsonwebtoken'

interface CustomSocket extends Socket {
    user?: {
        userId: string
        username?: string
        [key: string]: any
    }
}

let users: { [username: string]: string } = {} // Lưu socketId theo username

export default function setupSocket(server: HttpServer) {
    const io = new Server(server, {
        cors: {
            origin: 'http://localhost:3000',
            methods: ['GET', 'POST'],
            credentials: true,
        },
    })

    io.on('connection', (socket: CustomSocket) => {
        console.log('New client connected:', socket.id)

        const token = socket.handshake.auth.token

        if (!token) {
            socket.disconnect()
            return
        }

        try {
            console.log('Raw Token:', token)
            const decoded = jwt.verify(
                token,
                process.env.JWT_SECRET as string
            ) as JwtPayload

            if (decoded && typeof decoded.userId === 'string') {
                socket.user = {
                    userId: decoded.userId,
                    username: decoded.username || `User_${decoded.userId}`,
                }

                socket.join(socket.user.userId)
                console.log(
                    `${socket.user.username} joined private room: ${socket.user.userId}`
                )
            } else {
                socket.disconnect()
            }
        } catch (err) {
            console.log('JWT Error:', err)
            socket.disconnect()
        }

        // Lắng nghe khi người dùng đăng nhập (kết nối)
        socket.on('login', (username: string) => {
            console.log(`${username} logged in via WebSocket`)
            users[username] = socket.id

            io.emit(
                'user_list',
                Object.keys(users).map((username) => ({ username }))
            )
        })

        // Lắng nghe tin nhắn riêng tư
        socket.on('private_message', ({ to, message }) => {
            console.log(`📨 Server nhận tin nhắn từ ${socket.user?.username} gửi đến ${to}: ${message}`)
            if (!socket.user) {
                console.log('⚠️ User not authenticated. Message not sent.')
                return
            }

            const toSocketId = users[to] // Lấy socketId của người nhận
            if (toSocketId) {
                io.to(toSocketId).emit('private_message', {
                    from: socket.user.username,
                    message,
                })
            }
        })

        socket.on('message', (message) => {
            io.emit('message', message)
        })

        // Ngắt kết nối - loại bỏ socket khỏi danh sách
        socket.on('disconnect', () => {
            // Xóa người dùng khỏi danh sách khi ngắt kết nối
            if (socket.user?.username) {
                delete users[socket.user.username]
                io.emit(
                    'user_list',
                    Object.keys(users).map((username) => ({ username }))
                )
            }
        })
    })

    console.log('Socket.io connected')
}
