import calendar
from datetime import date
from collections import defaultdict

from flask import render_template, request
from flask_login import login_required, current_user

from subscriptrack.extensions import db
from subscriptrack.models import Subscription
from subscriptrack.blueprints.analytics import analytics_bp
from subscriptrack.utils import (
    get_next_billing_date, get_monthly_cost, get_yearly_cost,
    auto_categorize,
)


@analytics_bp.route('/analytics', defaults={'income': None})
@analytics_bp.route('/analytics/<int:income>')
@login_required
def index(income=None):
    today = date.today()
    subs = Subscription.query.filter_by(user_id=current_user.id).all()

    # Filter active subscriptions
    active_subs = [s for s in subs if not (s.end_date and s.end_date < today)]

    # Auto-categorize any subscriptions that don't have a proper category
    _auto_categorize_subs(active_subs)

    #  1. Spending Overview 
    total_this_month = 0.0
    total_next_month = 0.0
    total_year_estimate = 0.0
    total_monthly_estimate = 0.0

    for sub in active_subs:
        monthly = get_monthly_cost(sub.amount, sub.cycle, sub.currency)
        yearly = get_yearly_cost(sub.amount, sub.cycle, sub.currency)
        total_year_estimate += yearly
        total_monthly_estimate += monthly

        next_date = get_next_billing_date(sub.start_date, sub.cycle)
        if next_date.month == today.month and next_date.year == today.year:
            total_this_month += monthly
        elif next_date.month == (today.month % 12) + 1 and (
            next_date.year == today.year or
            (today.month == 12 and next_date.year == today.year + 1)
        ):
            total_next_month += monthly

    #  2. Category Breakdown (Pie Chart) ─
    category_data = defaultdict(float)
    for sub in active_subs:
        monthly = get_monthly_cost(sub.amount, sub.cycle, sub.currency)
        category_data[sub.category] += monthly

    category_labels = list(category_data.keys())
    category_values = [round(v, 0) for v in category_data.values()]

    # Color palette for categories
    category_colors = [
        '#6366f1', '#f59e0b', '#ef4444', '#10b981', '#3b82f6',
        '#ec4899', '#8b5cf6', '#14b8a6', '#f97316', '#6b7280',
    ]
    category_color_map = {
        label: category_colors[i % len(category_colors)]
        for i, label in enumerate(category_labels)
    }
    category_backgrounds = [category_color_map[l] for l in category_labels]

    #  3. Monthly Trend (Bar Chart) 
    # Compute estimated monthly spending for the last 6 months
    monthly_trend_labels = []
    monthly_trend_values = []

    for i in range(5, -1, -1):
        # Target month/year
        m = today.month - i
        y = today.year
        while m < 1:
            m += 12
            y -= 1
        while m > 12:
            m -= 12
            y += 1

        month_name = f'Tháng {m}'
        if i == 0:
            month_name = 'Tháng này'
        monthly_trend_labels.append(f'{month_name}/{y}')

        total = 0.0
        for sub in active_subs:
            # Check if subscription was active during this month
            sub_start = sub.start_date
            sub_end = sub.end_date or date.max

            month_start = date(y, m, 1)
            _, last_day = calendar.monthrange(y, m)
            month_end = date(y, m, last_day)

            # If subscription was active during this month
            if sub_start <= month_end and sub_end >= month_start:
                total += get_monthly_cost(sub.amount, sub.cycle, sub.currency)

        monthly_trend_values.append(round(total, 0))

    #  4. Bleeding Index ─
    income_value = income or request.args.get('income', type=int) or 0

    # Score components (0-100)
    score = 0
    factors = []

    # Factor 1: Subscription count
    count = len(active_subs)
    if count == 0:
        count_score = 0
        count_advice = 'Không có dịch vụ nào đang theo dõi.'
    elif count <= 3:
        count_score = 5
        count_advice = f'{count} dịch vụ — rất tốt, bạn kiểm soát chi tiêu gọn gàng.'
    elif count <= 6:
        count_score = 15
        count_advice = f'{count} dịch vụ — ổn, nhưng hãy cân nhắc cắt giảm bớt.'
    elif count <= 10:
        count_score = 25
        count_advice = f'{count} dịch vụ — khá nhiều, bạn có thực sự dùng hết không?'
    else:
        count_score = 35
        count_advice = f'{count} dịch vụ — quá nhiều! Hãy xem xét cắt giảm ngay.'
    score += count_score
    factors.append({
        'icon': 'hashtag',
        'label': 'Số lượng dịch vụ',
        'detail': f'{count} dịch vụ',
        'advice': count_advice,
        'score': count_score,
    })

    # Factor 2: Cost-to-income ratio
    if income_value > 0:
        ratio = (total_monthly_estimate / income_value) * 100
        if ratio < 10:
            income_score = 0
            income_advice = f'Chỉ {ratio:.0f}% thu nhập — rất lành mạnh.'
        elif ratio < 20:
            income_score = 15
            income_advice = f'{ratio:.0f}% thu nhập — tạm chấp nhận được.'
        elif ratio < 30:
            income_score = 30
            income_advice = f'{ratio:.0f}% thu nhập! Khá cao, cần cân nhắc cắt giảm.'
        else:
            income_score = 40
            income_advice = f'{ratio:.0f}% thu nhập!!! Bạn đang chảy máu tiền nghiêm trọng!'
        score += income_score
        factors.append({
            'icon': 'wallet',
            'label': 'Tỷ lệ thu nhập',
            'detail': f'{ratio:.0f}% tháng ({income_value:,.0f} VND)',
            'advice': income_advice,
            'score': income_score,
        })
    else:
        # No income provided: use absolute amount as proxy
        if total_monthly_estimate < 500000:
            income_score = 0
        elif total_monthly_estimate < 2000000:
            income_score = 15
        elif total_monthly_estimate < 5000000:
            income_score = 25
        else:
            income_score = 35
        score += income_score
        factors.append({
            'icon': 'wallet',
            'label': 'Chi tiêu hàng tháng',
            'detail': f'{total_monthly_estimate:,.0f} VND/tháng',
            'advice': 'Cung cấp thu nhập để nhận đánh giá chính xác hơn.',
            'score': income_score,
        })

    # Factor 3: Category concentration penalty
    # If many similar services exist in the same category
    cat_counts = defaultdict(int)
    for sub in active_subs:
        cat_counts[sub.category] += 1

    overlapping_cats = {k: v for k, v in cat_counts.items() if v >= 3 and k != 'Khác'}
    dup_score = min(len(overlapping_cats) * 10, 20)
    if dup_score > 0:
        cats_str = ', '.join(overlapping_cats.keys())
        score += dup_score
        factors.append({
            'icon': 'clone',
            'label': 'Dịch vụ trùng lặp',
            'detail': f'{len(overlapping_cats)} nhóm có >=3 dịch vụ',
            'advice': f'Bạn có nhiều dịch vụ trong nhóm: {cats_str}. Cân nhắc cắt bớt.',
            'score': dup_score,
        })

    # Factor 4: Subscriptions with no end date
    no_end = [s for s in active_subs if not s.end_date]
    no_end_score = min(len(no_end) * 5, 20)
    if no_end_score > 0:
        score += no_end_score
        factors.append({
            'icon': 'infinity',
            'label': 'Dịch vụ vô thời hạn',
            'detail': f'{len(no_end)} dịch vụ không có ngày kết thúc',
            'advice': 'Đây là các khoản chi "mãi mãi". Hãy đặt ngày kết thúc nếu không còn dùng.',
            'score': no_end_score,
        })

    score = min(score, 100)

    # Determine severity
    if score <= 20:
        severity = 'good'
        severity_label = 'Lành mạnh'
        severity_icon = 'shield-check'
        summary_advice = 'Tình hình tài chính của bạn rất tốt. Hãy duy trì nhé!'
    elif score <= 40:
        severity = 'warning'
        severity_label = 'Cần chú ý'
        severity_icon = 'exclamation'
        summary_advice = 'Bạn đang chi hơi nhiều cho dịch vụ. Hãy rà soát lại.'
    elif score <= 65:
        severity = 'danger'
        severity_label = 'Đang chảy máu'
        severity_icon = 'exclamation-triangle'
        summary_advice = 'Bạn đang mất kiểm soát! Hãy cắt giảm các dịch vụ không cần thiết ngay.'
    else:
        severity = 'critical'
        severity_label = 'Cấp cứu tài chính!'
        severity_icon = 'fire'
        summary_advice = 'Tình hình nghiêm trọng! Hãy xem xét lại toàn bộ chi tiêu và cắt giảm triệt để.'

    return render_template(
        'analytics/index.html',
        total_this_month=round(total_this_month, 0),
        total_next_month=round(total_next_month, 0),
        total_year_estimate=round(total_year_estimate, 0),
        total_monthly_estimate=round(total_monthly_estimate, 0),
        category_labels=category_labels,
        category_values=category_values,
        category_colors=category_backgrounds,
        monthly_trend_labels=monthly_trend_labels,
        monthly_trend_values=monthly_trend_values,
        bleeding_score=score,
        bleeding_severity=severity,
        bleeding_label=severity_label,
        bleeding_icon=severity_icon,
        bleeding_summary=summary_advice,
        bleeding_factors=factors,
        income=income_value,
        sub_count=len(active_subs),
    )


def _auto_categorize_subs(subs):
    """Auto-categorize any subscriptions that are still 'Khác' or uncategorized."""
    changed = False
    for sub in subs:
        if not sub.category or sub.category == 'Khác':
            detected = auto_categorize(sub.name)
            if detected != 'Khác':
                sub.category = detected
                changed = True
    if changed:
        db.session.commit()
