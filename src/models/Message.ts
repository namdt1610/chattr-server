import { Schema, model, Document } from 'mongoose'

interface IMessage extends Document {
    senderId: String
    receiverId: String
    conversationId: String
    content: string
    createdAt: Date
}

const messageSchema = new Schema<IMessage>({
    senderId: { type: String, ref: 'User', required: true },
    receiverId: { type: String, ref: 'User', required: true },
    conversationId: { type: String, ref: 'Conversation', required: true },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
})

const Message = model<IMessage>('Message', messageSchema)

export { Message, IMessage }
