# Sửa lỗi Deploy trên Render

## Vấn đề
Khi deploy backend trên Render, gặp lỗi:
```
Error [ERR_MODULE_NOT_FOUND]: Cannot find package 'tsx' imported from /opt/render/project/src/
```

## Nguyên nhân
1. **tsx trong devDependencies**: `tsx` đang ở trong `devDependencies` nhưng script `start` cần nó trong production
2. **Module system conflict**: `tsconfig.json` sử dụng CommonJS nhưng `package.json` có `"type": "module"`
3. **Script start không phù hợp**: Script start sử dụng `node --import tsx` không hoạt động đúng

## Giải pháp đã áp dụng

### 1. Cập nhật package.json
```json
{
    "scripts": {
        "dev": "nodemon --ext ts --exec tsx src/index.ts",
        "start": "tsx src/index.ts",
        "build": "tsc",
        "start:prod": "node dist/index.js"
    },
    "dependencies": {
        // ... other dependencies
        "tsx": "^4.19.2"
    },
    "devDependencies": {
        // ... other devDependencies
        // tsx moved to dependencies
    }
}
```

### 2. Cập nhật tsconfig.json
```json
{
    "compilerOptions": {
        "target": "ES2020",
        "module": "ESNext",
        "moduleResolution": "node",
        "baseUrl": "./",
        "paths": {
            "@/*": ["src/*"]
        },
        "esModuleInterop": true,
        "allowSyntheticDefaultImports": true,
        "forceConsistentCasingInFileNames": true,
        "strict": true,
        "skipLibCheck": true,
        "outDir": "./dist",
        "rootDir": "./src",
        "resolveJsonModule": true,
        "declaration": true,
        "sourceMap": true
    },
    "include": ["src/**/*"],
    "exclude": ["node_modules", "dist"]
}
```

## Các thay đổi chính

### 1. Di chuyển tsx từ devDependencies sang dependencies
- **Lý do**: Script `start` cần `tsx` trong production
- **Thay đổi**: `tsx` được di chuyển từ `devDependencies` sang `dependencies`

### 2. Cập nhật script start
- **Trước**: `"start": "node --import tsx src/index.ts"`
- **Sau**: `"start": "tsx src/index.ts"`
- **Lý do**: Sử dụng `tsx` trực tiếp thay vì `node --import`

### 3. Thêm script build và start:prod
- **build**: `"build": "tsc"` - Compile TypeScript sang JavaScript
- **start:prod**: `"start:prod": "node dist/index.js"` - Chạy compiled JavaScript

### 4. Cập nhật tsconfig.json cho ES modules
- **module**: `"ESNext"` thay vì `"commonjs"`
- **target**: `"ES2020"` cho modern JavaScript features
- **outDir**: `"./dist"` để output compiled files
- **rootDir**: `"./src"` để chỉ định source directory

## Cấu hình Render

### Build Command
```bash
npm install && npm run build
```

### Start Command
```bash
npm start
```

### Environment Variables
Đảm bảo set các environment variables cần thiết:
```bash
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
PORT=10000
NODE_ENV=production
```

## Kiểm tra sau khi deploy

### 1. Kiểm tra logs
- Xem logs trong Render dashboard
- Đảm bảo không có lỗi TypeScript compilation
- Kiểm tra server có start thành công không

### 2. Test API endpoints
- Test health check endpoint: `GET /`
- Test các API endpoints khác
- Kiểm tra CORS configuration

### 3. Kiểm tra database connection
- Đảm bảo MongoDB connection string đúng
- Kiểm tra database có accessible không

## Alternative Solutions

### Option 1: Sử dụng compiled JavaScript
```json
{
    "scripts": {
        "build": "tsc",
        "start": "node dist/index.js"
    }
}
```

### Option 2: Sử dụng ts-node
```json
{
    "scripts": {
        "start": "ts-node src/index.ts"
    },
    "dependencies": {
        "ts-node": "^10.9.2"
    }
}
```

### Option 3: Sử dụng esbuild
```json
{
    "scripts": {
        "build": "esbuild src/index.ts --bundle --platform=node --outfile=dist/index.js",
        "start": "node dist/index.js"
    },
    "dependencies": {
        "esbuild": "^0.19.0"
    }
}
```

## Lưu ý quan trọng

1. **ES Modules**: Đảm bảo tất cả imports sử dụng ES module syntax
2. **File extensions**: Có thể cần thêm `.js` extensions cho imports
3. **Path mapping**: Đảm bảo `@/*` paths hoạt động đúng
4. **Environment variables**: Set đúng trong Render dashboard
5. **Port**: Render sử dụng port từ `PORT` environment variable

## Troubleshooting

### Lỗi "Cannot find module"
- Kiểm tra `node_modules` có được install đúng không
- Đảm bảo dependencies được list đúng trong `package.json`

### Lỗi "Module not found"
- Kiểm tra import paths có đúng không
- Đảm bảo file extensions được specify đúng

### Lỗi "Port already in use"
- Đảm bảo sử dụng `process.env.PORT` thay vì hardcode port
- Kiểm tra port configuration trong Render 