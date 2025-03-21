import User from '@/models/User'

export const getAllUsers = async () => {
    const users = await User.find()
    return users
}

export const getUserByUsername = async (query: string) => {
    const users = await User.find({
        username: { $regex: query, $options: 'i' },
    })
    return users
}
