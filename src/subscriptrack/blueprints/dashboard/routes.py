from datetime import date
from flask import render_template
from flask_login import login_required, current_user
from subscriptrack.models import Subscription
from subscriptrack.blueprints.dashboard import dashboard_bp
from subscriptrack.utils import get_next_billing_date, USD_TO_VND_RATE, get_service_icon, add_months


def render_dashboard(errors=None):
    """Helper to render dashboard with optional field-level errors."""
    if errors is None:
        errors = {}
    subs = Subscription.query.filter_by(user_id=current_user.id).all()
    today = date.today()

    enriched_subs = []
    total_vnd_this_month = 0

    for sub in subs:
        # Compute end_date from duration if set
        end_date = None
        if sub.duration and sub.duration_unit:
            if sub.duration_unit == 'monthly':
                end_date = add_months(sub.start_date, sub.duration)
            elif sub.duration_unit == 'yearly':
                end_date = add_months(sub.start_date, sub.duration * 12)
            elif sub.duration_unit == 'weekly':
                from datetime import timedelta
                end_date = sub.start_date + timedelta(weeks=sub.duration)

        # Skip subscriptions that have ended
        if end_date and end_date < today:
            continue

        next_date = get_next_billing_date(sub.start_date, sub.cycle)
        days_remaining = (next_date - today).days

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
            'category': sub.category,
            'start_date': sub.start_date,
            'end_date': end_date,
            'duration': sub.duration,
            'duration_unit': sub.duration_unit,
            'next_date': next_date,
            'days_remaining': days_remaining,
            'service_icon': get_service_icon(sub.name),
        })

    enriched_subs.sort(key=lambda x: x['days_remaining'])

    return render_template(
        'dashboard/index.html',
        subs=enriched_subs,
        total_this_month=total_vnd_this_month,
        errors=errors,
    )


@dashboard_bp.route('/')
@login_required
def index():
    return render_dashboard()