# CHƯƠNG 3: PHÂN TÍCH HỆ THỐNG VÀ CA SỬ DỤNG (USE CASES)

## 3.1. Phân tích Sơ đồ Use Case Tổng quan

Hệ thống Travel Agent được xây dựng dựa trên mô hình tương tác giữa con người và trí tuệ nhân tạo (AI). Dựa vào yêu cầu nghiệp vụ, chúng tôi xác định có 03 tác nhân chính (Actors) tham gia vào hệ thống: **Khách (Guest)**, **Người dùng (User)** và **AI Agent (System)**.

Tổng quan các chức năng và quyền hạn của từng tác nhân được thể hiện trong **Hình 3.1: Sơ đồ usecase tổng quan hệ thống** dưới đây.

*(Hình 3.1: Sơ đồ usecase tổng quan hệ thống - Đã vẽ ở bước trước)*

### 3.1.1. Tác nhân Khách (Guest)
Khách là những đối tượng người dùng vãng lai, chưa có tài khoản hoặc chưa đăng nhập vào hệ thống. Để đảm bảo tính bảo mật và cá nhân hóa trải nghiệm, quyền hạn của Khách bị giới hạn tối đa.

*   **Về chức năng Đăng ký tài khoản:** Đây là chức năng duy nhất dành cho Khách, cho phép họ khởi tạo danh tính số trên hệ thống thông qua Email hoặc Số điện thoại. Sau khi hoàn tất quy trình này, Khách sẽ chuyển đổi vai trò thành Người dùng (User).

### 3.1.2. Tác nhân Người dùng (User)
Người dùng là các thành viên đã được xác thực danh tính. Đây là tác nhân trung tâm của hệ thống, tương tác trực tiếp với các luồng nghiệp vụ chính. Các nhóm chức năng của Người dùng bao gồm:

*   **Về nhóm Quản lý tài khoản:**
    *   **Đăng nhập/Đăng xuất:** Đảm bảo phiên làm việc an toàn.
    *   **Xem Profile & Kết nối Zalo:** Người dùng có thể cập nhật thông tin cá nhân và thực hiện liên kết tài khoản Zalo. Đây là bước bắt buộc (Pre-condition) để sử dụng tính năng đặt phòng qua AI.

*   **Về nhóm Nghiệp vụ Đặt phòng (Booking):**
    *   **Chat với AI Assistant:** Kênh giao tiếp chính để người dùng đưa ra yêu cầu (prompt).
    *   **Yêu cầu đặt phòng (Booking Request):** Người dùng cung cấp các tiêu chí (địa điểm, ngày giờ, ngân sách) để khởi tạo một yêu cầu.
    *   **Xác nhận thanh toán:** Sau khi AI đàm phán thành công, người dùng đóng vai trò ra quyết định cuối cùng bằng việc phê duyệt thanh toán.

*   **Về nhóm Quản lý Chuyến đi (Trip Management):**
    *   **Tạo Trip & Nghiên cứu điểm đến:** Hệ thống hỗ trợ người dùng lên kế hoạch chi tiết (Deep Research) và tổ chức thành các Chuyến đi (Trip).
    *   **Mời Companion:** Người dùng có khả năng mời bạn bè tham gia chuyến đi để chia sẻ thông tin và lịch trình.

### 3.1.3. Tác nhân AI Agent (System)
Khác với các hệ thống truyền thống, Travel Agent tích hợp một tác nhân ảo (AI Agent) hoạt động độc lập như một nhân viên thực thụ.

*   **Về chức năng Tự động hóa giao tiếp:**
    *   AI Agent chịu trách nhiệm **Gửi tin nhắn Zalo tới khách sạn** và **Nhận phản hồi** một cách tự động.
    *   Chức năng **Đàm phán với khách sạn (Auto)** là tính năng lõi, nơi AI tự động thương lượng giá và check phòng dựa trên ngân sách người dùng đề ra.

*   **Về chức năng Thu thập dữ liệu:**
    *   **Tìm kiếm thông tin web:** AI Agent chủ động tra cứu dữ liệu từ Internet để phục vụ cho các yêu cầu Nghiên cứu điểm đến của người dùng.

---
*Phân tích này cho thấy sự phân chia trách nhiệm rõ ràng: Người dùng ra quyết định, AI Agent thực thi các tác vụ tốn thời gian (liên hệ, tìm kiếm), tạo nên trải nghiệm "Agentic" (tính đại lý) của hệ thống.*
