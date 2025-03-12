import { Request, Response } from 'express'
import { getAllUsers, getUserByUsername } from '@/services/userService'

export const getAll = async (req: Request, res: Response) => {
    try {
        const users = await getAllUsers()
        res.status(200).json(users)
    } catch (error: any) {
        res.status(500).json({
            message: error.message || 'Internal server error',
        })
        return
    }
}

export const searchUserByUsername = async (
    req: Request,
    res: Response
): Promise<void> => {
    const { username } = req.params
    try {
        const users = await getUserByUsername(username)
        if (!users) {
            res.status(404).json({ message: 'User not found' })
            return
        }
        res.status(200).json(users)
    } catch (error: any) {
        res.status(500).json({
            message: error.message || 'Internal server error',
        })
        return
    }
}
