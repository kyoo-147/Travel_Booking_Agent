# HỆ THỐNG CƠ SỞ DỮ LIỆU ĐẦY ĐỦ (FULL DATABASE SCHEMA)

Tài liệu thiết kế chi tiết cơ sở dữ liệu (PostgreSQL) cho hệ thống Travel Agent.
Tổng hợp từ toàn bộ Source Code Entity (Realtime).

---

## 1. NHÓM QUẢN LÝ NGƯỜI DÙNG (USER DOMAIN)

### 1.1. Bảng `user_profiles`
Lưu trữ thông tin định danh và cấu hình chính của người dùng.

| Field Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| **`id`** | `uuid` | **PK**, Generated | ID duy nhất của người dùng. |
| `email` | `varchar` | Unique, Not Null | Email đăng nhập. |
| `phone` | `varchar` | Nullable | Số điện thoại cá nhân. |
| `firstName` | `varchar` | Nullable | Tên. |
| `lastName` | `varchar` | Nullable | Họ. |
| `avatar` | `varchar` | Nullable | URL ảnh đại diện. |
| `dateOfBirth` | `date` | Nullable | Ngày sinh. |
| `preferences` | `jsonb` | Nullable | Cấu hình: `{currency, language, timezone, notifications}`. |
| `defaultBudgetMin` | `decimal` | Precision(10,2) | Ngân sách chi tiêu min mặc định. |
| `defaultBudgetMax` | `decimal` | Precision(10,2) | Ngân sách chi tiêu max mặc định. |
| `isActive` | `boolean` | Default: true | Trạng thái kích hoạt. |
| `createdAt` | `timestamp` | Default: now() | Ngày tạo. |
| `updatedAt` | `timestamp` | Default: now() | Ngày cập nhật cuối. |

### 1.2. Bảng `travel_preferences`
Lưu sở thích du lịch chi tiết để AI phân tích.

| Field Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| **`id`** | `uuid` | **PK**, Generated | ID sở thích. |
| `userProfileId` | `uuid` | **FK** -> user_profiles | Thuộc về user nào. |
| `favoriteDestinations` | `varchar[]` | Array | Các điểm đến yêu thích. |
| `travelStyle` | `varchar[]` | Array | Phong cách: `adventure`, `relax`, `luxury`... |
| `accommodationType` | `varchar[]` | Array | Loại ở: `hotel`, `resort`, `homestay`. |
| `foodPreferences` | `varchar[]` | Array | Sở thích ăn uống. |
| `transportation` | `varchar[]` | Array | Phương tiện ưa thích. |
| `activityLevel` | `varchar` | Nullable | Mức độ vận động (Low/Med/High). |

### 1.3. Bảng `travel_companions`
Danh sách bạn bè / người thân đi cùng.

| Field Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| **`id`** | `uuid` | **PK**, Generated | ID quan hệ. |
| `userId` | `uuid` | **FK** -> user_profiles | Người dùng chủ (Owner). |
| `companionId` | `uuid` | **FK** -> user_profiles | Người được kết nối. |
| `relationship` | `enum` | `'family','friend','colleague'` | Loại quan hệ. |
| `status` | `enum` | `'pending','connected','blocked'` | Trạng thái kết nối. |
| `sharedTrips` | `integer` | Default: 0 | Số chuyến đi đã đi chung. |
| `aiPersonalNotes` | `jsonb` | Nullable | Ghi chú AI: `{compatibilityScore, conflictPoints}`. |

### 1.4. Bảng `companion_invitations`
Quản lý lời mời kết bạn.

| Field Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| **`id`** | `uuid` | **PK**, Generated | ID lời mời. |
| `senderId` | `uuid` | **FK** -> user_profiles | Người gửi. |
| `receiverId` | `uuid` | **FK** -> user_profiles | Người nhận. |
| `status` | `enum` | `'pending','accepted','rejected'` | Trạng thái. |
| `message` | `text` | Nullable | Lời nhắn kèm theo. |

---

## 2. NHÓM QUẢN LÝ CHUYẾN ĐI (TRIP DOMAIN)

### 2.1. Bảng `trips`
Thực thể trung tâm, quản lý toàn bộ một chuyến đi.

| Field Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| **`id`** | `uuid` | **PK**, Generated | ID chuyến đi. |
| `userId` | `uuid` | Not Null | ID người tạo (Liên kết Logical với User Service). |
| `name` | `varchar` | Not Null | Tên chuyến đi (ví dụ: "Đà Lạt 2026"). |
| `status` | `enum` | `'draft','confirmed','completed','cancelled'` | Trạng thái. |
| `startDate` | `timestamp` | Not Null | Ngày đi. |
| `endDate` | `timestamp` | Not Null | Ngày về. |
| `destination` | `jsonb` | Not Null | `{country, city, region, coordinates}`. |
| `participants` | `integer` | Default: 1 | Số người tham gia. |
| `budget` | `jsonb` | Nullable | `{total, currency, breakdown: {flights, stay...}}`. |
| `notes` | `text` | Nullable | Ghi chú chung. |

### 2.2. Bảng `bookings`
Các dịch vụ đặt chỗ cụ thể trong chuyến đi (Phòng, Vé, Tour).

| Field Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| **`id`** | `uuid` | **PK**, Generated | ID booking. |
| `tripId` | `uuid` | **FK** -> trips | Thuộc chuyến đi nào. |
| `providerId` | `uuid` | Not Null | ID nhà cung cấp (khách sạn, hãng bay). |
| `type` | `enum` | `'hotel','flight','activity','transport'` | Loại dịch vụ. |
| `status` | `enum` | `'pending','confirmed','cancelled','failed'` | Trạng thái đặt chỗ. |
| `providerBookingRef`| `varchar` | Nullable | Mã đặt chỗ phía đối tác. |
| `details` | `jsonb` | Not Null | Chi tiết vé/phòng: `{roomType, airlines...}`. |
| `price` | `jsonb` | Not Null | Chi tiết giá: `{amount, currency, taxes}`. |

### 2.3. Bảng `booking_conversations`
Lịch sử đàm phán Zalo giữa AI và Khách sạn (để tạo ra Booking).

| Field Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| **`id`** | `uuid` | **PK**, Generated | ID hội thoại. |
| `tripId` | `uuid` | **FK** -> trips | Gắn với chuyến đi nào. |
| `messages` | `jsonb` | Not Null | Array tin nhắn Zalo: `[{sender, content, time}]`. |
| `sentiment` | `varchar` | Nullable | Cảm xúc khách hàng (Positive/Negative). |

### 2.4. Bảng `itineraries`
Lịch trình chi tiết (Container chứa các items).

| Field Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| **`id`** | `uuid` | **PK**, Generated | ID lịch trình. |
| `tripId` | `uuid` | **FK** -> trips | Thuộc chuyến đi nào. |

### 2.5. Bảng `itinerary_items`
Từng mục hoạt động cụ thể trong lịch trình.

| Field Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| **`id`** | `uuid` | **PK**, Generated | ID mục hoạt động. |
| `itineraryId` | `uuid` | **FK** -> itineraries | Thuộc lịch trình nào. |
| `bookingId` | `uuid` | **FK** -> bookings (Optional) | Link tới booking (nếu là Check-in/Bay). |
| `type` | `enum` | `'move','stay','eat','visit','activity'` | Loại hoạt động. |
| `startTime` | `timestamp` | Not Null | Giờ bắt đầu. |
| `endTime` | `timestamp` | Not Null | Giờ kết thúc. |
| `location` | `jsonb` | Not Null | `{name, address, coordinates}`. |
| `notes` | `text` | Nullable | Ghi chú hoạt động. |

---

## 3. NHÓM AI CHAT & HỖ TRỢ (CHAT DOMAIN)

### 3.1. Bảng `chat_sessions`
Các phiên trò chuyện giữa User và AI Agent.

| Field Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| **`id`** | `uuid` | **PK**, Generated | ID phiên chat. |
| `userId` | `uuid` | Index | ID người dùng. |
| `title` | `varchar` | Nullable | Tiêu đề đoạn chat (AI tự gen). |
| `metadata` | `jsonb` | Nullable | Context: `{intent, currentTripId, lastAction}`. |

### 3.2. Bảng `chat_messages`
Nội dung tin nhắn trong phiên chat.

| Field Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| **`id`** | `integer` | **PK**, Auto Increment | ID tin nhắn (tuần tự để sort). |
| `sessionId` | `uuid` | **FK** -> chat_sessions | Thuộc phiên nào. |
| `role` | `enum` | `'user','assistant','system'` | Người gửi. |
| `content` | `text` | Not Null | Nội dung chat. |
| `metadata` | `jsonb` | Nullable | `{tokens, usage, processingTime}`. |

---
*Tài liệu được sinh tự động based-on Source Code Entities.*
