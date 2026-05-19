1. SubscripTrack — Quản lý & Cảnh báo "Chảy máu tiền" từ các dịch vụ (Netflix, Spotify, iCloud...)
Ai trong chúng ta cũng có vài ba dịch vụ đăng ký theo tháng/năm và rất dễ quên, dẫn đến việc bị tự động trừ tiền vô tội vạ.

Tính năng cốt lõi: Lưu thông tin dịch vụ (Tên, số tiền, chu kỳ, ngày bắt đầu, thanh toán bằng thẻ nào).

Điểm "khó" (Ngang logic Rắn săn mồi):

Viết logic Python để tự động tính toán số ngày còn lại (Countdown) cho từng dịch vụ.

Tính toán "Tổng số tiền phải trả trong tháng này" dựa trên ngày hiện tại (ví dụ: tháng này có 3 dịch vụ sắp đến hạn thì tổng tiền là bao nhiêu).

Xử lý quy đổi tiền tệ cơ bản nếu bạn dùng cả dịch vụ trả bằng USD và VND.

Cách Jinja thể hiện: Dùng vòng lặp render các thẻ (card) dịch vụ. Nếu dịch vụ còn dưới 3 ngày sẽ đổi sang màu đỏ kèm hiệu ứng nhấp nháy, sắp đến hạn màu vàng, còn xa màu xanh.