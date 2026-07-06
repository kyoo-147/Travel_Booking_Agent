# 5.4. CHI TIẾT KỊCH BẢN KIỂM THỬ KHẢ DỤNG (USABILITY TESTING)

Đánh giá trải nghiệm người dùng, độ phản hồi và tính thân thiện của giao diện.

### Bảng 5.2.1: Kiểm thử tính dễ sử dụng của Form đặt phòng
| STT | Trường hợp kiểm thử | Các bước kiểm thử | Kết quả mong đợi | Kết quả hiện tại | Ngày kiểm thử |
|:---:|---|---|---|:---:|:---:|
| 1 | Tab chuyển đổi dịch vụ | 1. Tại khung chat Booking.<br>2. Nhấn tab "Khách sạn".<br>3. Nhấn tab "Vé máy bay". | Giao diện form thay đổi mượt mà, hiển thị đúng các trường nhập liệu tương ứng (Ngày đi/về vs Check-in/out). Không bị lag giật. | Thành công | 09/01/2026 |
| 2 | Gợi ý địa điểm thông minh | 1. Nhập trường "Điểm đến".<br>2. Gõ "Da L". | Dropdown hiển thị gợi ý: "Đà Lạt, Lâm Đồng", "Đà Lạt Palace"... Tốc độ hiển thị < 0.5s. | Thành công | 09/01/2026 |
| 3 | Reset Form | 1. Điền thông tin vào form.<br>2. Nhấn nút "Làm mới" (Reset). | Tất cả các trường trở về trạng thái trống/mặc định. | Thành công | 09/01/2026 |

<br>

### Bảng 5.2.2: Kiểm thử độ phản hồi của giao diện Chat (Responsiveness)
| STT | Trường hợp kiểm thử | Các bước kiểm thử | Kết quả mong đợi | Kết quả hiện tại | Ngày kiểm thử |
|:---:|---|---|---|:---:|:---:|
| 1 | Loading State khi AI nghĩ | 1. Gửi tin nhắn dài.<br>2. Quan sát biểu tượng loading. | Hiển thị "AI is typing..." hoặc icon 3 chấm động. Giúp người dùng biết hệ thống đang xử lý. | Thành công | 09/01/2026 |
| 2 | Auto Scroll | 1. Chat liên tục nhiều tin nhắn.<br>2. Tin nhắn mới xuất hiện. | Thanh cuộn (Scrollbar) tự động trượt xuống tin nhắn mới nhất. Người dùng không phải cuộn thủ công. | Thành công | 09/01/2026 |
| 3 | Hiển thị Markdown | 1. AI trả về danh sách có Bullet point và In đậm.<br>2. Quan sát hiển thị. | Văn bản được format đẹp, dễ đọc, không hiển thị ký tự mã nguồn thô (như ** hay -). | Thành công | 09/01/2026 |

<br>

### Bảng 5.2.3: Kiểm thử trải nghiệm người dùng trên Mobile
| STT | Trường hợp kiểm thử | Các bước kiểm thử | Kết quả mong đợi | Kết quả hiện tại | Ngày kiểm thử |
|:---:|---|---|---|:---:|:---:|
| 1 | Layout trên Mobile (iPhone 14) | 1. Mở web trên trình duyệt điện thoại.<br>2. Quan sát Menu và Form. | Menu tự động thu gọn vào Hamburger Button. Các nút bấm to, dễ chạm. Không có thanh cuộn ngang (Horizontal scroll). | Thành công | 09/01/2026 |
| 2 | Bàn phím ảo che nội dung | 1. Nhấn vào ô nhập chat.<br>2. Bàn phím ảo bật lên. | Khung chat tự động đẩy lên trên, không bị bàn phím che mất nội dung đang gõ. | Thành công | 09/01/2026 |

<br>

### Bảng 5.2.4: Kiểm thử thông báo thời gian thực (Real-time Notification)
| STT | Trường hợp kiểm thử | Các bước kiểm thử | Kết quả mong đợi | Kết quả hiện tại | Ngày kiểm thử |
|:---:|---|---|---|:---:|:---:|
| 1 | Toast Notification | 1. Thực hiện hành động thành công (Lưu Trip).<br>2. Quan sát góc màn hình. | Xuất hiện thông báo Toast màu xanh: "Lưu thành công". Tự động biến mất sau 3s. | Thành công | 09/01/2026 |
| 2 | Thông báo lỗi | 1. Cố ý gây lỗi mạng (Ngắt Wifi).<br>2. Gửi tin nhắn. | Xuất hiện thông báo Toast màu đỏ: "Mất kết nối Internet". Nút gửi bị vô hiệu hóa. | Thành công | 09/01/2026 |
