import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import User from '../models/User'

// Interface mở rộng Request để có trường user
interface AuthRequest extends Request {
    user?: {
        userId: string
        username: string
    }
}

/**
 * Middleware bảo vệ API - xác thực JWT trước khi cho phép truy cập
 */
export const protect = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    let token

    // 1. Lấy token từ headers hoặc cookies
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        // Lấy token từ Authorization header (Bearer token)
        token = req.headers.authorization.split(' ')[1]
    } else if (req.cookies?.jwt) {
        // Hoặc lấy từ cookies nếu có
        token = req.cookies.jwt
    }

    // 2. Kiểm tra xem token có tồn tại không
    if (!token) {
        res.status(401).json({
            success: false,
            message: 'Không được phép truy cập, vui lòng đăng nhập',
        })
        return
    }

    try {
        // 3. Xác minh token
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
            userId: string
            username: string
        }

        // 4. Kiểm tra nếu người dùng vẫn tồn tại
        const currentUser = await User.findById(decoded.userId)

        if (!currentUser) {
            res.status(401).json({
                success: false,
                message: 'Người dùng của token này không còn tồn tại',
            })
            return
        }

        // 5. Lưu thông tin người dùng vào request để sử dụng trong các route handler
        req.user = {
            userId: decoded.userId,
            username: decoded.username,
        }

        // Cho phép request tiếp tục
        next()
    } catch (error) {
        res.status(401).json({
            success: false,
            message: 'Token không hợp lệ hoặc đã hết hạn',
            error: error instanceof Error ? error.message : String(error),
        })
        return
    }
}

/**
 * Middleware dành cho admin (có thể mở rộng sau này)
 * Hiện tại chưa có trường role trong model User, nhưng có thể thêm vào sau
 * Chú ý: Bạn cần thêm trường role vào model User nếu muốn sử dụng middleware này
 */
export const restrictToAdmin = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    // Đảm bảo đã chạy middleware protect trước
    if (!req.user) {
        res.status(401).json({
            success: false,
            message: 'Vui lòng đăng nhập trước',
        })
    }

    // Kiểm tra nếu người dùng là admin (giả định username 'admin')
    // Đây chỉ là logic tạm thời, nên thêm trường role vào model User cho mục đích sản xuất
    if (req.user?.username === 'admin') {
        next()
    } else {
        res.status(403).json({
            success: false,
            message: 'Bạn không có quyền admin để thực hiện hành động này',
        })
    }
}

/**
 * Middleware chỉ cho phép chủ sở hữu tài nguyên truy cập
 * @param resourceModel Model của tài nguyên cần bảo vệ (Message, Post, etc)
 * @param resourceIdParam Tên tham số chứa ID của tài nguyên trong request
 */
export const restrictToOwner = (
    resourceModel: any,
    resourceIdParam: string = 'id'
): ((req: AuthRequest, res: Response, next: NextFunction) => Promise<void>) => {
    return async (req: AuthRequest, res: Response, next: NextFunction) => {
        // Đảm bảo đã chạy middleware protect trước
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Vui lòng đăng nhập trước',
            })
            return
        }

        // Lấy ID của tài nguyên từ params hoặc body
        const resourceId =
            req.params[resourceIdParam] || req.body[resourceIdParam]

        if (!resourceId) {
            res.status(400).json({
                success: false,
                message: `Không tìm thấy ID tài nguyên (${resourceIdParam})`,
            })
            return
        }

        try {
            // Tìm tài nguyên theo ID
            const resource = await resourceModel.findById(resourceId)

            if (!resource) {
                res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy tài nguyên',
                })
                return
            }

            // Kiểm tra nếu userId trong tài nguyên khớp với userId của người dùng hiện tại
            // Lưu ý: Điều này giả sử tài nguyên có trường 'userId' hoặc 'user'
            // Điều chỉnh logic này dựa trên mô hình dữ liệu thực tế của bạn
            const resourceUserId =
                resource.userId ||
                (resource.user &&
                    (typeof resource.user === 'object'
                        ? resource.user._id || resource.user.id
                        : resource.user))

            if (
                resourceUserId &&
                resourceUserId.toString() === req.user.userId
            ) {
                next()
            } else {
                res.status(403).json({
                    success: false,
                    message: 'Bạn không có quyền truy cập tài nguyên này',
                })
            }
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Lỗi khi xác minh quyền sở hữu',
                error: error instanceof Error ? error.message : String(error),
            })
        }
    }
}

// Rate limiting để tránh tấn công brute force
export const rateLimit = (
    windowMs: number = 15 * 60 * 1000, // 15 phút mặc định
    maxRequests: number = 100 // 100 requests mặc định
) => {
    const requestCounts = new Map<
        string,
        { count: number; resetTime: number }
    >()

    return (req: Request, res: Response, next: NextFunction) => {
        // Sử dụng IP để xác định client
        const clientIp = req.ip || req.socket.remoteAddress || 'unknown'
        const now = Date.now()

        // Lấy hoặc tạo thông tin rate limit cho IP
        if (!requestCounts.has(clientIp)) {
            requestCounts.set(clientIp, {
                count: 0,
                resetTime: now + windowMs,
            })
        }

        const clientData = requestCounts.get(clientIp)!

        // Reset counter nếu đã hết thời gian
        if (now > clientData.resetTime) {
            clientData.count = 0
            clientData.resetTime = now + windowMs
        }

        // Tăng counter
        clientData.count++

        // Thiết lập headers để client biết giới hạn
        res.setHeader('X-RateLimit-Limit', maxRequests)
        res.setHeader(
            'X-RateLimit-Remaining',
            Math.max(0, maxRequests - clientData.count)
        )
        res.setHeader('X-RateLimit-Reset', clientData.resetTime)

        // Kiểm tra nếu đã vượt quá giới hạn
        if (clientData.count > maxRequests) {
            return res.status(429).json({
                success: false,
                message: 'Quá nhiều yêu cầu, vui lòng thử lại sau',
            })
        }

        next()
    }
}
