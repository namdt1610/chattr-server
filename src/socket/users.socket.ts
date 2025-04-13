import { Server } from 'socket.io';
import { CustomSocket } from './index';

let onlineUsers: Record<string, string> = {};

export function handleUserEvents(io: Server, socket: CustomSocket) {
      onlineUsers[socket.user!.userId] = socket.id;

      io.emit('user:online_list', Object.keys(onlineUsers));

      socket.on('disconnect', () => {
            delete onlineUsers[socket.user!.userId];
            io.emit('user:online_list', Object.keys(onlineUsers));
            console.log(`❌ Disconnected: ${socket.user?.username}`);
      });
}
