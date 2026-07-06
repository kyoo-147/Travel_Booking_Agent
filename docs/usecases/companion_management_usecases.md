# USE CASES - COMPANION MANAGEMENT

## 3.4.7. Module Quản Lý Bạn Đồng Hành (Chi tiết)

---

### 3.4.7.1. UseCase Xem danh sách người đồng hành

| Mục | Nội dung |
|-----|----------|
| **Usecase** | Xem danh sách người đồng hành |
| **Ngữ cảnh** | Người dùng muốn quản lý danh sách bạn bè, người thân đã kết nối để mời vào các chuyến đi |
| **Mô tả** | Hiển thị danh sách chi tiết các companion, bao gồm thông tin cá nhân cơ bản và lịch sử chuyến đi chung |
| **Tác Nhân** | Người dùng đã đăng nhập |
| **Sự kiện** | Người dùng truy cập trang "Companions" từ Dashboard |
| **Kết quả** | Danh sách companion hiển thị đầy đủ |
| **Luồng sự kiện** | **Actor** | **System** |
| | Người dùng chọn menu "Companions" | Hệ thống gọi API GET /travel-companions |
| | | Hệ thống truy vấn database lấy danh sách bạn bè đã chấp nhận kết nối |
| | | Hệ thống hiển thị danh sách dạng thẻ (Card view) hoặc danh sách (List view) |
| | | Hiển thị các nút thao tác nhanh: "Xóa", "Mời chuyến đi" |
| **Ngoại lệ** | Lỗi tải dữ liệu: Hệ thống hiển thị "Error loading companions" và nút Retry |

---

### 3.4.7.2. UseCase Kết nối với người dùng khác qua User ID

| Mục | Nội dung |
|-----|----------|
| **Usecase** | Kết nối với người dùng khác qua User ID |
| **Ngữ cảnh** | Người dùng biết User ID (Internal ID) của người khác và muốn gửi lời mời kết bạn trực tiếp |
| **Mô tả** | Gửi lời mời kết bạn thông qua việc nhập chính xác User ID của đối phương |
| **Tác Nhân** | Người dùng đã đăng nhập |
| **Sự kiện** | Người dùng chọn "Thêm bạn bằng ID" |
| **Kết quả** | Lời mời kết bạn được gửi đi thành công |
| **Luồng sự kiện** | **Actor** | **System** |
| | Người dùng chọn "Add Companion" -> "By User ID" | Hệ thống hiển thị modal nhập User ID |
| | Người dùng nhập ID (UUID) và nhấn "Gửi lời mời" | Hệ thống gọi API POST /travel-companions/invite |
| | | Hệ thống kiểm tra User ID có tồn tại |
| | | Hệ thống kiểm tra xem đã là bạn bè chưa |
| | | Hệ thống tạo Invitation record và gửi notification |
| | | Thông báo "Invitation sent successfully" |
| **Ngoại lệ** | User ID không đúng định dạng: Hệ thống báo "Invalid User ID format" |
| | Không tìm thấy User: Hệ thống báo "User not found" |

---

### 3.4.7.3. UseCase Xem danh sách lời mời chờ xử lý

| Mục | Nội dung |
|-----|----------|
| **Usecase** | Xem danh sách lời mời chờ xử lý |
| **Ngữ cảnh** | Người dùng kiểm tra các lời mời kết bạn (Inbound) và các lời mời mình đã gửi đi (Outbound) |
| **Mô tả** | Quản lý các lời mời chưa được chấp nhận, cho phép chấp nhận/từ chối hoặc hủy lời mời đã gửi |
| **Tác Nhân** | Người dùng đã đăng nhập |
| **Sự kiện** | Người dùng chọn tab "Pending Invitations" |
| **Kết quả** | Danh sách lời mời Inbound/Outbound hiển thị |
| **Luồng sự kiện** | **Actor** | **System** |
| | Người dùng chọn tab "Pending" | Hệ thống gọi API GET /travel-companions/invitations |
| | | Hệ thống phân loại lời mời: "Received" (Đã nhận) và "Sent" (Đã gửi) |
| | | Hiển thị danh sách với các nút hành động tương ứng (Accept/Decline cho Received, Cancel cho Sent) |
| **Ngoại lệ** | Danh sách trống: Hiển thị "No pending invitations" |

---

### 3.4.7.4. UseCase Xóa người đồng hành

| Mục | Nội dung |
|-----|----------|
| **Usecase** | Xóa người đồng hành |
| **Ngữ cảnh** | Người dùng muốn hủy kết nối bạn bè với một người khác |
| **Mô tả** | Xóa mối quan hệ companion khỏi hệ thống, người kia sẽ không còn thấy người dùng trong danh sách bạn bè |
| **Tác Nhân** | Người dùng đã đăng nhập |
| **Sự kiện** | Người dùng nhấn nút "Xóa" (hoặc icon thùng rác) trên thẻ thông tin companion |
| **Kết quả** | Mối quan hệ bạn bè bị xóa vĩnh viễn |
| **Luồng sự kiện** | **Actor** | **System** |
| | Người dùng nhấn nút "Remove Companion" | Hệ thống hiển thị dialog xác nhận "Are you sure?" |
| | Người dùng chọn "Yes, remove" | Hệ thống gọi API DELETE /travel-companions/:id |
| | | Hệ thống xóa record trong bảng `travel_companions` (cả 2 chiều) |
| | | Hệ thống gửi thông báo cho người dùng kia (tùy chọn) |
| | | Hệ thống cập nhật lại danh sách hiển thị (bỏ item vừa xóa) |
| **Ngoại lệ** | Lỗi server: Hệ thống báo "Could not remove companion" |
