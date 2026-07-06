# SƠ ĐỒ CƠ SỞ DỮ LIỆU HỆ THỐNG (SYSTEM ER DIAGRAM)

## 3.4.3. Diagram của hệ thống

Sơ đồ Entity-Relationship (ERD) thể hiện cấu trúc dữ liệu và các mối quan hệ giữa các thực thể chính trong hệ thống Travel Agent.

![Travel Agent ER Diagram](file:///home/navin/.gemini/antigravity/brain/40e89fe4-9acd-49d6-8cfb-eab7e966d400/travel_agent_er_diagram_1767500017280.png)

### Giải thích các thực thể:

1.  **users**: Lưu trữ thông tin tài khoản người dùng (Email, Password, Name).
2.  **user_profiles**: Lưu thông tin bổ sung (Phone, Preferences, Avatar). Quan hệ 1-1 với `users`.
3.  **travel_companions**: Lưu mối quan hệ bạn bè/đồng hành. Quan hệ N-N (được chuẩn hóa).
4.  **trips**: Lưu thông tin chuyến đi (Tên, Điểm đến, Ngày). Quan hệ 1-N với `users`.
5.  **bookings**: Lưu chi tiết đặt phòng/vé cho chuyến đi. Quan hệ 1-N với `trips`.
6.  **booking_sessions**: Lưu phiên làm việc với AI Agent để đặt phòng.
7.  **messages**: Lưu lịch sử chat trong phiên làm việc (giữa User, AI và Khách sạn qua Zalo).
