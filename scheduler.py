"""
Scheduler — chạy ngầm (cron job) để quét các dịch vụ sắp đến hạn và gửi cảnh báo.

Usage:
    python scheduler.py

Có thể tích hợp với Task Scheduler (Windows) hoặc cron (Linux/macOS)
để chạy định kỳ mỗi ngày.
"""
import sys
from pathlib import Path
from datetime import date, timedelta

sys.path.insert(0, str(Path(__file__).parent / 'src'))

from subscriptrack import create_app
from subscriptrack.extensions import db
from subscriptrack.models import Subscription, Notification, User
from subscriptrack.utils import get_next_billing_date


def check_upcoming_bills():
    """Quét tất cả subscription sắp đến hạn trong vòng 3 ngày và tạo notification."""
    app = create_app()
    with app.app_context():
        today = date.today()
        upcoming = today + timedelta(days=3)

        subscriptions = Subscription.query.all()
        for sub in subscriptions:
            next_date = get_next_billing_date(sub.start_date, sub.cycle)
            if today <= next_date <= upcoming:
                # Kiểm tra xem đã gửi notification chưa
                existing = Notification.query.filter_by(
                    user_id=sub.user_id,
                    subscription_id=sub.id,
                ).filter(
                    Notification.sent_at >= today.strftime('%Y-%m-%d')
                ).first()

                if not existing:
                    user = User.query.get(sub.user_id)
                    notification = Notification(
                        user_id=sub.user_id,
                        subscription_id=sub.id,
                        message=(
                            f'Dịch vụ "{sub.name}" sắp đến hạn thanh toán '
                            f'({sub.amount:,.0f} {sub.currency}) vào ngày '
                            f'{next_date.strftime("%d/%m/%Y")}.'
                        ),
                    )
                    db.session.add(notification)
                    db.session.commit()
                    print(f'[NOTIFICATION] Đã tạo cảnh báo cho user #{sub.user_id}: {sub.name}')

        print('[SCHEDULER] Hoàn tất kiểm tra.')


if __name__ == '__main__':
    check_upcoming_bills()
