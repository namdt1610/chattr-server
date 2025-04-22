import { User } from '@/models/User'
import bcrypt from 'bcryptjs'
import TokenService from './tokenService'
import EmailService from './emailService'

interface Props {
    username: string
    password: string
    email?: string
}

interface AuthResponse {
    accessToken: string
    refreshToken: string
    user: {
        _id: string
        username: string
    }
}

export const registerUser = async ({ username, password, email }: Props) => {
    const hashedPassword = await bcrypt.hash(password, 10)
    const user = await User.create({ username, password: hashedPassword })

    const accessToken = TokenService.generateAccessToken(
        user._id.toString(),
        user.username
    )
    const refreshToken = await TokenService.generateRefreshToken(
        user._id.toString()
    )

    if (email) {
        try {
            await EmailService.sendWelcomeEmail(email, username)
        } catch (error) {
            console.error('Failed to send welcome email:', error)
            // Không ảnh hưởng đến quá trình đăng ký
        }
    }

    return {
        accessToken,
        refreshToken,
        user: {
            id: user._id,
            username: user.username,
        },
    }
}

export const loginUser = async ({
    username,
    password,
}: Props): Promise<AuthResponse> => {
    const user = await User.findOne({ username })
    if (!user || !(await bcrypt.compare(password, user.password))) {
        throw new Error('Invalid credentials')
    }

    const accessToken = TokenService.generateAccessToken(
        user._id.toString(),
        user.username
    )
    const refreshToken = await TokenService.generateRefreshToken(
        user._id.toString()
    )

    return {
        accessToken,
        refreshToken,
        user: {
            _id: user._id.toString(),
            username: user.username,
        },
    }
}

export const refreshTokens = async (
    refreshToken: string
): Promise<AuthResponse | null> => {
    const result = await TokenService.verifyRefreshToken(refreshToken)

    if (!result) {
        return null
    }

    const { userId } = result

    // Lấy thông tin user
    const user = await User.findById(userId)
    if (!user) {
        return null
    }

    // Revoke token cũ
    await TokenService.revokeRefreshToken(refreshToken)

    // Tạo cặp token mới
    const accessToken = TokenService.generateAccessToken(userId, user.username)
    const newRefreshToken = await TokenService.generateRefreshToken(userId)

    return {
        accessToken,
        refreshToken: newRefreshToken,
        user: {
            _id: user._id.toString(),
            username: user.username,
        },
    }
}

export const logout = async (refreshToken: string): Promise<boolean> => {
    return TokenService.revokeRefreshToken(refreshToken)
}

export const logoutAll = async (userId: string): Promise<boolean> => {
    return TokenService.revokeAllUserTokens(userId)
}
