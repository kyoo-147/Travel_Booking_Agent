# 3.5. Phân tích Sơ đồ Use Case Chi tiết: Quản lý Người dùng & Zalo Connect

Đây là phân hệ nền tảng (Foundation Module), đảm bảo định danh người dùng và khả năng kết nối đa nền tảng. Sơ đồ chi tiết được mô tả tại **Hình 3.5**.

*(Hình 3.5: Sơ đồ chi tiết Quản lý Người dùng & Zalo - Đã vẽ ở bước trước)*

### 3.5.1. Tác nhân tham gia
*   **Người dùng:** Tác nhân chính thực hiện mọi thao tác quản trị tài khoản cá nhân.

### 3.5.2. Nhóm chức năng Định danh (Identity)
*   **Đăng ký & Đăng nhập:** Hai use case độc lập giúp người dùng truy cập hệ thống. Đây là cổng vào duy nhất dẫn đến các tính năng mở rộng khác.

### 3.5.3. Phân hệ Zalo Integration (Mở rộng từ Profile)
Tính năng này được thiết kế như một phần mở rộng của Hồ sơ cá nhân (Profile).
*   **Xem Profile --> Kết nối Zalo (Extend):** Người dùng truy cập hồ sơ để kích hoạt kết nối với Zalo OA.
*   **Kết nối Zalo --> Quét mã QR Zalo (Include):** Đây là bước bắt buộc về mặt bảo mật. Người dùng phải dùng điện thoại quét QR để ủy quyền cho hệ thống Travel Agent gửi tin nhắn thay mặt họ.
*   **Kết nối Zalo --> Xem danh sách hội thoại Zalo (Extend):** Sau khi kết nối thành công, hệ thống cho phép người dùng xem lại lịch sử các đoạn chat mà AI đã thực hiện với khách sạn.

### 3.5.4. Phân hệ Quản lý người đồng hành (Social Features)
Tính năng này mở rộng trực tiếp từ trạng thái Đăng nhập, cho phép xây dựng mạng lưới kết nối trên hệ thống.
*   **Đăng nhập --> Quản lý người đồng hành (Extend):** Truy cập danh bạ bạn bè.
*   **Các chức năng mở rộng (Extend):**
    *   **Mời bạn bè (Invite):** Gửi yêu cầu kết bạn hoặc tham gia chuyến đi.
    *   **Chấp nhận lời mời:** Phản hồi lại các yêu cầu từ người dùng khác.

---
*Tổng kết: Hệ thống được thiết kế theo mô hình "Lõi gọn nhẹ, Mở rộng đa năng". Chức năng cốt lõi chỉ là Đăng nhập, nhưng từ đó có thể mở rộng ra các kết nối mạnh mẽ với Zalo và Mạng lưới bạn bè.*
