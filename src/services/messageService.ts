import { IMessage, Message } from '../models/Message'
import User from '../models/User' // Giả sử bạn có model User

class MessageService {
    // Tìm ObjectId của user dựa trên username
    async getUserIdByUsername(username: string) {
        const user = await User.findOne({ username })
        if (!user) {
            throw new Error('User not found')
        }
        return user._id
    }

    // Lưu tin nhắn vào DB

    async saveMessage(
        senderId: string,
        receiverId: string,
        content: string,
        conversationId: string
    ): Promise<any> {
        try {
            // Tạo một đối tượng tin nhắn mới
            const newMessage = new Message({
                senderId,
                receiverId,
                content,
                conversationId,
                createdAt: new Date(),
            });

            // Lưu tin nhắn vào cơ sở dữ liệu
            const savedMessage = await newMessage.save();
            return savedMessage;
        } catch (error: any) {
            throw new Error('Error saving message: ' + error.message);
        }
    }

    // async saveMessage(
    //     senderUsername: string,
    //     receiverUsername: string,
    //     content: string
    // ): Promise<IMessage> {
    //     const senderId = await this.getUserIdByUsername(senderUsername)
    //     const receiverId = await this.getUserIdByUsername(receiverUsername)
    //     console.log(senderId, receiverId, content)
    //     const message = new Message({
    //         senderId,
    //         receiverId,
    //         content,
    //     })
    //     return await message.save()
    // }

    // Lấy lịch sử tin nhắn giữa 2 người

    async getMessageHistory(conversationId: string) {
        try {
            const messages = await Message.find({ conversationId })
                .sort({ createdAt: 1 }); // Lấy tin nhắn cũ -> mới

            return messages;
        } catch (error) {
            console.error(`❌ Failed to fetch messages for conversation ${conversationId}:`, error);
            throw new Error('Could not fetch message history.');
        }
    }

    // async getMessageHistory(
    //     senderUsername: string,
    //     receiverUsername: string
    // ): Promise<IMessage[]> {
    //     const senderId = await this.getUserIdByUsername(senderUsername)
    //     const receiverId = await this.getUserIdByUsername(receiverUsername)

    //     const data = await Message.find({
    //         $or: [
    //             { senderId, receiverId },
    //             { senderId: receiverId, receiverId: senderId },
    //         ],
    //     })
    //         .populate('senderId', 'username')
    //         .populate('receiverId', 'username')
    //         .sort({ createdAt: 1 })
    //     // console.log(data)
    //     return data
    // }
}

export default new MessageService()
