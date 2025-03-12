import * as jwt from 'jsonwebtoken'
import { Socket } from 'socket.io'

export const socketAuth = (socket: Socket, next: (err?: Error) => void) => {
    const token = socket.handshake.auth.token
    if (!token) return next(new Error('Authentication failed'))

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string)
        socket.data.user = decoded
        next()
    } catch (error) {
        next(new Error('Invalid token'))
    }
}
