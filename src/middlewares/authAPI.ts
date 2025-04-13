import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Mở rộng interface Request để có thể chứa thông tin user
declare global {
      namespace Express {
            interface Request {
                  user?: {
                        id: string;
                        username: string;
                        role?: string;
                  };
            }
      }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
      try {
            const authHeader = req.headers.authorization;

            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                  res.status(401).json({ success: false, message: 'Unauthorized, token required' });
                  return
            }

            const token = authHeader.split(' ')[1];

            const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;

            // Lưu thông tin user vào request để sử dụng trong controllers
            req.user = {
                  id: decoded.userId,
                  username: decoded.username,
                  role: decoded.role
            };

            next();
      } catch (error) {
            res.status(401).json({ success: false, message: 'Invalid token' });
            return
      }
}