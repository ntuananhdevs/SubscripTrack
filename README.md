<p align="center">
  <h1 align="center">SubscripTrack</h1>
</p>

<p align="center">
  Quản lý & Cảnh báo "Chảy máu tiền" từ các dịch vụ (Netflix, Spotify, iCloud...)
</p>

---

## About SubscripTrack

Ai trong chúng ta cũng có vài ba dịch vụ đăng ký theo tháng/năm và rất dễ quên, dẫn đến việc bị tự động trừ tiền vô tội vạ. SubscripTrack ra đời để giúp bạn kiểm soát chi tiêu, theo dõi các gói đăng ký và nhắc nhở trước khi bị trừ tiền.

## Core Features

- **Quản lý thông tin:** Lưu trữ chi tiết thông tin dịch vụ (Tên, số tiền, chu kỳ, ngày bắt đầu, thẻ thanh toán).
- **Đếm ngược (Countdown):** Tự động tính toán số ngày còn lại cho từng dịch vụ.
- **Thống kê chi phí:** Tính toán "Tổng số tiền phải trả trong tháng này" dựa trên ngày hiện tại.
- **Quy đổi tiền tệ:** Xử lý quy đổi tiền tệ cơ bản (USD, VND).
- **Giao diện cảnh báo:** Render danh sách bằng Jinja qua các thẻ dịch vụ:
  - Dưới 3 ngày: Chuyển sang màu đỏ kèm hiệu ứng nhấp nháy cảnh báo.
  - Sắp đến hạn: Màu vàng nhắc nhở.
  - Còn xa: Màu xanh an toàn.

## Getting Started

Dự án được xây dựng bằng Python và Flask.

1. Clone repository:
```bash
git clone https://github.com/ntuananhdevs/SubscripTrack.git
cd SubscripTrack
```

2. Cài đặt thư viện:
```bash
pip install -r requirements.txt
```

3. Khởi chạy ứng dụng:
```bash
python app.py
```
Sau đó truy cập `http://127.0.0.1:5000` trên trình duyệt.

## Technical Challenges

- Thuật toán tính ngày và chu kỳ lặp lại cho các gói dịch vụ đa dạng.
- Quản lý logic thời gian thực một cách chính xác.
- Kết hợp giữa Python backend và Jinja2 frontend để thay đổi trạng thái UI mượt mà.


```
SubscripTrack/
│
├── src/
│   └── subscriptrack/
│       ├── __init__.py         # Khởi tạo Flask app & gom các Blueprint
│       ├── config.py           # Đọc file .env, cấu hình MAIL_SERVER, SECRET_KEY
│       ├── models.py           # Định nghĩa bảng User, Subscription, Notification
│       ├── extensions.py       # Khởi tạo db (SQLAlchemy), mail (Flask-Mail), login_manager
│       │
│       ├── blueprints/         # Chia theo tính năng chính của app
│       │   ├── auth/           # Đăng nhập, đăng ký, quên mật khẩu
│       │   │   └── routes.py
│       │   ├── dashboard/      # Trang tổng quan, thống kê tiền nong bằng biểu đồ
│       │   │   └── routes.py
│       │   └── subscriptions/  # CRUD các dịch vụ (Netflix, Spotify...)
│       │       └── routes.py
│       │
│       ├── templates/          # Giao diện hiển thị (Jinja2 HTML)
│       │   ├── base.html       # Sidebar + Navbar chung
│       │   ├── auth/           # login.html, register.html
│       │   ├── dashboard/      # index.html (hiển thị biểu đồ)
│       │   └── subs/           # add.html, list.html, edit.html
│       │
│       └── static/             # Chứa file CSS (Tailwind/Bootstrap), JS (vẽ biểu đồ)
│           ├── css/
│           └── js/             # File JS dùng Chart.js để vẽ biểu đồ chi tiêu
│
├── .env                        # Chứa SECRET_KEY, DATABASE_URL, cấu hình SMTP gửi Mail
├── pyproject.toml              # Quản lý thư viện (flask, flask-sqlalchemy, celery...)
├── run.py                      # Chạy ứng dụng (python run.py)
└── scheduler.py                # File phụ để chạy ngầm (cron job) quét xem ai sắp đến hạn để gửi alert

```