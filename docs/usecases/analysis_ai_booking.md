# 3.2. Phân tích Sơ đồ Use Case Chi tiết: AI Booking & Đàm phán

Phân hệ AI Booking là trái tim của hệ thống Travel Agent, nơi thể hiện rõ nhất tính năng "Agentic" của AI. Sơ đồ chi tiết cho phân hệ này được mô tả như **Hình 3.2** dưới đây.

*(Hình 3.2: Sơ đồ chi tiết AI Booking - Đã vẽ ở bước trước)*

### 3.2.1. Use Case trung tâm: Yêu cầu đặt phòng qua AI
Đây là use case khởi đầu cho toàn bộ quy trình. Người dùng cung cấp các tiêu chí (Destination, Date, Budget) cho AI.

### 3.2.2. Các mối quan hệ Bao hàm (Include)
Sơ đồ sử dụng mối quan hệ `<<include>>` để chỉ ra các chức năng bắt buộc phải có hoặc phải thực hiện để use case chính hoạt động:

*   **Yêu cầu đặt phòng --> Đăng nhập:** Người dùng bắt buộc phải định danh trên hệ thống trước khi gửi yêu cầu.
*   **Yêu cầu đặt phòng --> Kết nối Zalo:** Đây là điều kiện tiên quyết về mặt hạ tầng. Hệ thống cần tài khoản Zalo của người dùng (hoặc Official Account được ủy quyền) để AI có thể thay mặt liên hệ với các nhà cung cấp dịch vụ.
*   **Đàm phán với khách sạn --> Gửi tin nhắn Zalo:** Quy trình đàm phán bao hàm việc gửi và nhận tin nhắn. AI không thể thực hiện đàm phán "trong im lặng", do đó việc gửi tin nhắn Zalo là một phần tất yếu của quá trình này.

### 3.2.3. Các mối quan hệ Mở rộng (Extend)
Mối quan hệ `<<extend>>` thể hiện các luồng chức năng có thể xảy ra tùy vào điều kiện hoặc lựa chọn của người dùng/hệ thống:

*   **Đàm phán với khách sạn (Extends Yêu cầu đặt phòng):** Sau khi nhận yêu cầu, AI sẽ tiến hành đàm phán. Đây là một quy trình mở rộng phức tạp, nơi AI tự động tìm kiếm và mặc cả với khách sạn để có giá tốt nhất.
*   **Hủy yêu cầu (Extends Yêu cầu đặt phòng):** Tại bất kỳ thời điểm nào trước khi chốt, người dùng có quyền hủy yêu cầu. Đây là luồng rẽ nhánh (Alternative Path).
*   **Xác nhận thanh toán (Extends Đàm phán):** Chỉ khi quá trình đàm phán đạt được thỏa thuận về giá và phòng trống, use case này mới được kích hoạt. Nó yêu cầu sự can thiệp xác nhận từ người dùng.
*   **Tạo Trip mới (Extends Xác nhận thanh toán):** Khi thanh toán hoàn tất, hệ thống tự động mở rộng luồng xử lý bằng việc đóng gói toàn bộ thông tin Booking thành một chuyến đi (Trip) để quản lý lịch trình sau này.
