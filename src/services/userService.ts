import { User } from '@/models/User'

class UserService {
    async findById(userId: string): Promise<any> {
        try {
            const user = await User.findById(userId) // Tìm người dùng từ cơ sở dữ liệu
            return user
        } catch (error) {
            throw new Error('User not found')
        }
    }

    async findByUsername(username: string): Promise<any> {
        try {
            const user = await User.findOne({ username }) // Tìm người dùng từ cơ sở dữ liệu
            return user
        } catch (error) {
            throw new Error('User not found')
        }
    }

    async getAllUsers() {
        const users = await User.find()
        return users
    }

    async getUserByUsername(query: string) {
        const users = await User.find({
            username: { $regex: query, $options: 'i' },
        }).select('username _id')
        return users
    }
}

export default new UserService()
