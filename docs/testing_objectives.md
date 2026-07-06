# 5.1. Mục tiêu kiểm thử

Mục tiêu chính của kiểm thử là để phát hiện lỗi, kiểm tra chương trình thỏa mãn các yêu cầu được đặt ra hay không.

### Mục tiêu cần đạt được:

**1. Kiểm thử tính khả dụng:**
*   Nội dung chính xác, không có lỗi chính tả hoặc ngữ pháp.
*   Tất cả thông báo lỗi phải chính xác, dễ hiểu và khớp với nhãn trường (Field Label).
*   Liên kết đến trang chủ (Home) phải tồn tại và hoạt động ở mỗi trang con.
*   Hệ thống phải thông báo rõ ràng cho người dùng về bất kỳ hoạt động nào vừa được cập nhật hoặc thay đổi (Ví dụ: Trạng thái Booking, Tin nhắn mới).

**2. Kiểm thử chức năng:**
*   Kiểm tra tính duy nhất của dữ liệu định danh: Số điện thoại, Email, Tên tài khoản (đảm bảo không cho phép đăng ký trùng).
*   Kiểm tra toàn bộ quy trình nghiệp vụ cốt lõi: **Tìm kiếm, Đàm phán giá với AI, Đặt phòng và Quản lý Chuyến đi**.
*   Kiểm tra tất cả đường liên kết (Hyperlinks/Buttons) xem có hoạt động không và có chuyển hướng đến đúng màn hình mong đợi hay không.

**3. Kiểm thử cơ sở dữ liệu:**
*   Dữ liệu hiển thị trên giao diện (Frontend) phải đồng bộ tuyệt đối với dữ liệu lưu trong Cơ sở dữ liệu (Backend).
*   Kiểm tra tính toàn vẹn và hợp lệ của dữ liệu bằng cách thử chèn các dữ liệu sai định dạng (Invalid Data) để đảm bảo DB từ chối đúng cách.

**4. Kiểm thử tính bảo mật:**
*   Thông tin nhạy cảm của người dùng (đặc biệt là Mật khẩu) phải được mã hóa một chiều (Hashing) trong Database.
*   Người dùng chưa đăng nhập (Anonymous) hoặc người ngoài hệ thống không thể truy cập vào các trang nội bộ thông qua đường dẫn URL trực tiếp.
