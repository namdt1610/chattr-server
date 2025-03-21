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
        senderUsername: string,
        receiverUsername: string,
        content: string
    ): Promise<IMessage> {
        const senderId = await this.getUserIdByUsername(senderUsername)
        const receiverId = await this.getUserIdByUsername(receiverUsername)
        console.log(senderId, receiverId, content)
        const message = new Message({
            senderId,
            receiverId,
            content,
        })
        return await message.save()
    }

    // Lấy lịch sử tin nhắn giữa 2 người
    async getMessageHistory(
        senderUsername: string,
        receiverUsername: string
    ): Promise<IMessage[]> {
        const senderId = await this.getUserIdByUsername(senderUsername)
        const receiverId = await this.getUserIdByUsername(receiverUsername)

        const data = await Message.find({
            $or: [
                { senderId, receiverId },
                { senderId: receiverId, receiverId: senderId },
            ],
        })
            .populate('senderId', 'username')
            .populate('receiverId', 'username')
            .sort({ createdAt: 1 })
        // console.log(data)
        return data
    }
}

export default new MessageService()
