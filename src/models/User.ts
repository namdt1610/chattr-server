import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    socketId: { type: String, default: null },
})

export default mongoose.model('User', UserSchema)
