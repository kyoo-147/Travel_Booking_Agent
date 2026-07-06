# 3.4. Phân tích Sơ đồ Use Case Chi tiết: AI Research (Nghiên cứu điểm đến)

Phân hệ AI Research hỗ trợ người dùng khám phá thông tin du lịch thông qua khả năng tìm kiếm và tổng hợp dữ liệu của AI. Sơ đồ chi tiết được mô tả tại **Hình 3.4** dưới đây.

*(Hình 3.4: Sơ đồ chi tiết AI Research - Đã vẽ ở bước trước)*

### 3.4.1. Tác nhân tham gia
*   **Người dùng:** Người khởi xướng nhu cầu tìm kiếm (ví dụ: "Tìm quán ăn ngon ở Đà Lạt").
*   **AI System:** Đóng vai trò là một tác nhân xử lý (Processing Actor), chịu trách nhiệm thực thi các tác vụ tìm kiếm dữ liệu từ Internet mà con người không làm thủ công.

### 3.4.2. Use Case trung tâm: Nghiên cứu điểm đến (Deep Research)
Đây là chức năng chính, nơi người dùng nhập các câu hỏi phức tạp hoặc yêu cầu lập kế hoạch sơ bộ. Hệ thống không chỉ trả lời dựa trên dữ liệu có sẵn mà còn thực động tìm kiếm mới.

### 3.4.3. Các mối quan hệ Bao hàm (Include)
*   **Nghiên cứu điểm đến --> Đăng nhập:** Yêu cầu quyền truy cập hệ thống.
*   **Nghiên cứu điểm đến --> Tìm kiếm thông tin du lịch trên web:** Đây là trái tim của phân hệ này. Một yêu cầu "Deep Research" **bắt buộc** phải bao gồm hành động tìm kiếm thông tin thời gian thực (Real-time Web Search) do AI System thực hiện. Nếu không có bước này, nó chỉ là một chatbot thông thường, không phải là "Research Agent".

### 3.4.4. Các mối quan hệ Mở rộng (Extend)
Sau khi AI trả về kết quả nghiên cứu, người dùng có các tùy chọn mở rộng hành động:

*   **Lưu thông tin vào Trip (Extends Nghiên cứu):** Nếu tìm thấy một địa điểm thú vị, người dùng có thể lưu ngay vào kế hoạch chuyến đi của mình. Đây là bước chuyển đổi từ "Khám phá" sang "Lập kế hoạch".
*   **Chat hỏi đáp thêm (Extends Nghiên cứu):** Người dùng có thể đặt câu hỏi tiếp nối (Follow-up questions) dựa trên kết quả vừa nhận được (ví dụ: "Chỗ này cách trung tâm bao xa?").
*   **Xem gợi ý lịch trình (Extends Nghiên cứu):** Từ thông tin điểm đến, AI có thể đề xuất một lịch trình tham quan mẫu.

---
*Phân tích này làm nổi bật khả năng cộng tác giữa Người và AI: Người đặt câu hỏi định hướng, AI thực thi tìm kiếm diện rộng, và Người ra quyết định lưu trữ kết quả.*
