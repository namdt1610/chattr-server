import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 phút
      max: 100, // Giới hạn 100 request cho mỗi IP trong 15 phút
      message: 'Too many requests from this IP, please try again later.',
});

export default limiter;