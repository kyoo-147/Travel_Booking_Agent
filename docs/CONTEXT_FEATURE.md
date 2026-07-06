Bạn đang thiết kế lại trang “User Management” của hệ thống cho tôi.

Hệ thống KHÔNG phải mạng xã hội.
Đây là trợ lý AI du lịch cá nhân, có chức năng social đơn giản để phục vụ việc đi du lịch cùng người khác.

Yêu cầu:
- Chuyển trang “Quản lý người dùng” thành “Người đồng hành du lịch (Travel Companions)”
- Các chức năng social chỉ phục vụ cho việc lên kế hoạch, đi chung và điều phối chuyến đi
- Không thiết kế theo hướng MXH (không feed, không khám phá người lạ, không like/share)
- Mọi kết nối đều có mục đích rõ ràng: đi du lịch cùng nhau


Thiết kế lại giao diện trang thành “Người đồng hành du lịch (Travel Companions)” với phong cách:

- Tập trung vào mối quan hệ cá nhân, không mang tính quản trị hệ thống
- Danh sách người đồng hành hiển thị:
  + Avatar
  + Tên
  + Mối quan hệ (bạn bè / gia đình / đồng nghiệp)
  + Trạng thái (online / đang đi chuyến / chờ xác nhận)
  + Số chuyến đã đi chung

Hành động nhanh:
- Nhắn tin
- Mời tham gia chuyến đi
- Xem hồ sơ đồng hành

Giao diện gọn, hiện đại, chuyên nghiệp, định hướng du lịch.


Không triển khai các tính năng sau:
- Newsfeed
- Story
- Gợi ý bạn bè ngẫu nhiên
- Like, share, comment kiểu mạng xã hội

Tất cả chức năng social phải gắn trực tiếp với chuyến đi hoặc kế hoạch du lịch.
######

Định nghĩa lại khái niệm “Người dùng” thành “Người đồng hành”.

Người đồng hành có thể là:
- Gia đình
- Bạn bè
- Đồng nghiệp

Không còn khái niệm Admin / Moderator / User.

Thay vào đó:
- Người đặt chính (Primary Traveler)
- Người đồng hành (Companion)

Mỗi mối quan hệ đồng hành cần có:
- Trạng thái kết nối (Đã kết nối / Chờ xác nhận / Đã chặn)
- Số chuyến đã đi chung
- Ngày chuyến đi gần nhất
- Ghi nhớ AI về sở thích khi đi cùng nhau
######





Thiết kế chức năng kết nối người đồng hành với yêu cầu sau:

- Cho phép gửi lời mời kết nối qua:
  + Sau khi đã kết bạn, có thể gửi lời mời ngay trên hệ thống, bên trang của người được mời sẽ hiển thị lời mời ở phần thông báo và ở trong trang Travel Companions
  + Email
  + Link mời riêng

- Người được mời phải xác nhận thì mới trở thành người đồng hành
- Kết bạn phải bằng ID được người khác cung cấp và ID chỉ có chủ tài khoản kia đưa cho bạn thì bạn mới có thể biết, nếu không sẽ không có cách nào biết ID của đối phương
- Không có kết bạn ngẫu nhiên
- Không hiển thị danh sách người lạ

Cho phép mời người đồng hành tham gia một chuyến đi cụ thể.
Quy trình bắt buộc:
1. Chấp nhận kết nối
2. Chấp nhận tham gia chuyến đi

Không cho phép tự động thêm vào chuyến đi nếu chưa có xác nhận.








Thiết kế chức năng chat với các giới hạn sau:

- Chỉ chat được với người đồng hành đã kết nối
- Ưu tiên chat theo chuyến đi (group chat theo trip)
- Không có chat công khai
- Không có chat với người lạ

AI cần:
- Tóm tắt nội dung hội thoại liên quan đến chuyến đi
- Nhận diện ý định (ăn uống, di chuyển, lịch trình)
- Đề xuất hành động phù hợp (đặt dịch vụ, điều chỉnh kế hoạch)


Thiết kế chức năng chia sẻ vị trí theo thời gian thực sử dụng Google Maps với các nguyên tắc bắt buộc:

- Chia sẻ vị trí luôn TẮT mặc định
- Chỉ bật được khi chuyến đi đang diễn ra
- Mỗi người phải tự xác nhận cho phép chia sẻ vị trí
- Có nút tắt ngay lập tức bất kỳ lúc nào

Hiển thị trên bản đồ:
- Vị trí hiện tại của từng người đồng hành
- Khoảng cách giữa các thành viên
- Trạng thái online / offline

AI được phép đưa ra gợi ý:
- Điểm gặp nhau
- Cảnh báo tách nhóm
- Các điểm quan tâm gần đó
- Các địa điểm du lịch gần đó


Thiết kế hệ thống AI ghi nhớ hành vi và sở thích theo từng người đồng hành, không dùng chung cho tất cả.

AI ghi nhớ:
- Sở thích ăn uống khi đi cùng người này
- Mức độ di chuyển (ít đi bộ / nhiều)
- Thói quen sinh hoạt khi đi du lịch
- Những điểm dễ phát sinh mâu thuẫn (AI ghi nhận nội bộ)

AI sử dụng dữ liệu này để:
- Cá nhân hóa lịch trình cho từng nhóm
- Đề xuất phương án phù hợp cho tất cả người đi cùng



