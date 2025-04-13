import { Server } from 'socket.io';
import { CustomSocket } from './index';

export function handleNotificationEvents(io: Server, socket: CustomSocket) {
      socket.on('notify:send', ({ to, content }) => {
            io.to(to).emit('notify:receive', { from: socket.user?.userId, content });
      });
}
