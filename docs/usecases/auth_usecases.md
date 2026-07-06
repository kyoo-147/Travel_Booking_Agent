# USE CASES - AUTH SERVICE

## 3.4.1. Module Xác Thực (Authentication)

---

### 3.4.1.1. UseCase Đăng ký tài khoản mới

| Mục | Nội dung |
|-----|----------|
| **Usecase** | Đăng ký tài khoản mới |
| **Ngữ cảnh** | Quản lý đăng ký tài khoản cho người dùng hệ thống Travel Agent |
| **Mô tả** | Người dùng tạo tài khoản mới để sử dụng các chức năng đặt phòng, quản lý chuyến đi và chat với AI Agent |
| **Tác Nhân** | Khách (Guest) |
| **Sự kiện** | Người dùng truy cập hệ thống và chọn đăng ký tài khoản mới |
| **Kết quả** | Tài khoản được tạo thành công, người dùng được đăng nhập tự động và chuyển đến Dashboard |
| **Luồng sự kiện** | **Actor** | **System** |
| | Người dùng truy cập trang đăng ký | Hệ thống hiển thị form đăng ký với các trường: Email, Mật khẩu, Xác nhận mật khẩu, Họ, Tên |
| | Người dùng nhập thông tin đăng ký | |
| | Người dùng nhấn nút "Đăng ký" | Hệ thống kiểm tra tính hợp lệ của thông tin |
| | | Hệ thống kiểm tra email chưa tồn tại trong hệ thống |
| | | Hệ thống tạo tài khoản mới và mã hóa mật khẩu |
| | | Hệ thống tạo JWT access token và refresh token |
| | | Hệ thống chuyển hướng đến Dashboard |
| **Ngoại lệ** | Email đã tồn tại: Hệ thống báo lỗi "Email đã được sử dụng" và yêu cầu nhập email khác |
| | Mật khẩu không khớp: Hệ thống báo lỗi "Mật khẩu xác nhận không khớp" |
| | Email không đúng định dạng: Hệ thống báo lỗi "Email không hợp lệ" |

---

### 3.4.1.2. UseCase Đăng nhập

| Mục | Nội dung |
|-----|----------|
| **Usecase** | Đăng nhập |
| **Ngữ cảnh** | Quản lý xác thực người dùng cho hệ thống Travel Agent |
| **Mô tả** | Đăng nhập để sử dụng các chức năng đặt phòng, quản lý chuyến đi, chat với AI Agent |
| **Tác Nhân** | Người dùng đã có tài khoản |
| **Sự kiện** | Người dùng truy cập hệ thống và chọn đăng nhập |
| **Kết quả** | Đăng nhập thành công và hiển thị Dashboard với các chức năng của hệ thống |
| **Luồng sự kiện** | **Actor** | **System** |
| | Người dùng chọn mục "Đăng nhập" | Hệ thống hiển thị giao diện đăng nhập |
| | Người dùng nhập Email và Mật khẩu | |
| | Người dùng nhấn nút "Đăng nhập" | Hệ thống kiểm tra thông tin và xác thực |
| | | Nếu hợp lệ, hệ thống tạo JWT access token và refresh token |
| | | Hệ thống lưu tokens vào localStorage |
| | | Hệ thống hiển thị Dashboard và các chức năng |
| **Ngoại lệ** | Người dùng nhập sai tài khoản hoặc mật khẩu, hệ thống báo lỗi và yêu cầu nhập lại |

---

### 3.4.1.3. UseCase Đăng xuất

| Mục | Nội dung |
|-----|----------|
| **Usecase** | Đăng xuất |
| **Ngữ cảnh** | Kết thúc phiên làm việc của người dùng trong hệ thống |
| **Mô tả** | Người dùng đăng xuất khỏi hệ thống để bảo mật thông tin cá nhân |
| **Tác Nhân** | Người dùng đã đăng nhập |
| **Sự kiện** | Người dùng nhấn nút đăng xuất trên thanh navigation |
| **Kết quả** | Phiên đăng nhập kết thúc, người dùng được chuyển về trang đăng nhập |
| **Luồng sự kiện** | **Actor** | **System** |
| | Người dùng nhấn vào avatar/menu người dùng | Hệ thống hiển thị dropdown menu |
| | Người dùng chọn "Đăng xuất" | Hệ thống xóa JWT tokens khỏi localStorage |
| | | Hệ thống ngắt kết nối WebSocket |
| | | Hệ thống chuyển hướng về trang đăng nhập |
| **Ngoại lệ** | Lỗi kết nối mạng: Hệ thống vẫn xóa tokens local và chuyển về trang đăng nhập |

---

### 3.4.1.4. UseCase Xem thông tin profile người dùng

| Mục | Nội dung |
|-----|----------|
| **Usecase** | Xem thông tin profile người dùng |
| **Ngữ cảnh** | Quản lý thông tin cá nhân của người dùng trong hệ thống |
| **Mô tả** | Người dùng xem và quản lý thông tin cá nhân của mình bao gồm họ tên, email, avatar |
| **Tác Nhân** | Người dùng đã đăng nhập |
| **Sự kiện** | Người dùng truy cập trang Profile hoặc nhấn vào avatar |
| **Kết quả** | Hiển thị thông tin chi tiết của người dùng |
| **Luồng sự kiện** | **Actor** | **System** |
| | Người dùng nhấn vào menu "Hồ sơ" hoặc avatar | Hệ thống gọi API GET /auth/profile với JWT token |
| | | Hệ thống lấy thông tin người dùng từ database |
| | | Hệ thống hiển thị trang Profile với thông tin: Avatar, Họ và Tên, Email, Ngày tạo tài khoản |
| **Ngoại lệ** | Token hết hạn: Hệ thống tự động refresh token hoặc yêu cầu đăng nhập lại |
