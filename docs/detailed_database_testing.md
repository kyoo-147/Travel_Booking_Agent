# 5.5. CHI TIẾT KỊCH BẢN KIỂM THỬ CƠ SỞ DỮ LIỆU (DATABASE TESTING)

Đánh giá tính toàn vẹn, hiệu năng và tính nhất quán của dữ liệu.

### Bảng 5.3.1: Kiểm thử tính toàn vẹn dữ liệu khi tạo Booking
| STT | Trường hợp kiểm thử | Các bước kiểm thử | Kết quả mong đợi | Kết quả hiện tại | Ngày kiểm thử |
|:---:|---|---|---|:---:|:---:|
| 1 | Rang buộc khóa ngoại (Foreign Key) | 1. Cố ý tạo Booking với `tripId` không tồn tại (UUID ngẫu nhiên).<br>2. Gửi request API trực tiếp (bypass frontend). | Database trả về lỗi `foreign key constraint violation`. Dữ liệu rác không được lưu vào bảng `bookings`. | Thành công | 09/01/2026 |
| 2 | Tính toán giá tiền (Data Type) | 1. Lưu giá tiền `100.50` vào trường `price`.<br>2. Truy vấn lại giá trị đó. | Dữ liệu được lưu chính xác là `100.50` (Kiểu Decimal/Numeric), không bị làm tròn sai số (như Float). | Thành công | 09/01/2026 |
| 3 | Transaction Rollback | 1. Bắt đầu Transaction tạo Trip.<br>2. Insert Trip thành công.<br>3. Insert Booking thất bại (do lỗi mạng/data).<br>4. Kiểm tra bảng `Trip`. | Trip vừa tạo phải bị rollback (biến mất). Không tồn tại Trip rỗng không có Booking hợp lệ. | Thành công | 09/01/2026 |

<br>

### Bảng 5.3.2: Kiểm thử lưu trữ lịch sử Chat (Zalo & AI)
| STT | Trường hợp kiểm thử | Các bước kiểm thử | Kết quả mong đợi | Kết quả hiện tại | Ngày kiểm thử |
|:---:|---|---|---|:---:|:---:|
| 1 | Lưu trữ JSONB | 1. Gửi tin nhắn chứa cấu trúc phức tạp (Emoji, Link, Quote).<br>2. Kiểm tra cột `messages` (Kiểu JSONB) trong DB. | Dữ liệu JSON được lưu đúng cấu trúc, không bị vỡ format. Có thể query được theo key bên trong JSON. | Thành công | 09/01/2026 |
| 2 | Indexing Performance | 1. Tạo 1 triệu dòng log chat giả lập.<br>2. Thực hiện query tìm tin nhắn theo `sessionId`. | Thời gian phản hồi query < 100ms nhờ Index trên cột `sessionId`. | Thành công | 09/01/2026 |

<br>

### Bảng 5.3.3: Kiểm thử tính nhất quán dữ liệu giữa Trip Service và User Service
| STT | Trường hợp kiểm thử | Các bước kiểm thử | Kết quả mong đợi | Kết quả hiện tại | Ngày kiểm thử |
|:---:|---|---|---|:---:|:---:|
| 1 | Xóa User (Cascade Delete) | 1. Xóa một User khỏi bảng `user_profiles`.<br>2. Kiểm tra bảng `trips` và `bookings` của user đó. | (Tùy cấu hình) Dữ liệu liên quan phải được xóa theo HOẶC chuyển về trạng thái `archived` (Soft Delete). Không để lại Orphan Data. | Thành công | 09/01/2026 |
| 2 | Đồng bộ thông tin | 1. User đổi tên trong User Service.<br>2. Xem danh sách Trip. | Tên người tạo Trip phải hiển thị tên mới nhất (Do join realtime hoặc event sourcing update). | Thành công | 09/01/2026 |
