# 5.6. CHI TIẾT KỊCH BẢN KIỂM THỬ BẢO MẬT (SECURITY TESTING)

Đánh giá khả năng chống chịu tấn công và bảo vệ dữ liệu người dùng.

### Bảng 5.4.1: Kiểm thử xác thực JWT Token và phân quyền API
| STT | Trường hợp kiểm thử | Các bước kiểm thử | Kết quả mong đợi | Kết quả hiện tại | Ngày kiểm thử |
|:---:|---|---|---|:---:|:---:|
| 1 | Truy cập API không có Token | 1. Dùng Postman gọi API lấy danh sách chuyến đi: `GET /api/trips`.<br>2. Không gửi kèm Header `Authorization`. | Hệ thống trả về HTTP 401 Unauthorized. Message: "Token not found". | Thành công | 09/01/2026 |
| 2 | Truy cập với Token giả mạo | 1. Gọi API `GET /api/trips`.<br>2. Header `Authorization: Bearer faketoken123`. | Hệ thống trả về HTTP 403 Forbidden hoặc 401. Message: "Invalid Token". | Thành công | 09/01/2026 |
| 3 | Truy cập tài nguyên người khác | 1. Login User A -> Lấy Token A.<br>2. Dùng Token A gọi API lấy chi tiết Trip của User B: `GET /api/trips/{trip_id_of_B}`. | Hệ thống trả về HTTP 403 Forbidden. User A không có quyền xem Trip của User B. | Thành công | 09/01/2026 |

<br>

### Bảng 5.4.2: Kiểm thử bảo mật thông tin cá nhân (PII)
| STT | Trường hợp kiểm thử | Các bước kiểm thử | Kết quả mong đợi | Kết quả hiện tại | Ngày kiểm thử |
|:---:|---|---|---|:---:|:---:|
| 1 | Che giấu mật khẩu | 1. Kiểm tra Database bảng `user_profiles` (hoặc bảng Auth).<br>2. Xem cột `password`. | Mật khẩu phải được mã hóa (Hash - Bcrypt/Argon2). Không được lưu dạng Plaintext. | Thành công | 09/01/2026 |
| 2 | API Response Leak | 1. Gọi API lấy thông tin User Profile.<br>2. Kiểm tra JSON trả về. | Response KHÔNG được chứa trường `password` hoặc `hash`. Chỉ trả về thông tin public (name, avatar). | Thành công | 09/01/2026 |

<br>

### Bảng 5.4.3: Kiểm thử chống tấn công Injection
| STT | Trường hợp kiểm thử | Các bước kiểm thử | Kết quả mong đợi | Kết quả hiện tại | Ngày kiểm thử |
|:---:|---|---|---|:---:|:---:|
| 1 | XSS vào khung Chat | 1. Nhập vào khung chat AI: `<script>alert('Hacked')</script>`.<br>2. Gửi tin nhắn.<br>3. Reload trang xem lại lịch sử chat. | Tin nhắn hiển thị dưới dạng văn bản thuần `&lt;script&gt;...`. Script không được thực thi (không hiện popup alert). | Thành công | 09/01/2026 |
| 2 | SQL Injection vào Login | 1. Tại form đăng nhập.<br>2. Email: `' OR 1=1 --`.<br>3. Mật khẩu: ngẫu nhiên. | Đăng nhập thất bại. Hệ thống không bị bypass. Log server không báo lỗi cú pháp SQL (Syntax Error). | Thành công | 09/01/2026 |
