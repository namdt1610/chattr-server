import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { handleUserEvents } from './users.socket';
import { handleChatEvents } from './chat.socket';
import { handleNotificationEvents } from './notification.socket';

export interface CustomSocket extends Socket {
      user?: { userId: string; username?: string };
}

export default function setupSocket(server: HttpServer) {
      const io = new Server(server, {
            cors: {
                  origin: 'http://localhost:3000',
                  credentials: true,
            },
      });

      io.use((socket: CustomSocket, next) => {
            const token = socket.handshake.auth.token;
            if (!token) return next(new Error('No token provided'));

            try {
                  const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
                  socket.user = { userId: decoded.userId, username: decoded.username };
                  next();
            } catch {
                  next(new Error('Invalid token'));
            }
      });

      io.on('connection', (socket: CustomSocket) => {
            console.log(`✅ Connected: ${socket.user?.username}`);

            handleUserEvents(io, socket);
            handleChatEvents(io, socket);
            handleNotificationEvents(io, socket);
      });

      console.log('🚀 Socket server initialized');
}
