import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

const connectDB = async () => {
    const mongo_uri = process.env.MONGO_URI
    if (!mongo_uri) {
        throw new Error('MONGO_URI environment variable is not defined')
    }
    try {
        await mongoose.connect(mongo_uri)
        console.log('MongoDB connected')
    } catch (error) {
        console.error('MongoDB connection error:', error)
        process.exit(1)
    }
}

export default connectDB
