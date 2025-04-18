import { Schema, model, Document } from "mongoose";

interface IUser extends Document {
  _id: string;
  username: string;
  password: string;
  socketId: string | null;
}

const userSchema = new Schema<IUser>({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  socketId: { type: String, default: null },
});

const User = model<IUser>("User", userSchema);
export { User, IUser };
