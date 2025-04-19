# Tài liệu hướng dẫn Ứng dụng Chat

## Giới thiệu

Ứng dụng Chat là một nền tảng nhắn tin trực tuyến có khả năng giao tiếp thời gian thực, được phát triển với mô hình kiến trúc client-server. Ứng dụng cho phép người dùng đăng ký, đăng nhập, tìm kiếm người dùng khác và trao đổi tin nhắn kèm theo tệp đính kèm.

## Cấu trúc dự án

Dự án được chia thành hai phần chính:

### 1. Frontend (chatapp.frontend)
- Xây dựng với Next.js và TypeScript
- Sử dụng Tailwind CSS cho giao diện người dùng
- Framer Motion cho hiệu ứng động
- Socket.io Client cho kết nối thời gian thực

### 2. Backend (chatapp.backend)
- Node.js với Express.js và TypeScript
- MongoDB làm cơ sở dữ liệu
- Socket.io cho giao tiếp thời gian thực
- JWT cho xác thực
- Redis cho quản lý phiên
- Multer cho xử lý tệp đính kèm

## Cài đặt và Khởi chạy

### Backend

1. Di chuyển đến thư mục backend:
```bash
cd chatapp.backend
```

2. Cài đặt các thư viện phụ thuộc:
```bash
npm install
```

3. Cấu hình môi trường:
   - Tạo file .env hoặc sử dụng file hiện có với các thiết lập:
     ```
     MONGO_URI=mongodb+srv://your_username:your_password@cluster.mongodb.net/chat_app
     JWT_SECRET=your_secret_key
     PORT=5050
     REDIS_HOST=localhost
     REDIS_PORT=6379
     REDIS_PASSWORD=
     ACCESS_TOKEN_EXPIRY=15m
     REFRESH_TOKEN_EXPIRY=7d
     ```

4. Khởi chạy server:
```bash
npm run dev
```

### Frontend

1. Di chuyển đến thư mục frontend:
```bash
cd chatapp.frontend
```

2. Cài đặt các thư viện phụ thuộc:
```bash
npm install
```

3. Khởi chạy ứng dụng:
```bash
npm run dev
```

4. Truy cập ứng dụng tại địa chỉ [http://localhost:3000](http://localhost:3000)

## Tính năng chính

### Xác thực người dùng
- Đăng ký tài khoản
- Đăng nhập
- Đăng xuất
- Quản lý phiên làm việc (sử dụng Access và Refresh Token)

### Chat và nhắn tin
- Tìm kiếm người dùng
- Gửi tin nhắn văn bản
- Gửi tệp đính kèm (hình ảnh và các loại tệp khác)
- Hiển thị trạng thái trực tuyến của người dùng
- Xem lịch sử tin nhắn
- Hiển thị thông báo "đang nhập" và "đã xem"

### Giao diện người dùng
- Chế độ giao diện cổ điển và beta
- Giao diện đáp ứng (responsive) cho cả thiết bị di động và máy tính
- Hiển thị trạng thái kết nối
- Console Log để theo dõi hoạt động của ứng dụng

## Cấu trúc API Backend

### Quản lý người dùng
- `POST /api/auth/register` - Đăng ký tài khoản
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/logout` - Đăng xuất
- `GET /api/auth/me` - Lấy thông tin người dùng hiện tại
- `GET /api/users` - Lấy danh sách người dùng
- `GET /api/users/:username` - Tìm người dùng theo tên

### Quản lý tin nhắn
- `POST /api/messages/send` - Gửi tin nhắn
- `GET /api/messages/history` - Lấy lịch sử tin nhắn
- `GET /api/users/:userId/recent-chats` - Lấy danh sách cuộc trò chuyện gần đây

## Mô hình dữ liệu

### User
- _id: String
- username: String
- password: String
- socketId: String (nullable)

### Message
- senderId: String (liên kết đến User)
- receiverId: String (liên kết đến User)
- conversationId: String
- content: String
- createdAt: Date
- attachments: String[]

### Conversation
- conversationId: String (dạng "userA_userB")
- participants: ObjectId[] (liên kết đến User)
- lastMessage: String
- updatedAt: Date
- createdAt: Date

### RefreshToken
- userId: ObjectId (liên kết đến User)
- token: String
- isRevoked: Boolean
- expiresAt: Date
- createdAt: Date
- updatedAt: Date

## Socket.io Events

### Server-to-Client
- `user:online_list` - Cập nhật danh sách người dùng trực tuyến
- `chat:message` - Nhận tin nhắn chung
- `chat:private_message` - Nhận tin nhắn riêng
- `typing` - Thông báo người dùng đang nhập
- `seen` - Thông báo tin nhắn đã xem
- `notify:receive` - Nhận thông báo

### Client-to-Server
- `chat:message` - Gửi tin nhắn chung
- `chat:private_message` - Gửi tin nhắn riêng
- `typing` - Thông báo đang nhập
- `seen` - Đánh dấu đã xem
- `notify:send` - Gửi thông báo
- `disconnect` - Ngắt kết nối

## Các công nghệ chính

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS, Framer Motion, axios
- **Backend**: Node.js, Express, TypeScript, MongoDB, Mongoose
- **Thời gian thực**: Socket.io
- **Xác thực**: JWT (JSON Web Tokens)
- **Cơ sở dữ liệu**: MongoDB
- **Bộ nhớ cache**: Redis
- **Tệp đính kèm**: Multer
- **Kiểm thử**: Jest, Supertest

## Phát triển và mở rộng

Để mở rộng dự án, bạn có thể tập trung vào các lĩnh vực sau:

1. **Tính năng bổ sung**:
   - Gửi tin nhắn audio và video
   - Tạo nhóm trò chuyện
   - Thêm chức năng gọi video

2. **Cải thiện hiệu suất**:
   - Tối ưu hóa truy vấn cơ sở dữ liệu
   - Thêm phân trang cho lịch sử tin nhắn

3. **Bảo mật**:
   - Mã hóa đầu cuối cho tin nhắn
   - Xác thực hai yếu tố

## Giải quyết sự cố

### Vấn đề kết nối Socket
- Kiểm tra xem backend có đang chạy không
- Kiểm tra cài đặt CORS trong backend
- Kiểm tra token xác thực

### Vấn đề xác thực
- Kiểm tra thời hạn token
- Xóa cache trình duyệt và thử đăng nhập lại

### Vấn đề tệp đính kèm
- Kiểm tra thư mục uploads có tồn tại và có quyền ghi trong backend
- Kiểm tra kích thước tệp không vượt quá giới hạn cấu hình

## Tài liệu tham khảo

- [Next.js Documentation](https://nextjs.org/docs)
- [Socket.io Documentation](https://socket.io/docs/v4)
- [MongoDB Documentation](https://docs.mongodb.com)
- [Express.js Documentation](https://expressjs.com)
- [JWT.io](https://jwt.io)

---

© 2025 ChatApp. Tất cả các quyền được bảo lưu.