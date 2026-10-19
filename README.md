# BKalendar 2.0 🎓📅

> **Bộ công cụ đồng bộ Lịch thi & Thời khóa biểu Trường Đại học Bách Khoa TP.HCM (HCMUT - ĐHQG-HCM) vào Google Calendar chỉ với 1 cú nhấp chuột.**

[![GitHub Pages](https://img.shields.io/badge/Demo-Live%20on%20GitHub%20Pages-2ea44f?style=for-the-badge&logo=github)](https://bkalendar2.github.io/Bkalendar2.0/)
[![HCMUT](https://img.shields.io/badge/HCMUT-B%C3%A1ch%20Khoa%20TP.HCM-0052cc?style=for-the-badge)](https://hcmut.edu.vn)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)
[![Google Calendar API](https://img.shields.io/badge/Google%20Calendar-API%20v3-4285F4?style=for-the-badge&logo=googlecalendar)](https://developers.google.com/calendar)

---

## 🌟 Trải Nghiệm Ngay

👉 **Truy cập trực tuyến:** [https://bkalendar2.github.io/Bkalendar2.0/](https://bkalendar2.github.io/Bkalendar2.0/)  
*(Không cần cài đặt, hoạt động trên mọi thiết bị: Máy tính, iPhone, Android, iPad)*

---

## ✨ Điểm Nổi Bật Của BKalendar 2.0

| Tính năng | BKalendar gốc | BKalendar 2.0 |
| :--- | :---: | :---: |
| **Đồng bộ Lịch thi (Giữa kỳ GK & Cuối kỳ CK)** | ❌ Chưa hỗ trợ |  **Hỗ trợ chuẩn 100%** |
| **Đồng bộ Thời khóa biểu tuần (TKB)** |  Có |  **Có (kế thừa thuật toán gốc)** |
| **Đồng bộ trực tiếp 1-Click lên Google Calendar** |  Có |  **Tích hợp sẵn Client ID dùng ngay** |
| **Tải file `.ics` dự phòng** (nhập vào Apple Calendar/Outlook) |  Có |  **Có** |
| **Hỗ trợ TKB Giảng viên (`tkb.hcmut.edu.vn`)** |  Có |  **Có** |
| **Hỗ trợ TKB Sau đại học (`grad.hcmut.edu.vn`)** |  Có |  **Có** |
| **Hiển thị tinh gọn trên Calendar** (chỉ tên môn & phòng thi/học) | ⚠️ Dài dòng |  **Gọn gàng, sạch đẹp** |
| **Phân màu tự động cho từng môn học** |  Có |  **Bảng màu Google Calendar chính xác** |
| **Bảo mật dữ liệu** | 🔒 100% Client-side | 🔒 **100% Client-side, không thu thập dữ liệu** |

---

## 📖 Hướng Dẫn Sử Dụng

### 1️⃣ Đồng bộ Lịch thi (Kiểm tra Giữa kỳ / Thi Cuối kỳ)
1. Đăng nhập vào [MyBK](https://mybk.hcmut.edu.vn/app) $\rightarrow$ Vào **Hệ thống quản lý** $\rightarrow$ **Sinh viên** $\rightarrow$ **Lịch thi**.
2. Nhấn tổ hợp phím **`Ctrl + A`** (chọn tất cả) rồi **`Ctrl + C`** (sao chép).
3. Mở [BKalendar 2.0](https://bkalendar2.github.io/Bkalendar2.0/), chọn tab **Lịch Thi (GK / CK)** và dán (`Ctrl + V`) vào ô.
4. Bấm **Nhận Diện & Phân Tích Lịch**.
5. Bấm **"Đồng Bộ Trực Tiếp Lên Google Calendar"** $\rightarrow$ Đăng nhập tài khoản Google của bạn $\rightarrow$ Lịch thi sẽ được tự động tạo thành một bộ lịch riêng biệt (ví dụ: `Lịch Thi BK - HK 20261`).

> 💡 **Mẹo:** Mỗi sự kiện thi đều được cài sẵn 2 mốc thông báo: **Nhắc trước 1 ngày** và **Nhắc trước 2 giờ** trước giờ vào phòng thi.

---

### 2️⃣ Đồng bộ Thời khóa biểu tuần (TKB)
1. Đăng nhập vào [MyBK](https://mybk.hcmut.edu.vn/app) $\rightarrow$ **Thông tin sinh viên** $\rightarrow$ **Thời khóa biểu** (hoặc trang ĐKMH).
   *(Đối với Thầy/Cô: mở trang `tkb.hcmut.edu.vn`; Đối với học viên SĐH: mở trang `grad.hcmut.edu.vn`)*
2. Bôi đen toàn bộ trang (`Ctrl + A`) và sao chép (`Ctrl + C`).
3. Dán (`Ctrl + V`) vào BKalendar 2.0 và bấm **Phân Tích**.
4. Chọn **"Đồng Bộ Trực Tiếp TKB Lên Google Calendar"** hoặc tải file `.ics` để sử dụng.

---

### 3️⃣ Tiện ích mở rộng 1-Click trên MyBK (Tampermonkey)
Nếu bạn muốn xuất lịch ngay tại giao diện MyBK mà không cần copy/paste:
1. Cài đặt tiện ích [Tampermonkey](https://www.tampermonkey.net/) trên trình duyệt (Chrome, Brave, Edge, Firefox).
2. Tạo UserScript mới và dán toàn bộ code từ tệp [`mybk_exam_exporter.user.js`](./mybk_exam_exporter.user.js) vào.
3. Khi bạn vào trang Lịch thi hoặc TKB trên MyBK, một nút bấm nổi **`[📅 Xuất Lịch Thi (.ics)]`** sẽ tự động xuất hiện ở góc phải màn hình để xuất lịch tức thì!

---

## 🛠️ Công Nghệ Sử Dụng

* **Giao diện:** HTML5, Modern CSS, [Tailwind CSS](https://tailwindcss.com/), [FontAwesome 6](https://fontawesome.com/).
* **Google Services:** Google Identity Services (GIS SDK), Google Calendar API v3 (REST).
* **Kiến trúc Serverless:** Hoạt động hoàn toàn trên trình duyệt người dùng (Client-side Rendering). Không có máy chủ trung gian, không database lưu trữ dữ liệu cá nhân, đảm bảo an toàn và quyền riêng tư 100%.

---

## 💻 Tự Chạy Trên Máy Cá Nhân (Local Development)

Nếu bạn muốn chỉnh sửa hoặc chạy thử nghiệm trên máy tính:

```bash
# 1. Clone repository về máy
git clone https://github.com/bkalendar2/Bkalendar2.0.git

# 2. Di chuyển vào thư mục
cd Bkalendar2.0

# 3. Khởi chạy server nội bộ (Python 3)
python server.py
# hoặc click đúp vào file start.bat (trên Windows)
```

Mở trình duyệt tại: `http://localhost:3000`

---

## 🤝 Đóng Góp & Lời Cảm Ơn

* Dự án được phát triển và tối ưu dựa trên cảm hứng và thuật toán bộ giải mã thời khóa biểu của [BKalendar](https://github.com/bkalendar).
* Mọi đóng góp, báo lỗi hoặc đề xuất tính năng mới đều được hoan nghênh thông qua [GitHub Issues](https://github.com/bkalendar2/Bkalendar2.0/issues) hoặc Pull Requests.

---

## 📄 Bản Quyền (License)

Dự án được phân phối dưới giấy phép **MIT License**. Bạn được tự do sử dụng, chỉnh sửa và chia sẻ cho mục đích phi thương mại.
