import { Schema, model, Document } from 'mongoose'

interface IMessage extends Document {
    senderId: Schema.Types.ObjectId
    receiverId: Schema.Types.ObjectId
    content: string
    createdAt: Date
}

const messageSchema = new Schema<IMessage>({
    senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    receiverId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
})

const Message = model<IMessage>('Message', messageSchema)

export { Message, IMessage }
