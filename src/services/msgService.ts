import Message from '@/models/Message'

interface SendMsgProps {
    senderId: string | undefined
    receiverId: string | undefined
    message: string
}

interface GetMsgProps {
    userId1: string
    userId2: string
}

export const sendMessage = async ({
    senderId,
    receiverId,
    message,
}: SendMsgProps) => {
    return await Message.create({ senderId, receiverId, message })
}

export const getMessages = async (userId1: string, userId2: string) => {
    return await Message.find({
        $or: [
            { senderId: userId1, receiverId: userId2 },
            { senderId: userId2, receiverId: userId1 },
        ],
    }).sort({ timestamp: 1 })
}
