from datetime import datetime, timedelta
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash
from subscriptrack.extensions import db
from subscriptrack.utils import add_months


class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(200), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    subscriptions = db.relationship('Subscription', backref='owner', lazy=True)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def __repr__(self):
        return f'<User {self.username}>'


class Subscription(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    currency = db.Column(db.String(10), nullable=False, default='VND')
    cycle = db.Column(db.String(20), nullable=False, default='monthly')
    category = db.Column(db.String(50), nullable=False, default='Khác')
    start_date = db.Column(db.Date, nullable=False)
    duration = db.Column(db.Integer, nullable=True, default=None)
    duration_unit = db.Column(db.String(10), nullable=True, default=None)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

    def __repr__(self):
        return f'<Subscription {self.name}>'

    @property
    def end_date(self):
        """Calculate subscription end date based on duration if set."""
        if self.duration and self.duration_unit:
            if self.duration_unit == 'monthly':
                return add_months(self.start_date, self.duration)
            elif self.duration_unit == 'yearly':
                return add_months(self.start_date, self.duration * 12)
            elif self.duration_unit == 'weekly':
                return self.start_date + timedelta(weeks=self.duration)
        return None


class Notification(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    subscription_id = db.Column(db.Integer, db.ForeignKey('subscription.id'), nullable=False)
    message = db.Column(db.String(255), nullable=False)
    sent_at = db.Column(db.DateTime, default=datetime.utcnow)
    is_read = db.Column(db.Boolean, default=False)

    user = db.relationship('User', backref='notifications')
    subscription = db.relationship('Subscription', backref='notifications')

    def __repr__(self):
        return f'<Notification for {self.user_id}>'
