# USE CASES - AI AGENT BOOKING

## 3.4.3. Module AI Booking Agent & Zalo Integration

---

### 3.4.3.1. UseCase Tạo trip từ AI agent booking

| Mục | Nội dung |
|-----|----------|
| **Usecase** | Tạo trip từ AI agent booking |
| **Ngữ cảnh** | Người dùng muốn nhờ AI tự động tìm kiếm và đặt phòng khách sạn theo yêu cầu |
| **Mô tả** | Người dùng cung cấp thông tin chuyến đi (địa điểm, ngày đi, ngân sách), AI sẽ tìm kiếm và khởi tạo quy trình đặt phòng tự động |
| **Tác Nhân** | Người dùng đã đăng nhập |
| **Sự kiện** | Người dùng điền form "Bạn muốn đi đâu?" trên Dashboard |
| **Kết quả** | Một Booking Session được khởi tạo và AI bắt đầu tìm kiếm khách sạn |
| **Luồng sự kiện** | **Actor** | **System** |
| | Người dùng nhập: Điểm đến, Ngày đi/về, Số người, Ngân sách dự kiến | Hệ thống hiển thị form nhập liệu thông minh |
| | Người dùng nhấn "Bắt đầu lập kế hoạch" | Hệ thống gọi API POST /chat/send-message với intent 'BOOKING_REQUEST' |
| | | AI Service phân tích yêu cầu và tìm kiếm khách sạn phù hợp từ Database/RAG |
| | | AI Service tạo một "Booking Session" mới với trạng thái "SEARCHING" |
| | | Hệ thống chuyển hướng người dùng đến trang "Booking Mission" để theo dõi tiến trình |
| **Ngoại lệ** | Không tìm thấy địa điểm: AI thông báo "Tôi chưa có dữ liệu về địa điểm này, bạn có thể thử địa điểm khác không?" |
| | Lỗi kết nối AI: Hệ thống báo "AI Service đang bận, vui lòng thử lại sau" |

---

### 3.4.3.2. UseCase Đàm phán với khách sạn qua Zalo (tự động)

| Mục | Nội dung |
|-----|----------|
| **Usecase** | Đàm phán với khách sạn qua Zalo (tự động) |
| **Ngữ cảnh** | AI Agent thay mặt người dùng liên hệ trực tiếp với khách sạn qua Zalo để hỏi giá và tình trạng phòng |
| **Mô tả** | Sau khi người dùng chọn khách sạn, AI sẽ gửi tin nhắn Zalo tới khách sạn, xử lý phản hồi và báo cáo lại cho người dùng |
| **Tác Nhân** | System (AI Agent) |
| **Sự kiện** | Người dùng xác nhận chọn một khách sạn từ danh sách gợi ý của AI |
| **Kết quả** | AI nhận được báo giá và tình trạng phòng từ khách sạn |
| **Luồng sự kiện** | **Actor** | **System** |
| | Người dùng nhấn "Chọn khách sạn này" | AI cập nhật trạng thái session thành "CONTACTING_HOTEL" |
| | | AI Service gửi tin nhắn Zalo tới số điện thoại của khách sạn: "Xin chào, tôi muốn đặt phòng cho [Tên KH]..." |
| | (Khách sạn) Nhắn tin phản hồi qua Zalo | Zalo Webhook nhận tin nhắn phản hồi và đẩy về AI Service |
| | | AI phân tích nội dung tin nhắn (giá, phòng trống) |
| | | AI cập nhật trạng thái thành "NEGOTIATING" |
| | | AI thông báo cho người dùng trên Web App: "Khách sạn X đã phản hồi: Giá 1.2tr/đêm, còn phòng" |
| **Ngoại lệ** | Khách sạn không phản hồi: Sau 30 phút, AI gửi thông báo "Khách sạn chưa phản hồi, bạn có muốn thử khách sạn khác không?" |
| | Lỗi gửi tin Zalo: Hệ thống log lỗi và báo cho Admin kiểm tra kết nối Zalo OA |

---

### 3.4.3.3. UseCase Xác nhận thanh toán booking

| Mục | Nội dung |
|-----|----------|
| **Usecase** | Xác nhận thanh toán booking |
| **Ngữ cảnh** | Người dùng đồng ý với mức giá và điều kiện mà khách sạn đưa ra |
| **Mô tả** | Người dùng xác nhận thanh toán để AI hoàn tất thủ tục đặt phòng với khách sạn |
| **Tác Nhân** | Người dùng đã đăng nhập |
| **Sự kiện** | Người dùng nhận được thông báo giá và nhấn "Xác nhận thanh toán" |
| **Kết quả** | Booking được xác nhận, Trip được tạo chính thức trong hệ thống |
| **Luồng sự kiện** | **Actor** | **System** |
| | Người dùng xem chi tiết báo giá và nhấn "Thanh toán & Đặt phòng" | Hệ thống gọi API xác nhận booking |
| | | AI gửi tin nhắn chốt đơn tới Zalo khách sạn: "Khách đã chốt, vui lòng giữ phòng." |
| | | AI Service gọi Trip Service để tạo Trip mới và Booking record trong database |
| | | Hệ thống cập nhật trạng thái session thành "CONFIRMED" |
| | | Hệ thống hiển thị thông báo "Chúc mừng! Chuyến đi của bạn đã được lên lịch" |
| **Ngoại lệ** | Thanh toán thất bại: Hệ thống báo lỗi và giữ trạng thái "WAITING_PAYMENT" |
| | Khách sạn hết phòng phút chót: AI thông báo và đề xuất khách sạn thay thế |

---

### 3.4.3.4. UseCase Hủy booking request

| Mục | Nội dung |
|-----|----------|
| **Usecase** | Hủy booking request |
| **Ngữ cảnh** | Người dùng muốn hủy yêu cầu đặt phòng khi AI đang xử lý |
| **Mô tả** | Người dùng dừng quy trình đặt phòng, AI sẽ dừng liên lạc với khách sạn |
| **Tác Nhân** | Người dùng đã đăng nhập |
| **Sự kiện** | Người dùng nhấn nút "Hủy yêu cầu" trên trang Booking Mission |
| **Kết quả** | Booking session bị hủy, trạng thái chuyển về CANCELLED |
| **Luồng sự kiện** | **Actor** | **System** |
| | Người dùng nhấn nút "Hủy yêu cầu" | Hệ thống hiển thị popup xác nhận "Bạn có chắc muốn hủy?" |
| | Người dùng chọn "Đồng ý" | Hệ thống gọi API hủy booking session |
| | | AI gửi tin nhắn xin lỗi tới khách sạn (nếu đã liên hệ): "Xin lỗi, khách đã thay đổi kế hoạch." |
| | | Hệ thống cập nhật trạng thái session thành "CANCELLED" |
| | | Hệ thống chuyển hướng người dùng về Dashboard |
| **Ngoại lệ** | Không thể hủy khi đã thanh toán: Hệ thống thông báo "Booking đã hoàn tất, vui lòng liên hệ CSKH để xử lý hoàn tiền" |
