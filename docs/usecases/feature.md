Phân tích Sơ đồ
Dựa trên danh sách 22 Use Case, tôi sẽ chia thành các nhóm Actor:

Khách (Guest): Đăng ký tài khoản.
Người dùng (Logged-in User): Thực hiện hầu hết các chức năng.
Hệ thống AI (System Agent): Đàm phán, Gửi tin Zalo (kịch bản tự động).


Prompt
A professional UML Use Case Diagram for a Travel Agent System.
The diagram should feature 3 main Actors on the left and right sides:
1. **Khách (Guest)** (Left)
2. **Người dùng (User)** (Left)
3. **AI Agent / System** (Right)

Inside the System Boundary box titled "Hệ thống Travel Agent", include the following Use Case ellipses connected to the Actors:

**Connected to Khách:**
- Đăng ký tài khoản mới

**Connected to Người dùng:**
- Đăng nhập
- Đăng xuất
- Xem profile
- Kết nối Zalo
- Chat với AI Assistant
- Yêu cầu đặt phòng (Booking Request)
- Xác nhận thanh toán
- Tạo Trip từ AI Booking
- Mời companion tham gia
- Xem danh sách người đồng hành
- Nghiên cứu điểm đến (Deep Research)

**Connected to AI Agent / System:**
- Đàm phán với khách sạn (Auto)
- Gửi tin nhắn Zalo tới khách sạn
- Nhận phản hồi từ khách sạn
- Tìm kiếm thông tin web

**Relationships:**
- Show simple associations (lines) between Actors and Use Cases.
- Style: Clean white background, stick figures for actors, oval shapes for use cases, clear black lines. Similar to a standard academic UML diagram.
- Text in Vietnamese as listed above.







Phân hệ lõi quan trọng nhất: AI Booking & Đàm phán. Đây là "trái tim" của hệ thống.

Logic sơ đồ sẽ như sau:

Chức năng gốc: Yêu cầu đặt phòng.
Include (Bắt buộc): Phải Đăng nhập & Kết nối Zalo.
Extend (Mở rộng/Tùy chọn):
Đàm phán giá (AI tự chạy).
Xác nhận thanh toán (Khi hotel chốt).
Tạo Trip (Sau khi thanh toán).
Hủy yêu cầu (Lúc nào cũng hủy được).


Sơ đồ này thể hiện rõ:

Include: Đăng nhập, Kết nối Zalo, Gửi tin nhắn Zalo (Bắt buộc).
Extend: Đàm phán, Xác nhận thanh toán, Tạo Trip (Quy trình mở rộng tùy tình huống).



Phân hệ Quản lý Chuyến đi & Đồng hành (Trip Management & Companion).

Logic sơ đồ sẽ như sau:

Chức năng gốc (Base): "Xem chi tiết Trip" (Mọi hành động đều xoay quanh Trip).
Actor: Người dùng (Chủ chuyến đi).
Include (Bắt buộc):
Đăng nhập.
Extend (Mở rộng):
Quản lý Ngân sách: Xem, cập nhật chi phí (như chúng ta vừa làm).
Mời bạn bè: Gửi lời mời.
Quản lý Companion: Xem danh sách, xóa bạn đồng hành.
Kết nối qua Code: Tính năng kết bạn nhanh để mời.


Tôi đã vẽ xong sơ đồ Use Case chi tiết cho Phân hệ Quản lý Chuyến đi (Trip Management).

Sơ đồ thể hiện rõ:

Trung tâm: Là use case "Quản lý Chuyến đi".
Các tính năng mở rộng (Extend): Ngân sách, Mời người tham gia, Xem lịch trình.
Chi tiết hóa: Việc "Mời người tham gia" được mở rộng thêm bằng cách "Kết nối qua Code" hoặc "Chọn từ danh sách bạn bè".



Phân hệ AI Research (Nghiên cứu điểm đến).

Logic sơ đồ:

Chức năng gốc (Base): "Nghiên cứu điểm đến (Deep Research)".
Actor: Người dùng (User).
System Actor: AI System (Thực hiện tìm kiếm).
Quan hệ:
Include: "Đăng nhập", "Tìm kiếm thông tin web" (AI bắt buộc phải search mới trả lời được).
Extend: "Lưu thông tin vào Trip" (Thấy hay thì lưu), "Chat hỏi đáp thêm" (Hỏi sâu hơn về kết quả).

Phân hệ AI Research (Nghiên cứu điểm đến).

Sơ đồ này thể hiện rõ vai trò hỗ trợ đắc lực của AI System trong việc tìm kiếm thông tin trên web, là một phần bắt buộc (<<include>>) của quy trình nghiên cứu. Đồng thời, người dùng có thể mở rộng (<<extend>>) hành động bằng cách lưu kết quả vào chuyến đi hoặc tiếp tục chat hỏi đáp.

Như vậy, chúng ta đã hoàn thành 4 sơ đồ Use Case quan trọng nhất:

Tổng quan hệ thống (Overview)
Chi tiết AI Booking (Đặt phòng tự động)
Chi tiết Trip Management (Quản lý chuyến đi)
Chi tiết AI Research (Nghiên cứu)




Phân hệ Quản lý Người dùng & Zalo Connect. Đây là phần nền tảng để các chức năng khác hoạt động.

Logic sơ đồ:

Chức năng gốc: "Quản lý Tài khoản".
Actor: Người dùng.
Extend (Mở rộng tính năng):
Kết nối Zalo: Tính năng quan trọng nhất để kích hoạt AI Booking.
Quản lý Companion: Thêm bạn bè, xem lời mời.
Xem Profile: Cập nhật thông tin.
Đổi mật khẩu / Cấu hình: Các tính năng phụ trợ.