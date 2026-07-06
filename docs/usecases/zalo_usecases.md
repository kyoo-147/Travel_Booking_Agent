# USE CASES - ZALO INTEGRATION

## 3.4.4. Module Zalo Integration

---

### 3.4.4.1. UseCase Kết nối tài khoản Zalo

| Mục | Nội dung |
|-----|----------|
| **Usecase** | Kết nối tài khoản Zalo |
| **Ngữ cảnh** | Người dùng hoặc Admin kết nối tài khoản Zalo Cá nhân/OA vào hệ thống để AI có thể thay mặt nhắn tin |
| **Mô tả** | Thiết lập kết nối giữa hệ thống Travel Agent và tài khoản Zalo thông qua quét mã QR hoặc cấu hình OA |
| **Tác Nhân** | User/Admin |
| **Sự kiện** | Người dùng truy cập trang "Zalo Settings" và chọn "Kết nối Zalo" |
| **Kết quả** | Tài khoản Zalo được kết nối thành công, hệ thống bắt đầu lắng nghe tin nhắn |
| **Luồng sự kiện** | **Actor** | **System** |
| | Người dùng nhấn "Kết nối tài khoản Zalo" | Hệ thống hiển thị mã QR Code (từ thư viện `zalo-chat-client` hoặc OA Auth URL) |
| | Người dùng mở app Zalo và quét mã | Hệ thống chờ xác thực từ Zalo server |
| | | Khi xác thực thành công, hệ thống lưu credentials (cookies/tokens) vào secure storage |
| | | Hệ thống tự động khởi chạy "Zalo Listener" để lắng nghe tin nhắn |
| | | Hệ thống thông báo "Kết nối thành công: [Tên Zalo]" |
| **Ngoại lệ** | Quét mã thất bại/timeout: Hệ thống báo "Hết thời gian chờ, vui lòng thử lại" và refresh QR |

---

### 3.4.4.2. UseCase Xem danh sách Zalo conversations

| Mục | Nội dung |
|-----|----------|
| **Usecase** | Xem danh sách Zalo conversations |
| **Ngữ cảnh** | Quản lý các cuộc hội thoại đang diễn ra giữa AI và các khách sạn |
| **Mô tả** | Xem danh sách tất cả các cuộc trò chuyện trên Zalo được đồng bộ về Dashboard |
| **Tác Nhân** | Admin/User |
| **Sự kiện** | Người dùng truy cập tab "Zalo Conversations" |
| **Kết quả** | Danh sách hội thoại hiển thị với tin nhắn mới nhất |
| **Luồng sự kiện** | **Actor** | **System** |
| | Người dùng chọn mục "Zalo Conversations" | Hệ thống gọi API GET /zalo/conversations |
| | | Hệ thống truy vấn danh sách hội thoại từ database (đã sync từ Zalo) |
| | | Hiển thị danh sách: Avatar đối tác, Tên, Tin nhắn cuối, Thời gian |
| **Ngoại lệ** | Chưa kết nối Zalo: Hệ thống nhắc "Vui lòng kết nối tài khoản Zalo trước" |
| | Lỗi đồng bộ: Hệ thống hiển thị "Không thể tải tin nhắn mới nhất" |

---

### 3.4.4.3. UseCase Gửi tin nhắn qua Zalo tới khách sạn

| Mục | Nội dung |
|-----|----------|
| **Usecase** | Gửi tin nhắn qua Zalo tới khách sạn |
| **Ngữ cảnh** | AI Agent hoặc người dùng gửi tin nhắn hỏi giá/đặt phòng tới khách sạn |
| **Mô tả** | Hệ thống gửi tin nhắn văn bản thông qua Zalo API tới số điện thoại của khách sạn |
| **Tác Nhân** | System (AI Agent) / User |
| **Sự kiện** | AI cần liên hệ khách sạn HOẶC người dùng nhập tin nhắn thủ công |
| **Kết quả** | Tin nhắn được gửi đi và hiển thị trạng thái "Đã gửi" |
| **Luồng sự kiện** | **Actor** | **System** |
| | Hệ thống kích hoạt gửi tin (theo kịch bản AI hoặc user input) | AI Service xác định số điện thoại người nhận |
| | | Hệ thống gọi Zalo API để gửi tin nhắn |
| | | Hệ thống lưu tin nhắn vào database với trạng thái "SENT" |
| | | Hệ thống cập nhật giao diện chat realtime |
| **Ngoại lệ** | Số điện thoại chưa kích hoạt Zalo: Hệ thống báo lỗi "Số điện thoại này chưa đăng ký Zalo" |
| | Tài khoản bị khóa/chặn: Hệ thống nhận lỗi từ Zalo API và thông báo "Không thể gửi tin tin nhắn (Bị chặn/Lỗi)" |

---

### 3.4.4.4. UseCase Nhận tin nhắn phản hồi từ khách sạn

| Mục | Nội dung |
|-----|----------|
| **Usecase** | Nhận tin nhắn phản hồi từ khách sạn |
| **Ngữ cảnh** | Khách sạn trả lời tin nhắn của AI (báo giá, xác nhận chỗ trống) |
| **Mô tả** | Hệ thống lắng nghe tin nhắn đến từ Zalo, lưu trữ và phân tích nội dung (nếu là AI booking flow) |
| **Tác Nhân** | Khách sạn (External) |
| **Sự kiện** | Khách sạn gửi tin nhắn tới tài khoản Zalo của hệ thống |
| **Kết quả** | Tin nhắn được lưu vào hệ thống và notify cho người dùng/AI |
| **Luồng sự kiện** | **Actor** | **System** |
| | Khách sạn gửi tin nhắn "Giá phòng là 1tr/đêm" | Zalo Webhook/Listener nhận sự kiện tin nhắn mới |
| | | Hệ thống lưu nội dung tin nhắn vào database |
| | | Hệ thống kiểm tra xem tin nhắn này có thuộc về Booking Session nào không |
| | | Nếu thuộc Booking Session: AI phân tích trích xuất thông tin (giá, confirm) |
| | | Hệ thống bắn notification (WebSocket) tới Frontend để hiển thị tin nhắn mới |
| **Ngoại lệ** | Lỗi phân tích tin nhắn: AI không hiểu nội dung (ví dụ voice, sticker), hệ thống hiển thị "Tin nhắn dạng media/không xác định" |
