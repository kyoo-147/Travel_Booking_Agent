# TỔNG QUAN CHỨC NĂNG HỆ THỐNG (SYSTEM FUNCTIONALITY OVERVIEW)

Bảng dưới đây liệt kê chi tiết các chức năng của hệ thống Travel Agent MVP, dựa theo danh sách Use Cases đã xác định.

| STT | Tên Use Case | Đối tượng | Mô tả |
|:---:|---|:---:|---|
| **3.3.1** | **Đăng ký tài khoản mới** | Khách (Guest) | Đăng ký tài khoản mới vào hệ thống sử dụng Email và Mật khẩu. |
| **3.3.2** | **Đăng nhập** | Người dùng | Đăng nhập vào hệ thống để truy cập các tính năng. |
| **3.3.3** | **Đăng xuất** | Người dùng | Đăng xuất khỏi hệ thống, kết thúc phiên làm việc. |
| **3.3.4** | **Xem thông tin profile người dùng** | Người dùng | Xem và quản lý thông tin cá nhân của tài khoản. |
| **3.3.5** | **Xem danh sách người đồng hành** | Người dùng | Xem danh sách các người đồng hành (bạn bè) đã kết nối. |
| **3.3.6** | **Xem pending invitations** | Người dùng | Xem danh sách các lời mời kết nối đang chờ xử lý. |
| **3.3.7** | **Connect với user qua code** | Người dùng | Kết nối với người dùng khác thông qua mã định danh (Code). |
| **3.3.8** | **Tạo trip từ AI agent booking** | Người dùng | Chuyển đổi thông tin đặt phòng thành công từ AI Agent thành một chuyến đi. |
| **3.3.9** | **Đàm phán với khách sạn qua Zalo (tự động)** | System (AI) | AI Agent tự động gửi tin nhắn Zalo để đàm phán giá và phòng với khách sạn. |
| **3.3.10** | **Xác nhận thanh toán booking** | Người dùng | Người dùng xác nhận đồng ý thanh toán/đặt cọc theo yêu cầu từ khách sạn. |
| **3.3.11** | **Hủy booking request** | Người dùng | Hủy bỏ yêu cầu đặt phòng đang xử lý. |
| **3.3.12** | **Kết nối tài khoản Zalo** | Người dùng | Liên kết tài khoản Zalo cá nhân vào hệ thống để AI sử dụng. |
| **3.3.13** | **Xem danh sách Zalo conversations** | Người dùng | Xem danh sách các cuộc hội thoại Zalo đã đồng bộ. |
| **3.3.14** | **Gửi tin nhắn qua Zalo tới khách sạn** | System/AI | Gửi tin nhắn văn bản tới tài khoản Zalo của khách sạn. |
| **3.3.15** | **Nhận tin nhắn phản hồi từ khách sạn** | System | Hệ thống nhận và xử lý tin nhắn phản hồi từ khách sạn qua Zalo Webhook. |
| **3.3.16** | **Chat với AI assistant** | Người dùng | Trò chuyện trực tiếp với trợ lý ảo AI để được hỗ trợ. |
| **3.3.17** | **Nghiên cứu sâu về điểm đến (Deep Research)** | Người dùng | Yêu cầu AI nghiên cứu chi tiết về một địa điểm du lịch cụ thể. |
| **3.3.18** | **Tìm kiếm thông tin du lịch trên web** | System (AI) | AI tự động tìm kiếm thông tin du lịch mới nhất trên internet. |
| **3.3.19** | **Mời companion tham gia chuyến đi** | Người dùng | Mời người đồng hành (đã kết nối) tham gia vào một chuyến đi cụ thể. |
| **3.3.20** | **Kết nối với người dùng khác qua User ID** | Người dùng | Gửi yêu cầu kết bạn với người dùng khác thông qua User ID. |
| **3.3.21** | **Xem danh sách lời mời chờ xử lý** | Người dùng | Kiểm tra và quản lý các lời mời kết nối/tham gia chuyến đi đang chờ. |
| **3.3.22** | **Xóa người đồng hành** | Người dùng | Hủy kết nối (xóa) một người dùng khỏi danh sách người đồng hành. |
