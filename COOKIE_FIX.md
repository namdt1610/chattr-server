# Sửa lỗi Cookie khi Deploy trên Vercel

## Vấn đề
Khi deploy ứng dụng trên Vercel, token không được set trên cookie sau khi login.

## Nguyên nhân
1. **Cấu hình CORS không đúng**: Socket.io và Express server có cấu hình CORS khác nhau
2. **Cookie domain không phù hợp**: Domain `.vercel.app` quá rộng và có thể gây vấn đề
3. **SameSite policy**: Cần cấu hình đúng cho cross-origin requests

## Giải pháp đã áp dụng

### 1. Cập nhật cấu hình Cookie
- Tạo file `src/config/cookieConfig.ts` để quản lý cấu hình cookie tập trung
- Loại bỏ domain setting để tránh vấn đề cross-domain
- Cấu hình `sameSite` và `secure` dựa trên môi trường

### 2. Cập nhật CORS Configuration
- **Server.ts**: Cấu hình CORS cho Express server
- **Socket.ts**: Cấu hình CORS cho Socket.io
- Thêm các headers cần thiết: `Content-Type`, `Authorization`

### 3. Cấu hình Cookie Options
```typescript
const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 15 * 60 * 1000, // 15 minutes
    // Không set domain để tránh vấn đề cross-domain
}
```

## Kiểm tra và Debug

### 1. Kiểm tra trong Browser DevTools
- Mở DevTools > Application > Cookies
- Kiểm tra xem cookie có được set không
- Kiểm tra domain, path, và các thuộc tính khác

### 2. Kiểm tra Network Tab
- Xem response headers từ login request
- Kiểm tra `Set-Cookie` header có được gửi không
- Kiểm tra CORS headers

### 3. Kiểm tra Console
- Xem có lỗi CORS không
- Xem có lỗi cookie-related không

## Các bước tiếp theo nếu vẫn có vấn đề

### 1. Kiểm tra Environment Variables
```bash
# Đảm bảo NODE_ENV được set đúng
NODE_ENV=production
```

### 2. Kiểm tra Vercel Configuration
- Đảm bảo domain được cấu hình đúng trong Vercel
- Kiểm tra environment variables trong Vercel dashboard

### 3. Test với Postman/Insomnia
- Test API endpoints trực tiếp
- Kiểm tra response headers
- Verify cookie behavior

### 4. Alternative Solutions
Nếu vẫn không hoạt động, có thể thử:
1. Sử dụng localStorage thay vì cookies
2. Implement token refresh mechanism
3. Sử dụng session-based authentication

## Lưu ý quan trọng
- Cookies với `sameSite: 'none'` yêu cầu `secure: true`
- Cross-origin requests cần `credentials: 'include'` ở client
- Vercel có thể có các hạn chế về cookie domain 