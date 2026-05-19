import os
import calendar
from datetime import date, datetime
from flask import Flask, render_template, request, redirect, url_for
from models import db, Subscription

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///subscriptions.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

USD_TO_VND_RATE = 25000

def add_months(sourcedate, months):
    month = sourcedate.month - 1 + months
    year = sourcedate.year + month // 12
    month = month % 12 + 1
    day = min(sourcedate.day, calendar.monthrange(year, month)[1])
    return date(year, month, day)

def get_next_billing_date(start_date, cycle):
    today = date.today()
    if start_date > today:
        return start_date
        
    if cycle == 'monthly':
        months_diff = (today.year - start_date.year) * 12 + today.month - start_date.month
        next_date = add_months(start_date, months_diff)
        if next_date < today:
            next_date = add_months(start_date, months_diff + 1)
        return next_date
    elif cycle == 'yearly':
        years_diff = today.year - start_date.year
        try:
            next_date = start_date.replace(year=start_date.year + years_diff)
        except ValueError:
            next_date = start_date.replace(year=start_date.year + years_diff, month=2, day=28)
        
        if next_date < today:
            try:
                next_date = start_date.replace(year=start_date.year + years_diff + 1)
            except ValueError:
                next_date = start_date.replace(year=start_date.year + years_diff + 1, month=2, day=28)
        return next_date

@app.route('/')
def index():
    subs = Subscription.query.all()
    today = date.today()
    
    enriched_subs = []
    total_vnd_this_month = 0
    
    for sub in subs:
        next_date = get_next_billing_date(sub.start_date, sub.cycle)
        days_remaining = (next_date - today).days
        
        # Check if billing is in this month
        if next_date.month == today.month and next_date.year == today.year:
            if sub.currency == 'USD':
                total_vnd_this_month += sub.amount * USD_TO_VND_RATE
            else:
                total_vnd_this_month += sub.amount
                
        enriched_subs.append({
            'id': sub.id,
            'name': sub.name,
            'amount': sub.amount,
            'currency': sub.currency,
            'cycle': sub.cycle,
            'start_date': sub.start_date,
            'card_name': sub.card_name,
            'next_date': next_date,
            'days_remaining': days_remaining
        })
        
    # Sort by days remaining
    enriched_subs.sort(key=lambda x: x['days_remaining'])

    return render_template('index.html', 
                           subs=enriched_subs, 
                           total_this_month=total_vnd_this_month)

@app.route('/add', methods=['POST'])
def add_sub():
    name = request.form.get('name')
    amount = float(request.form.get('amount'))
    currency = request.form.get('currency')
    cycle = request.form.get('cycle')
    start_date_str = request.form.get('start_date')
    card_name = request.form.get('card_name')
    
    start_date = datetime.strptime(start_date_str, '%Y-%m-%d').date()
    
    new_sub = Subscription(
        name=name,
        amount=amount,
        currency=currency,
        cycle=cycle,
        start_date=start_date,
        card_name=card_name
    )
    db.session.add(new_sub)
    db.session.commit()
    
    return redirect(url_for('index'))

@app.route('/delete/<int:sub_id>', methods=['POST'])
def delete_sub(sub_id):
    sub = Subscription.query.get_or_404(sub_id)
    db.session.delete(sub)
    db.session.commit()
    return redirect(url_for('index'))

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True, port=5000)
