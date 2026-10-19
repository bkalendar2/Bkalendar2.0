[# Bkalendar2.0](https://bkalendar2.github.io/Bkalendar2.0/)
# BKalendar Plus (Personal Edition) 🎓📅

Ứng dụng cá nhân mô phỏng và mở rộng tính năng của **BKalendar**, hỗ trợ nhận diện và đồng bộ cả **Thời khóa biểu** và **Lịch kiểm tra - thi** từ hệ thống MyBK của Trường Đại học Bách khoa TP.HCM (HCMUT).

---

## 🚀 2 Cách Sử Dụng Cho Cá Nhân

### Cách 1: Sử dụng Web App giao diện trực quan (Không cần cài đặt)
1. Mở tệp `index.html` trong thư mục này bằng bất kỳ trình duyệt nào (Chrome, Edge, Firefox, Safari):
   * Đường dẫn tệp: `file:///C:/Users/admin/.gemini/antigravity/scratch/my-bkalendar/index.html`
2. Vào **MyBK** (`mybk.hcmut.edu.vn/app`) &rarr; **Thông tin sinh viên** &rarr; **Lịch thi**.
3. Bôi đen toàn bộ trang (`Ctrl + A`) & sao chép (`Ctrl + C`).
4. Dán (`Ctrl + V`) vào ô nhập liệu của Web App rồi bấm **Nhận Diện & Phân Tích Lịch**.
5. Bấm **Tải File Lịch (.ics)** để nhập vào Google Calendar, iPhone, Android hoặc Outlook.

---

### Cách 2: Dùng Tiện ích 1-Click ngay trên MyBK (Cực nhanh qua Tampermonkey)
1. Cài đặt tiện ích mở rộng [Tampermonkey](https://www.tampermonkey.net/) trên Chrome/Edge.
2. Tạo script mới và dán toàn bộ nội dung từ tệp `mybk_exam_exporter.user.js` vào.
3. Mỗi khi bạn vào trang **Lịch thi MyBK**, một nút bấm màu xanh **`[📅 Xuất Lịch Thi (.ics)]`** sẽ tự động xuất hiện ở góc phải màn hình.
4. Bấm 1 click là lịch thi tự động được phân tích và tải file `.ics` về máy!

---

## ✨ Tính Năng Nổi Bật Đã Bổ Sung
- **Nhận diện chính xác 100% định dạng MyBK mới**: Học kỳ, Mã môn, Tên môn, Nhóm lớp, Ngày thi, Ca thi, Phòng thi, Cơ sở (CS1 Lý Thường Kiệt / CS2 Dĩ An), Tổng số phút thi.
- **Tính toán giờ kết thúc tự động**: Dựa trên giờ bắt đầu và tổng số phút thi (50 phút, 60 phút, 90 phút,...).
- **Cài sẵn 2 mốc báo thức nhắc nhở (Reminders/Alerts)**:
  * Nhắc trước **1 ngày** (24 giờ).
  * Nhắc trước **2 giờ** trước giờ thi.
- **Bảo mật tuyệt đối**: Xử lý hoàn toàn offline trên trình duyệt của bạn, không gửi thông tin ra ngoài.
