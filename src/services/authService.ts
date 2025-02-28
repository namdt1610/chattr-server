import User from '@/models/User'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

interface Props {
    username: string
    password: string
}

export const registerUser = async ({ username, password }: Props) => {
    const hashedPassword = await bcrypt.hash(password, 10)
    const user = await User.create({ username, password: hashedPassword })
    
    return {
        _id: user._id,
        username: user.username,
    }
}

export const loginUser = async ({ username, password }: Props) => {
    const user = await User.findOne({ username })
    if (!user || !(await bcrypt.compare(password, user.password))) {
        throw new Error('Invalid credentials')
    }
    const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET as string,
        {
            expiresIn: '7d',
        }
    )
    return { token, userId: user._id }
}
