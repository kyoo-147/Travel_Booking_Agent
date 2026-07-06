# 5.3. CHI TIẾT KỊCH BẢN KIỂM THỬ CHỨC NĂNG (FUNCTIONAL TESTING)

Dưới đây là chi tiết các bước thực hiện, dữ liệu kiểm thử và kết quả của từng chức năng cốt lõi.

### Bảng 5.1.1: Kiểm thử chức năng Đăng ký tài khoản mới
| STT | Trường hợp kiểm thử | Các bước kiểm thử | Kết quả mong đợi | Kết quả hiện tại | Ngày kiểm thử |
|:---:|---|---|---|:---:|:---:|
| 1 | Bỏ trống các trường | 1. Truy cập trang Đăng ký.<br>2. Không điền thông tin nào.<br>3. Nhấn nút "Đăng ký". | Hệ thống báo lỗi đỏ tại các trường bắt buộc, yêu cầu nhập thông tin. | Thành công | 09/01/2026 |
| 2 | Nhập sai định dạng email | 1. Truy cập trang Đăng ký.<br>2. Nhập Email: `thanh232002gmail.com` (Thiếu @).<br>3. Các trường khác nhập đúng.<br>4. Nhấn nút "Đăng ký". | Hệ thống báo lỗi định dạng Email không hợp lệ. | Thành công | 09/01/2026 |
| 3 | Mật khẩu không khớp | 1. Nhập Mật khẩu: `123456`<br>2. Nhập Xác nhận mật khẩu: `654321`.<br>3. Nhấn Đăng ký. | Báo lỗi "Mật khẩu xác nhận không trùng khớp". | Thành công | 09/01/2026 |
| 4 | Đăng ký thành công | **Bước 1:** Truy cập trang đăng ký.<br>**Bước 2:** Nhập đầy đủ thông tin:<br>- Họ tên: Nguyễn Văn A<br>- Email: `nguyenvana@test.com`<br>- SĐT: 0987654321<br>- Mật khẩu: `Test@1234`<br>- Xác nhận MK: `Test@1234`<br>**Bước 3:** Nhấn nút Đăng ký. | **Bước 1:** Form submit thành công.<br>**Bước 2:** Chuyển hướng về trang Đăng nhập.<br>**Bước 3:** Thông báo "Đăng ký thành công, vui lòng đăng nhập". | Thành công | 09/01/2026 |

<br>

### Bảng 5.1.2: Kiểm thử chức năng Đăng nhập & Đăng xuất
| STT | Trường hợp kiểm thử | Các bước kiểm thử | Kết quả mong đợi | Kết quả hiện tại | Ngày kiểm thử |
|:---:|---|---|---|:---:|:---:|
| 1 | Sai mật khẩu quá 5 lần | 1. Nhập Email: `nguyenvana@test.com`<br>2. Nhập sai pass 5 lần liên tiếp.<br>3. Nhấn Đăng nhập. | Hệ thống khóa tài khoản tạm thời trong 15 phút. Thông báo "Tài khoản bị khóa". | Thành công | 09/01/2026 |
| 2 | Đăng nhập thành công | 1. Nhập Email: `nguyenvana@test.com`<br>2. Nhập Mật khẩu: `Test@1234`<br>3. Nhấn Đăng nhập. | Chuyển hướng vào Dashboard chính. Hiển thị đúng tên "Nguyễn Văn A". | Thành công | 09/01/2026 |
| 3 | Đăng xuất | 1. Tại Dashboard, nhấn Avatar -> Đăng xuất.<br>2. Xác nhận. | Xóa Token lưu trong Browser. Chuyển về trang Login. Không thể Back lại trang cũ. | Thành công | 09/01/2026 |

<br>

### Bảng 5.1.3: Kiểm thử chức năng Cập nhật Profile cá nhân
| STT | Trường hợp kiểm thử | Các bước kiểm thử | Kết quả mong đợi | Kết quả hiện tại | Ngày kiểm thử |
|:---:|---|---|---|:---:|:---:|
| 1 | Cập nhật Avatar | 1. Vào trang Profile.<br>2. Nhấn nút Camera.<br>3. Upload file ảnh `avatar.jpg` (2MB).<br>4. Nhấn Lưu. | Ảnh đại diện thay đổi ngay lập tức. Thông báo "Cập nhật thành công". | Thành công | 09/01/2026 |
| 2 | Đổi ngân sách mặc định | 1. Nhập Ngân sách tối thiểu: `500,000`<br>2. Nhập Ngân sách tối đa: `5,000,000`<br>3. Lưu thay đổi. | Giá trị được lưu lại. Các lần tìm phòng sau sẽ dùng range giá này làm mặc định. | Thành công | 09/01/2026 |

<br>

### Bảng 5.1.4: Kiểm thử chức năng Kết nối Zalo
| STT | Trường hợp kiểm thử | Các bước kiểm thử | Kết quả mong đợi | Kết quả hiện tại | Ngày kiểm thử |
|:---:|---|---|---|:---:|:---:|
| 1 | Quét mã QR kết nối | 1. Vào Settings -> Kết nối Zalo.<br>2. Hệ thống hiển thị QR Code.<br>3. Dùng App Zalo trên điện thoại quét mã.<br>4. Nhấn "Đồng ý" trên điện thoại. | Trạng thái chuyển từ "Chưa kết nối" -> "Đã kết nối: Nguyễn Văn A (Zalo)". | Thành công | 09/01/2026 |
| 2 | Ngắt kết nối | 1. Nhấn nút "Hủy liên kết".<br>2. Xác nhận. | Trạng thái quay về "Chưa kết nối". AI không thể gửi tin nhắn nữa. | Thành công | 09/01/2026 |

<br>

### Bảng 5.1.5: Kiểm thử chức năng Yêu cầu đặt phòng với AI
| STT | Trường hợp kiểm thử | Các bước kiểm thử | Kết quả mong đợi | Kết quả hiện tại | Ngày kiểm thử |
|:---:|---|---|---|:---:|:---:|
| 1 | Nhập thiếu ngày đi/về | 1. Nhập prompt: "Tìm khách sạn ở Đà Lạt".<br>2. Gửi yêu cầu. | AI hỏi lại: "Bạn dự định đi vào ngày nào và ở bao nhiêu đêm?". Không tự ý tìm bừa. | Thành công | 09/01/2026 |
| 2 | Yêu cầu hợp lệ đầy đủ | 1. Nhập prompt: "Tìm khách sạn ở Đà Lạt, ngày 15/2 - 17/2, giá khoảng 1 triệu/đêm cho 2 người".<br>2. Gửi yêu cầu. | AI nhận diện đủ 4 thông tin (Điểm đến, Ngày, Giá, Số người). Bắt đầu tìm kiếm khách sạn. | Thành công | 09/01/2026 |

<br>

### Bảng 5.1.6: Kiểm thử quy trình AI đàm phán với khách sạn
| STT | Trường hợp kiểm thử | Các bước kiểm thử | Kết quả mong đợi | Kết quả hiện tại | Ngày kiểm thử |
|:---:|---|---|---|:---:|:---:|
| 1 | AI gửi tin nhắn mở đầu | **Bước 1:** AI tìm thấy KS "Dalat Palace" (SĐT: 098xxx).<br>**Bước 2:** AI tự động gửi tin Zalo: "Chào bạn, mình muốn hỏi phòng ngày 15/2...". | Tin nhắn xuất hiện trên Zalo KS. Nội dung đúng form mẫu, lịch sự. | Thành công | 09/01/2026 |
| 2 | Xử lý KS báo hết phòng | 1. KS trả lời Zalo: "Hôm đó bên mình full phòng rồi bạn nhé".<br>2. AI đọc tin nhắn. | AI cập nhật trạng thái Booking là "Failed". Thông báo cho User: "KS Dalat Palace đã hết phòng". | Thành công | 09/01/2026 |
| 3 | Xử lý KS báo giá và chốt | 1. KS trả lời: "Còn phòng Double, giá 800k nhé".<br>2. AI phân tích giá (800k < 1tr ngân sách). | AI trả lời KS: "Dạ vâng, mình chốt phòng này". Sau đó AI tạo yêu cầu thanh toán cho User. | Thành công | 09/01/2026 |

<br>

### Bảng 5.1.7: Kiểm thử chức năng Phê duyệt thanh toán (Payment)
| STT | Trường hợp kiểm thử | Các bước kiểm thử | Kết quả mong đợi | Kết quả hiện tại | Ngày kiểm thử |
|:---:|---|---|---|:---:|:---:|
| 1 | User phê duyệt | 1. User nhận thông báo "Cần xác nhận thanh toán 800k".<br>2. Nhấn "Đồng ý". | AI gửi tin nhắn cho KS: "Bạn cho mình xin số tài khoản nhé". Trạng thái chuyển sang "Waiting Transfer". | Thành công | 09/01/2026 |
| 2 | User từ chối | 1. Nhấn "Hủy bỏ". | AI nhắn tin cho KS: "Xin lỗi bạn, mình đổi kế hoạch nên hủy nhé". Hủy Booking. | Thành công | 09/01/2026 |

<br>

### Bảng 5.1.8: Kiểm thử chức năng Tạo chuyến đi (Trip Creation)
| STT | Trường hợp kiểm thử | Các bước kiểm thử | Kết quả mong đợi | Kết quả hiện tại | Ngày kiểm thử |
|:---:|---|---|---|:---:|:---:|
| 1 | Tự động tạo Trip sau Booking | 1. Hoàn tất Booking KS Đà Lạt.<br>2. Vào mục "Chuyến đi của tôi". | Xuất hiện Trip mới tên "Chuyến đi Đà Lạt". Trong đó có Booking KS đã đặt. | Thành công | 09/01/2026 |
| 2 | Tính tổng chi phí | 1. Trip có 1 Hotel (800k) + 1 Vé máy bay (2tr).<br>2. Xem tab Ngân sách. | Tổng chi phí hiển thị chính xác: 2,800,000 VNĐ. Biểu đồ tròn hiển thị đúng tỷ lệ. | Thành công | 09/01/2026 |

<br>

### Bảng 5.1.9: Kiểm thử chức năng Quản lý Người đồng hành (Companion)
| STT | Trường hợp kiểm thử | Các bước kiểm thử | Kết quả mong đợi | Kết quả hiện tại | Ngày kiểm thử |
|:---:|---|---|---|:---:|:---:|
| 1 | Tìm kiếm bạn bè | 1. Vào mục Bạn đồng hành.<br>2. Nhập Email bạn cần tìm: `friend@test.com`.<br>3. Nhấn Tìm. | Hiển thị đúng Avatar và Tên của người bạn đó. Nút "Kết bạn" sáng lên. | Thành công | 09/01/2026 |

<br>

### Bảng 5.1.10: Kiểm thử chức năng Mời bạn bè tham gia Trip
| STT | Trường hợp kiểm thử | Các bước kiểm thử | Kết quả mong đợi | Kết quả hiện tại | Ngày kiểm thử |
|:---:|---|---|---|:---:|:---:|
| 1 | Mời vào chuyến đi | 1. Vào chi tiết Trip "Đà Lạt".<br>2. Nhấn "Mời thành viên".<br>3. Chọn `friend@test.com`.<br>4. Gửi lời mời. | Người bạn nhận được thông báo. Trip hiển thị "1 người tham gia (chờ duyệt)". | Thành công | 09/01/2026 |

<br>

### Bảng 5.1.11: Kiểm thử chức năng AI Research (Nghiên cứu điểm đến)
| STT | Trường hợp kiểm thử | Các bước kiểm thử | Kết quả mong đợi | Kết quả hiện tại | Ngày kiểm thử |
|:---:|---|---|---|:---:|:---:|
| 1 | Tìm quán ăn ngon | 1. Nhập: "Tìm quán lẩu gà lá é ngon ở Đà Lạt gần chợ".<br>2. Enter. | AI trả về danh sách 3-5 quán (vd: Tao Ngộ, 668) kèm địa chỉ và review ngắn gọn. | Thành công | 09/01/2026 |

<br>

### Bảng 5.1.12: Kiểm thử chức năng Chat tự do với AI Assistant
| STT | Trường hợp kiểm thử | Các bước kiểm thử | Kết quả mong đợi | Kết quả hiện tại | Ngày kiểm thử |
|:---:|---|---|---|:---:|:---:|
| 1 | Hỏi thời tiết | 1. Chat: "Thời tiết Đà Lạt tuần tới thế nào?". | Trả về dự báo nhiệt độ, mưa/nắng cho đúng khoảng thời gian yêu cầu. | Thành công | 09/01/2026 |
