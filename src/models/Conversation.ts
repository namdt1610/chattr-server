import { Schema, model, Document } from "mongoose";

interface IConversation extends Document {
  conversationId: string; // ví dụ: "userA_userB" (sort().join('_'))
  participants: Schema.Types.ObjectId[]; // [userA_id, userB_id]
  lastMessage: string;
  updatedAt: Date;
  createdAt: Date;
}

const conversationSchema = new Schema<IConversation>({
  conversationId: { type: String, required: true, unique: true },
  participants: [{ type: Schema.Types.ObjectId, ref: "User", required: true }],
  lastMessage: { type: String, default: "" },
  updatedAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
});

const Conversation = model<IConversation>("Conversation", conversationSchema);
export { Conversation, IConversation };
