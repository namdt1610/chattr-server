import { Request, Response } from 'express'
import { registerUser, loginUser, refreshTokens, logout, logoutAll } from '@/services/authService'

export const register = async (req: Request, res: Response): Promise<void> => {
    try {
        const { username, password, email } = req.body

        if (!username || !password) {
            res.status(400).json({
                message: 'Username and password are required',
            })
            return
        }

        const auth = await registerUser({ username, password, email })

        res.status(201).json({
            message: 'User registered successfully',
            accessToken: auth.accessToken,
            refreshToken: auth.refreshToken,
            user: auth.user
        })
    } catch (error: any) {
        res.status(500).json({
            message: error.message || 'Internal server error',
        })
    }
}

export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { username, password } = req.body

        if (!username || !password) {
            res.status(400).json({
                message: 'Username and password are required',
            })
            return
        }

        const auth = await loginUser({ username, password })
        res.cookie('refreshToken', auth.refreshToken, {
            expires: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // Set to true in production
            sameSite: 'strict',
        })


        res.status(200).json({
            message: 'Login successful',
            accessToken: auth.accessToken,
            refreshToken: auth.refreshToken,
            user: auth.user
        })
    } catch (error: any) {
        res.status(401).json({
            message: error.message || 'Invalid credentials',
        })
    }
}

export const refresh = async (req: Request, res: Response): Promise<void> => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            res.status(400).json({ message: 'Refresh token is required' });
            return
        }

        const result = await refreshTokens(refreshToken);

        if (!result) {
            res.status(401).json({ message: 'Invalid or expired refresh token' });
            return
        }

        res.status(200).json({
            accessToken: result.accessToken,
            refreshToken: result.refreshToken,
            user: result.user
        });
    } catch (error: any) {
        res.status(500).json({
            message: error.message || 'Error refreshing token',
        });
    }
};

export const logoutUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { refreshToken } = req.cookies;
        console.log('Refresh token from cookies:', refreshToken);

        if (!refreshToken) {
            res.status(400).json({ message: 'Refresh token is required' });
            return
        }

        const success = await logout(refreshToken);

        if (!success) {
            res.status(400).json({ message: 'Invalid token or already logged out' });
            return
        }

        res.status(200).json({ message: 'Logged out successfully' });
    } catch (error: any) {
        res.status(500).json({
            message: error.message || 'Error logging out',
        });
    }
};

export const logoutAllDevices = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user || !req.user.id) {
            res.status(401).json({ message: 'Unauthorized' });
            return
        }

        const success = await logoutAll(req.user.id);

        if (!success) {
            res.status(400).json({ message: 'Error logging out all devices' });
            return
        }

        res.status(200).json({ message: 'Logged out from all devices successfully' });
    } catch (error: any) {
        res.status(500).json({
            message: error.message || 'Error logging out from all devices',
        });
    }
};

export const me = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        // Trả về thông tin user
        res.status(200).json({
            user: {
                _id: req.user.id,
                username: req.user.username,
                role: req.user.role || 'user',
            },
        });
    } catch (error: any) {
        res.status(401).json({
            message: 'Invalid token or expired',
        });
    }
};