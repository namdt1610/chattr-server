import mongoose, { Schema, model, Document, Types } from 'mongoose'

interface IMessage extends Document {
    senderId: String
    receiverId: String
    conversationId: String
    content: String
    createdAt: String
    attachments: String[]
}

const messageSchema = new Schema<IMessage>({
    senderId: { type: Types.ObjectId, ref: 'User', required: true },
    receiverId: { type: Types.ObjectId, ref: 'User', required: true },
    conversationId: { type: String, ref: 'Conversation', required: true },
    content: { type: String},
    createdAt: { type: Date, default: Date.now },
    attachments: { type: [String], default: [] },
})

const Message = model<IMessage>('Message', messageSchema)
export { Message, IMessage }
