# 3.3. Phân tích Sơ đồ Use Case Chi tiết: Quản lý Chuyến đi (Trip Management)

Sau khi đặt dịch vụ thành công, hệ thống cung cấp công cụ quản lý toàn diện cho chuyến đi. Sơ đồ chi tiết phân hệ này được mô tả tại **Hình 3.3**.

*(Hình 3.3: Sơ đồ chi tiết Quản lý Chuyến đi - Đã vẽ ở bước trước)*

### 3.3.1. Tác nhân tham gia
*   **Người dùng (Owner):** Là người khởi tạo chuyến đi. Trong ngữ cảnh này, quyền hạn của họ là cao nhất (Admin cuả chuyến đi), bao gồm quyền mời người khác và quản lý ngân sách.

### 3.3.2. Use Case trung tâm: Quản lý Chuyến đi
Use case này đóng vai trò là "Dashboard" tổng hợp, nơi người dùng bắt đầu mọi thao tác liên quan đến hành trình của mình.

### 3.3.3. Các mối quan hệ Bao hàm (Include)
*   **Quản lý Chuyến đi --> Đăng nhập:** Tương tự các phân hệ khác, việc định danh người dùng là bắt buộc để truy cập dữ liệu cá nhân.

### 3.3.4. Các mối quan hệ Mở rộng (Extend) cấp 1
Từ giao diện quản lý chuyến đi, người dùng có thể mở rộng truy cập sang các module chức năng chuyên sâu:

*   **Xem ngân sách & chi phí (Extends Quản lý Chuyến đi):** Cho phép theo dõi tổng chi phí dự kiến so với thực tế, breakdown chi tiết theo từng hạng mục (Khách sạn, Vé máy bay...).
*   **Xem lịch trình (Extends Quản lý Chuyến đi):** Hiển thị Timeline các hoạt động.
*   **Mời người tham gia (Extends Quản lý Chuyến đi):** Tính năng xã hội hóa (Social), cho phép biến chuyến đi cá nhân thành chuyến đi nhóm.
*   **Xem danh sách người đồng hành (Extends Quản lý Chuyến đi):** Quản lý các thành viên hiện có trong chuyến đi.

### 3.3.5. Các mối quan hệ Mở rộng (Extend) cấp 2
Đây là điểm đặc biệt của sơ đồ này, thể hiện sự chi tiết hóa của các chức năng con:

*   **Từ chức năng "Mời người tham gia", có 2 cách thức mở rộng:**
    *   **Kết nối qua User Code:** Dành cho việc mời nhanh người lạ hoặc người chưa kết bạn.
    *   **Chọn từ danh sách bạn bè:** Dành cho việc mời nhanh người thân quen đã có trong danh bạ hệ thống.

*   **Từ chức năng "Xem danh sách người đồng hành":**
    *   **Quản lý lời mời (Accept/Reject):** Cho phép chủ chuyến đi phê duyệt hoặc từ chối các yêu cầu tham gia.

---
*Phân tích này cho thấy cấu trúc phân cấp (Hierarchy) của chức năng quản lý, từ tổng quát đến chi tiết, đảm bảo người dùng có toàn quyền kiểm soát mọi khía cạnh của chuyến đi.*
