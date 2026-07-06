# USE CASES - AI RESEARCH

## 3.4.5. Module AI Chat & Research

---

### 3.4.5.1. UseCase Chat với AI assistant

| Mục | Nội dung |
|-----|----------|
| **Usecase** | Chat với AI assistant |
| **Ngữ cảnh** | Người dùng muốn trò chuyện với AI để hỏi đáp thông tin chung, lên kế hoạch du lịch hoặc giải trí |
| **Mô tả** | Người dùng gửi tin nhắn văn bản tới AI, AI trả lời dựa trên kiến thức có sẵn và ngữ cảnh chuyến đi |
| **Tác Nhân** | Người dùng đã đăng nhập |
| **Sự kiện** | Người dùng nhập tin nhắn vào khung chat trên Dashboard hoặc trong Trip Detail |
| **Kết quả** | AI trả lời câu hỏi và gợi ý các hành động tiếp theo |
| **Luồng sự kiện** | **Actor** | **System** |
| | Người dùng nhập: "Gợi ý lịch trình 3 ngày ở Đà Lạt" | Hệ thống hiển thị tin nhắn của người dùng |
| | Người dùng nhấn Gửi | Hệ thống gửi tin nhắn tới AI Service |
| | | AI Service phân loại intent (General Chat) |
| | | AI gọi LLM (GPT-4o) để generate câu trả lời |
| | | Hệ thống hiển thị câu trả lời của AI kèm theo các gợi ý (Quick Actions) |
| **Ngoại lệ** | Lỗi kết nối LLM: Hệ thống báo "AI đang bận, vui lòng thử lại sau" |
| | Nội dung vi phạm: AI từ chối trả lời nếu câu hỏi vi phạm chính sách an toàn |

---

### 3.4.5.2. UseCase Nghiên cứu sâu về điểm đến (Deep Research)

| Mục | Nội dung |
|-----|----------|
| **Usecase** | Nghiên cứu sâu về điểm đến (Deep Research) |
| **Ngữ cảnh** | Người dùng cần thông tin chi tiết, chuyên sâu về một địa điểm du lịch (văn hóa, ẩm thực, lịch sử, tips du lịch) |
| **Mô tả** | AI thực hiện quy trình nghiên cứu đa bước: thu thập thông tin từ nhiều nguồn, tổng hợp và phân tích để đưa ra báo cáo chi tiết |
| **Tác Nhân** | Người dùng |
| **Sự kiện** | Người dùng chọn chế độ "Deep Research" và nhập địa điểm/chủ đề quan tâm |
| **Kết quả** | Một báo cáo chi tiết về điểm đến được hiển thị |
| **Luồng sự kiện** | **Actor** | **System** |
| | Người dùng chọn "Deep Research" cho địa điểm "Hang Sơn Đoòng" | Hệ thống khởi tạo Research Session |
| | | AI xác định các khía cạnh cần nghiên cứu (Lịch sử, Cách đi, Chi phí, Lưu ý an toàn) |
| | | AI thực hiện nhiều lượt tìm kiếm và tổng hợp thông tin từ Knowledge Base/Web |
| | | AI tổng hợp thông tin thành một bài viết chi tiết, có cấu trúc |
| | | Hệ thống hiển thị kết quả nghiên cứu dưới dạng bài viết rich-text |
| **Ngoại lệ** | Thiếu dữ liệu: AI thông báo "Không đủ dữ liệu tin cậy để nghiên cứu sâu về địa điểm này" |
| | Quá tải request: Hệ thống báo "Vui lòng chờ giây lát trước khi thực hiện nghiên cứu mới" |

---

### 3.4.5.3. UseCase Tìm kiếm thông tin du lịch trên web

| Mục | Nội dung |
|-----|----------|
| **Usecase** | Tìm kiếm thông tin du lịch trên web |
| **Ngữ cảnh** | Người dùng cần thông tin cập nhật mới nhất (thời tiết, giá vé hiện tại, sự kiện sắp diễn ra) mà AI không có sẵn |
| **Mô tả** | AI sử dụng công cụ tìm kiếm web để lấy thông tin real-time và trả lời câu hỏi của người dùng |
| **Tác Nhân** | Người dùng |
| **Sự kiện** | Người dùng hỏi về thông tin mang tính thời sự (VD: "Thời tiết Đà Nẵng tuần tới thế nào?") |
| **Kết quả** | Thông tin mới nhất được cập nhật và trả lời cho người dùng |
| **Luồng sự kiện** | **Actor** | **System** |
| | Người dùng hỏi: "Giá vé máy bay Hà Nội - HCM hôm nay bao nhiêu?" | AI phân tích intent và nhận thấy cần "Web Search" |
| | | AI thực hiện query tới Search Engine (Tavily/Google API) |
| | | AI đọc và trích xuất thông tin từ các kết quả tìm kiếm hàng đầu |
| | | AI tổng hợp câu trả lời dựa trên dữ liệu vừa tìm được, kèm trích dẫn nguồn |
| | | Hệ thống hiển thị câu trả lời và link nguồn tham khảo |
| **Ngoại lệ** | Không tìm thấy kết quả: AI báo "Không tìm thấy thông tin phù hợp trên web" |
| | Tìm kiếm timeout: Hệ thống trả về câu trả lời dựa trên kiến thức có sẵn và cảnh báo "Dữ liệu có thể chưa cập nhật" |
