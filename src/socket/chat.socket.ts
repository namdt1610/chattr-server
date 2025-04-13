import { Server } from 'socket.io';
import { CustomSocket } from './index';

export function handleChatEvents(io: Server, socket: CustomSocket) {
      socket.on('chat:join_room', (conversationId) => {
            socket.join(conversationId);
            console.log(`✅ User ${socket.user?.username} has join room ${conversationId}!`);
      });

      socket.on('chat:typing', ({ conversationId, isTyping }) => {
            socket.to(conversationId).emit('chat:typing', { userId: socket.user?.userId, isTyping });
            console.log(`💬 ${socket.user?.username} is typing...`)
      })

      socket.on('chat:seen', ({ conversationId }) => {
            socket.to(conversationId).emit('chat:seen', { userId: socket.user?.userId });
            console.log(`👀 ${socket.user?.username} has seen the message!`)
      });

      socket.on('chat:private_message', ({ conversationId, receiver, message }) => {
            io.to(conversationId).emit('chat:private_message', { from: socket.user?.username, receiver, message });
            console.log(`💌 ${socket.user?.username} -> ${conversationId}: ${message}`);
      });
}
