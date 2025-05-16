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

    const access_token = jwt.sign(
        { userId: user._id, username: user.username },
        process.env.JWT_SECRET as string,
        {
            expiresIn: '15m', // Short lived access token
        }
    )

    const refresh_token = jwt.sign(
        { userId: user._id },
        (process.env.JWT_REFRESH_SECRET as string) ||
            (process.env.JWT_SECRET as string),
        {
            expiresIn: '7d', // Longer lived refresh token
        }
    )

    return { access_token, refresh_token }
}
