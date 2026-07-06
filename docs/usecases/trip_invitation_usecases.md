# USE CASES - TRIP INVITATIONS

## 3.4.6. Module Quản Lý Lời Mời & Chia Sẻ Chuyến Đi

---

### 3.4.6.1. UseCase Mời companion tham gia chuyến đi

| Mục | Nội dung |
|-----|----------|
| **Usecase** | Mời companion tham gia chuyến đi |
| **Ngữ cảnh** | Người tạo chuyến đi (Trip Owner) muốn mời bạn bè, người thân cùng tham gia vào kế hoạch |
| **Mô tả** | Gửi lời mời tới người dùng khác có trong danh sách bạn đồng hành hoặc qua email/link |
| **Tác Nhân** | Trip Owner |
| **Sự kiện** | Trip Owner nhấn "Mời bạn bè" trong màn hình chi tiết chuyến đi |
| **Kết quả** | Lời mời được gửi đi và hiển thị trạng thái "Pending" |
| **Luồng sự kiện** | **Actor** | **System** |
| | Trip Owner nhập tên/email bạn bè hoặc chọn từ danh sách Companion | Hệ thống hiển thị danh sách gợi ý |
| | Trip Owner nhấn "Gửi lời mời" | Hệ thống tạo record `TripInvitation` trong database |
| | | Hệ thống gửi notification (in-app/email) tới người được mời |
| | | Hệ thống thông báo "Đã gửi lời mời thành công" |
| **Ngoại lệ** | Người dùng đã được mời: Hệ thống báo "Người này đã có trong danh sách khách mời" |
| | Người dùng không tồn tại: Hệ thống báo "Không tìm thấy người dùng này" |

---

### 3.4.6.2. UseCase Chấp nhận lời mời tham gia chuyến đi

| Mục | Nội dung |
|-----|----------|
| **Usecase** | Chấp nhận lời mời tham gia chuyến đi |
| **Ngữ cảnh** | Người dùng nhận được lời mời tham gia vào một chuyến đi do người khác tổ chức |
| **Mô tả** | Người dùng xem chi tiết lời mời và quyết định tham gia, khi đó họ sẽ thấy chuyến đi trong danh sách "Trips" của mình |
| **Tác Nhân** | Người được mời (Invitee) |
| **Sự kiện** | Người dùng nhận được thông báo lời mời và nhấn vào xem |
| **Kết quả** | Người dùng trở thành thành viên của chuyến đi (Trip Member) |
| **Luồng sự kiện** | **Actor** | **System** |
| | Người dùng mở thông báo lời mời | Hệ thống hiển thị thông tin tóm tắt chuyến đi (Tên, Địa điểm, Thời gian) |
| | Người dùng nhấn "Tham gia chuyến đi" | Hệ thống cập nhật trạng thái invitation thành "ACCEPTED" |
| | | Hệ thống thêm người dùng vào danh sách thành viên chuyến đi |
| | | Hệ thống gửi thông báo cho Trip Owner: "[Tên] đã chấp nhận lời mời" |
| | | Hệ thống chuyển hướng người dùng tới trang chi tiết chuyến đi |
| **Ngoại lệ** | Lời mời hết hạn/bị hủy: Hệ thống báo "Lời mời này không còn hiệu lực" |

---

### 3.4.6.3. UseCase Xem mã cá nhân của tôi

| Mục | Nội dung |
|-----|----------|
| **Usecase** | Xem mã cá nhân của tôi |
| **Ngữ cảnh** | Người dùng muốn lấy mã định danh duy nhất (User Code) để chia sẻ cho bạn bè kết bạn nhanh |
| **Mô tả** | Hiển thị mã User Code (dạng chữ hoặc QR Code) để người khác có thể tìm kiếm và kết bạn |
| **Tác Nhân** | Người dùng đã đăng nhập |
| **Sự kiện** | Người dùng truy cập trang Profile hoặc Settings |
| **Kết quả** | Mã cá nhân được hiển thị rõ ràng |
| **Luồng sự kiện** | **Actor** | **System** |
| | Người dùng chọn mục "Mã cá nhân" trong Profile | Hệ thống gọi API GET /travel-companions/my-code |
| | | Hệ thống lấy mã User Code từ database |
| | | Hệ thống hiển thị mã (VD: NAV-8392) và nút "Copy" |
| | Người dùng nhấn "Copy" | Hệ thống sao chép mã vào clipboard và thông báo "Đã copy" |
| **Ngoại lệ** | Lỗi server: Hệ thống báo "Không thể lấy mã cá nhân lúc này" |
