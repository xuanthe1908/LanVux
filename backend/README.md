# E-Learning Backend API

Hệ thống backend cho nền tảng học trực tuyến với đầy đủ tính năng thanh toán VNPay, quản lý khóa học, AI chat, và Swagger documentation.

## 🚀 Tính năng chính

- ✅ **Xác thực & Phân quyền**: JWT authentication với refresh token
- ✅ **Quản lý khóa học**: CRUD operations cho courses, lectures, assignments
- ✅ **Đăng ký khóa học**: Enrollment system với progress tracking
- ✅ **Thanh toán VNPay**: Tích hợp đầy đủ với VNPay gateway
- ✅ **Hệ thống coupon**: Tạo và quản lý mã giảm giá
- ✅ **AI Chat**: Tích hợp OpenAI cho tư vấn học tập
- ✅ **Upload files**: Hỗ trợ upload hình ảnh, video, tài liệu
- ✅ **Real-time messaging**: Hệ thống tin nhắn nội bộ
- ✅ **Swagger Documentation**: API docs tự động
- ✅ **Security**: Rate limiting, input validation, CORS
- ✅ **Logging**: Winston logger với rotation
- ✅ **Database**: PostgreSQL với connection pooling
- ✅ **Caching**: Redis integration

## 📋 Yêu cầu hệ thống

- Node.js >= 18.0.0
- PostgreSQL >= 13
- Redis >= 6
- NPM hoặc Yarn

## 🛠️ Cài đặt

### 1. Cài đặt dependencies

```bash
npm install
```

### 2. Cấu hình environment variables

Sao chép file `.env.example` thành `.env` và cập nhật các giá trị:

```bash
cp .env.example .env
```

### 3. Cấu hình VNPay

Đăng ký tài khoản VNPay sandbox tại: https://sandbox.vnpayment.vn/

Cập nhật các thông tin VNPay trong file `.env`:

```env
# VNPay Configuration
VNPAY_TMN_CODE=your_terminal_code
VNPAY_HASH_SECRET=your_hash_secret
VNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNPAY_RETURN_URL=http://localhost:3000/payment/vnpay-return
```

### 4. Cấu hình Database

Tạo database PostgreSQL:

```sql
CREATE DATABASE e_learning;
```

Chạy migration để tạo bảng:

```bash
psql -d e_learning -f database/migrations/add_payment_tables.sql
```

### 5. Chạy ứng dụng

Development mode:

```bash
npm run dev
```

Production mode:

```bash
npm run build
npm start
```

## 📚 API Documentation

Sau khi chạy server, truy cập Swagger documentation tại:

```
http://localhost:4000/api/docs
```

### Các endpoint chính:

#### Authentication

- `POST /api/auth/register` - Đăng ký tài khoản
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/logout` - Đăng xuất
- `GET /api/auth/me` - Thông tin user hiện tại

#### Courses

- `GET /api/courses` - Danh sách khóa học
- `POST /api/courses` - Tạo khóa học mới (Teacher/Admin)
- `GET /api/courses/:id` - Chi tiết khóa học
- `PATCH /api/courses/:id` - Cập nhật khóa học

#### Payments

- `POST /api/payments/create` - Tạo thanh toán
- `GET /api/payments/vnpay-return` - Callback từ VNPay
- `GET /api/payments` - Lịch sử thanh toán
- `GET /api/payments/methods` - Danh sách phương thức thanh toán

#### Coupons

- `POST /api/coupons/validate` - Validate mã giảm giá
- `GET /api/coupons` - Danh sách coupon (Admin)
- `POST /api/coupons` - Tạo coupon mới (Admin)
- `GET /api/coupons/stats` - Thống kê coupon (Admin)

#### AI Chat

- `POST /api/ai/chat` - Chat với AI
- `POST /api/ai/generate-quiz` - Tạo quiz tự động
- `POST /api/ai/extract-concepts` - Trích xuất khái niệm

## 💳 Tích hợp VNPay

### Flow thanh toán:

1. **Tạo thanh toán**: Client gọi `POST /api/payments/create`
2. **Redirect**: User được redirect đến VNPay
3. **Thanh toán**: User thực hiện thanh toán trên VNPay
4. **Callback**: VNPay gọi `GET /api/payments/vnpay-return`
5. **Xử lý**: Hệ thống tự động tạo enrollment nếu thanh toán thành công

### Phương thức thanh toán hỗ trợ:

- VNPay QR Code
- Internet Banking
- Thẻ tín dụng (Visa, MasterCard)
- ATM Card các ngân hàng

### Testing VNPay Sandbox:

Sử dụng thông tin test card:

- **Ngân hàng**: NCB
- **Số thẻ**: 9704198526191432198
- **Tên chủ thẻ**: NGUYEN VAN A
- **Ngày hết hạn**: 07/15
- **Mật khẩu OTP**: 123456

## 🎫 Hệ thống Coupon

### Tạo coupon:

```json
{
  "code": "WELCOME10",
  "name": "Chào mừng khách hàng mới",
  "description": "Giảm 10% cho đơn hàng đầu tiên",
  "discountType": "percentage",
  "discountValue": 10,
  "minimumAmount": 100000,
  "maximumDiscount": 50000,
  "usageLimit": 100,
  "validFrom": "2025-01-01T00:00:00Z",
  "validUntil": "2025-12-31T23:59:59Z"
}
```

### Validate coupon:

```json
{
  "code": "WELCOME10",
  "amount": 500000
}
```

Response:

```json
{
  "status": "success",
  "data": {
    "coupon": { ... },
    "originalAmount": 500000,
    "discountAmount": 50000,
    "finalAmount": 450000,
    "savings": 50000
  }
}
```

## 🤖 AI Features

### Chat với AI:

```json
{
  "query": "Làm thế nào để học lập trình hiệu quả?",
  "courseId": "uuid-optional"
}
```

### Generate Quiz:

```json
{
  "lectureId": "lecture-uuid",
  "numQuestions": 5
}
```

### Extract Concepts:

```json
{
  "lectureId": "lecture-uuid"
}
```

## 🔒 Security Features

- **Rate Limiting**: Giới hạn request theo IP/user
- **Input Validation**: Validate tất cả input
- **XSS Protection**: Sanitize HTML input
- **CORS**: Cấu hình CORS an toàn
- **Helmet**: Security headers
- **JWT**: Secure authentication
- **HTTPS**: SSL/TLS support

## 📊 Monitoring & Logging

### Health Check:

```
GET /api/health
```

### Logs:

- Development: Console output
- Production: File rotation (`logs/`)

### Metrics:

- Request count
- Response time
- Error rate
- Database connections

## 🐳 Docker Support

```dockerfile
# Dockerfile đã được chuẩn bị
docker build -t e-learning-backend .
docker run -p 4000:4000 e-learning-backend
```

## 🚀 Deployment

### Environment Variables cho Production:

```env
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@host:5432/db
REDIS_URL=redis://host:6379
JWT_SECRET=strong-secret-key
VNPAY_TMN_CODE=production-code
VNPAY_HASH_SECRET=production-secret
CORS_ORIGIN=https://yourdomain.com
```

### PM2 Process Manager:

```bash
npm install -g pm2
pm2 start ecosystem.config.js
```

## 🧪 Testing

```bash
# Unit tests
npm test

# Integration tests
npm run test:integration

# Coverage
npm run test:coverage
```

## 📝 Contributing

1. Fork repository
2. Tạo feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

MIT License - xem file [LICENSE](LICENSE) để biết thêm chi tiết.

## 🆘 Support

- Email: support@elearning.com
- Documentation: http://localhost:4000/api/docs
- Issues: GitHub Issues

## 🔄 Changelog

### v1.0.0

- ✅ Initial release
- ✅ VNPay payment integration
- ✅ Coupon system
- ✅ AI chat features
- ✅ Swagger documentation
- ✅ Complete course management
- ✅ Security enhancements
