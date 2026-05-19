from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class Subscription(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    currency = db.Column(db.String(10), nullable=False, default='VND') # VND or USD
    cycle = db.Column(db.String(20), nullable=False, default='monthly') # monthly or yearly
    start_date = db.Column(db.Date, nullable=False)
    card_name = db.Column(db.String(100), nullable=False)
    
    def __repr__(self):
        return f'<Subscription {self.name}>'
