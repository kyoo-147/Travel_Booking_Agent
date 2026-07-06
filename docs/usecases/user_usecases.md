# USE CASES - USER MANAGEMENT SERVICE

## 3.4.2. Module Quản Lý Người Dùng & Bạn Đồng Hành

---

### 3.4.2.1. UseCase Xem danh sách người đồng hành

| Mục | Nội dung |
|-----|----------|
| **Usecase** | Xem danh sách người đồng hành |
| **Ngữ cảnh** | Người dùng muốn xem danh sách bạn bè, người thân đã kết nối trong hệ thống |
| **Mô tả** | Hiển thị danh sách tất cả người đồng hành đã kết nối, cùng với trạng thái và thông tin cơ bản |
| **Tác Nhân** | Người dùng đã đăng nhập |
| **Sự kiện** | Người dùng truy cập vào trang "Bạn đồng hành" (Travel Companions) |
| **Kết quả** | Danh sách người đồng hành được hiển thị |
| **Luồng sự kiện** | **Actor** | **System** |
| | Người dùng chọn menu "Bạn đồng hành" | Hệ thống gọi API GET /travel-companions |
| | | Hệ thống truy vấn danh sách companion từ database |
| | | Hệ thống hiển thị danh sách dạng lưới hoặc danh sách bao gồm: Avatar, Tên, Mối quan hệ, Trạng thái (Online/Offline) |
| **Ngoại lệ** | Lỗi server: Hệ thống báo lỗi "Không thể tải danh sách, vui lòng thử lại sau" |
| | Danh sách trống: Hệ thống hiển thị thông báo "Bạn chưa có người đồng hành nào" và gợi ý thêm mới |

---

### 3.4.2.2. UseCase Xem pending invitations

| Mục | Nội dung |
|-----|----------|
| **Usecase** | Xem pending invitations (Lời mời đang chờ) |
| **Ngữ cảnh** | Người dùng muốn kiểm tra các lời mời kết bạn chưa được xử lý |
| **Mô tả** | Xem danh sách các lời mời kết bạn đã nhận nhưng chưa chấp nhận hoặc từ chối |
| **Tác Nhân** | Người dùng đã đăng nhập |
| **Sự kiện** | Người dùng chọn tab "Lời mời kết bạn" hoặc mở thông báo lời mời |
| **Kết quả** | Hiển thị danh sách các lời mời đang chờ xử lý |
| **Luồng sự kiện** | **Actor** | **System** |
| | Người dùng chọn tab "Lời mời" | Hệ thống gọi API GET /travel-companions/invitations |
| | | Hệ thống lọc các lời mời có trạng thái 'pending' gửi đến user hiện tại |
| | | Hệ thống hiển thị danh sách lời mời bao gồm: Người gửi, Thời gian gửi, Tin nhắn đính kèm |
| | | Hiển thị 2 nút hành động: "Chấp nhận" và "Từ chối" |
| **Ngoại lệ** | Không có lời mời nào: Hệ thống hiển thị "Không có lời mời nào đang chờ" |

---

### 3.4.2.3. UseCase Connect với user qua code

| Mục | Nội dung |
|-----|----------|
| **Usecase** | Connect với user qua code |
| **Ngữ cảnh** | Người dùng muốn kết bạn nhanh với người khác thông qua mã kết bạn (User Code) |
| **Mô tả** | Người dùng nhập mã kết bạn (ví dụ: `NAV-1234`) của người khác để gửi lời mời kết bạn |
| **Tác Nhân** | Người dùng đã đăng nhập |
| **Sự kiện** | Người dùng nhập mã vào ô "Nhập mã kết bạn" và nhấn Gửi |
| **Kết quả** | Lời mời kết bạn được gửi đến người sở hữu mã |
| **Luồng sự kiện** | **Actor** | **System** |
| | Người dùng nhập User Code của bạn bè | Hệ thống hiển thị form nhập mã |
| | Người dùng chọn mối quan hệ (Bạn bè/Gia đình) | |
| | Người dùng nhấn nút "Kết nối" | Hệ thống gọi API POST /travel-companions/connect-by-code |
| | | Hệ thống kiểm tra mã code có tồn tại và hợp lệ không |
| | | Hệ thống tạo lời mời kết bạn mới trong database |
| | | Hệ thống gửi thông báo realtime đến người nhận |
| | | Hệ thống thông báo "Đã gửi lời mời kết bạn thành công" |
| **Ngoại lệ** | Mã code không tồn tại: Hệ thống báo lỗi "Mã người dùng không tìm thấy" |
| | Đã là bạn bè: Hệ thống báo lỗi "Người này đã có trong danh sách bạn đồng hành" |
| | Tự kết bạn với chính mình: Hệ thống báo lỗi "Không thể kết bạn với chính mình" |
