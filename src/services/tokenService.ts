import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import redisClient from '../config/redis';
import RefreshToken from '../models/RefreshToken';
import { Types } from 'mongoose';

class TokenService {
  // Tạo Access Token
  generateAccessToken(userId: string, username: string): string {
    const payload = { userId, username };
    const secret: jwt.Secret = process.env.JWT_SECRET as string;
    const options: jwt.SignOptions = { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '15m' } as jwt.SignOptions;

    return jwt.sign(payload, secret, options);
  }

  // Tạo Refresh Token và lưu vào DB
  async generateRefreshToken(userId: string): Promise<string> {
    // Tạo token ngẫu nhiên
    const refreshToken = uuidv4();

    // Tính thời gian hết hạn
    const expiryDays = parseInt(process.env.REFRESH_TOKEN_EXPIRY || '7');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiryDays);

    // Lưu vào MongoDB
    await RefreshToken.create({
      userId: new Types.ObjectId(userId),
      token: refreshToken,
      expiresAt,
      isRevoked: false
    });

    // Lưu vào Redis với expiry
    await redisClient.set(
      `refresh_token:${refreshToken}`,
      userId,
      'EX',
      60 * 60 * 24 * expiryDays // 7 ngày tính bằng giây
    );

    return refreshToken;
  }

  // Verify refresh token
  async verifyRefreshToken(refreshToken: string): Promise<{ userId: string } | null> {
    // Kiểm tra trong Redis (nhanh)
    const userId = await redisClient.get(`refresh_token:${refreshToken}`);

    if (!userId) {
      // Nếu không có trong Redis, kiểm tra DB
      const tokenDoc = await RefreshToken.findOne({
        token: refreshToken,
        isRevoked: false,
        expiresAt: { $gt: new Date() }
      });

      if (!tokenDoc) {
        return null;
      }

      // Nếu tồn tại trong DB nhưng không có trong Redis, thêm lại vào Redis
      const expirySeconds = Math.floor(
        (tokenDoc.expiresAt.getTime() - new Date().getTime()) / 1000
      );

      if (expirySeconds > 0) {
        await redisClient.set(
          `refresh_token:${refreshToken}`,
          tokenDoc.userId.toString(),
          'EX',
          expirySeconds
        );
      }

      return { userId: tokenDoc.userId.toString() };
    }

    return { userId };
  }

  // Revoke refresh token
  async revokeRefreshToken(refreshToken: string): Promise<boolean> {
    // Xóa khỏi Redis
    await redisClient.del(`refresh_token:${refreshToken}`);

    // Cập nhật trạng thái trong DB
    const result = await RefreshToken.updateOne(
      { token: refreshToken },
      { isRevoked: true, updatedAt: new Date() }
    );

    return result.modifiedCount > 0;
  }

  // Revoke tất cả refresh token của userId
  async revokeAllUserTokens(userId: string): Promise<boolean> {
    // Lấy danh sách token từ DB
    const tokens = await RefreshToken.find({
      userId: new Types.ObjectId(userId),
      isRevoked: false
    });

    // Xóa khỏi Redis
    const pipeline = redisClient.pipeline();
    tokens.forEach(token => {
      pipeline.del(`refresh_token:${token.token}`);
    });
    await pipeline.exec();

    // Đánh dấu revoked trong DB
    const result = await RefreshToken.updateMany(
      { userId: new Types.ObjectId(userId), isRevoked: false },
      { isRevoked: true, updatedAt: new Date() }
    );

    return result.modifiedCount > 0;
  }

  // Dọn dẹp token hết hạn (có thể chạy định kỳ)
  async cleanupExpiredTokens(): Promise<void> {
    await RefreshToken.deleteMany({
      expiresAt: { $lt: new Date() }
    });
  }
}

export default new TokenService();