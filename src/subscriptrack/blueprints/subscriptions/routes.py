from datetime import datetime
from flask import request, redirect, url_for, flash, jsonify
from flask_login import login_required, current_user
from subscriptrack.extensions import db
from subscriptrack.models import Subscription
from subscriptrack.blueprints.subscriptions import subscriptions_bp
from subscriptrack.blueprints.dashboard.routes import render_dashboard
from subscriptrack.utils import auto_categorize


def _want_json():
    """Return True if the request is an AJAX / JSON-expected request."""
    return request.headers.get('X-Requested-With') == 'XMLHttpRequest'


@subscriptions_bp.route('/add', methods=['POST'])
@login_required
def add():
    name = request.form.get('name', '').strip()
    amount_raw = request.form.get('amount', '')
    currency = request.form.get('currency', 'VND')
    cycle = request.form.get('cycle', 'monthly')
    category_raw = request.form.get('category', '').strip()
    start_date_str = request.form.get('start_date', '')
    end_date_str = request.form.get('end_date', '')
    card_name = request.form.get('card_name', '').strip()

    errors = {}

    if not name:
        errors['name'] = 'Vui lòng nhập tên dịch vụ.'
    if not amount_raw:
        errors['amount'] = 'Vui lòng nhập số tiền.'
    if not start_date_str:
        errors['start_date'] = 'Vui lòng chọn ngày bắt đầu.'
    if not end_date_str:
        errors['end_date'] = 'Vui lòng chọn ngày kết thúc.'
    if not card_name:
        errors['card_name'] = 'Vui lòng nhập thẻ thanh toán.'

    # Auto-categorize if not provided
    if not category_raw:
        category = auto_categorize(name)
    else:
        category = category_raw

    if not errors:
        try:
            amount = float(amount_raw)
            start_date = datetime.strptime(start_date_str, '%Y-%m-%d').date()
            end_date = datetime.strptime(end_date_str, '%Y-%m-%d').date()

            if end_date <= start_date:
                errors['end_date'] = 'Ngày kết thúc phải sau ngày bắt đầu.'
            if currency == 'VND' and amount <= 1000:
                errors['amount'] = 'Số tiền VND phải lớn hơn 1.000.'
        except (ValueError, TypeError):
            if _want_json():
                return jsonify(success=False, errors={'general': 'Dữ liệu không hợp lệ.'}), 422
            flash('Dữ liệu không hợp lệ.', 'error')
            return redirect(url_for('dashboard.index'))

    if errors:
        if _want_json():
            return jsonify(success=False, errors=errors), 422
        flash('Vui lòng kiểm tra lại thông tin.', 'error')
        return render_dashboard(errors=errors)

    new_sub = Subscription(
        name=name,
        amount=amount,
        currency=currency,
        cycle=cycle,
        category=category,
        start_date=start_date,
        end_date=end_date,
        card_name=card_name,
        user_id=current_user.id,
    )
    db.session.add(new_sub)
    db.session.commit()

    if _want_json():
        return jsonify(success=True, message='Thêm dịch vụ thành công.')
    return redirect(url_for('dashboard.index'))


@subscriptions_bp.route('/edit/<int:sub_id>', methods=['POST'])
@login_required
def edit(sub_id):
    sub = Subscription.query.get_or_404(sub_id)
    if sub.user_id != current_user.id:
        if _want_json():
            return jsonify(success=False, errors={'general': 'Bạn không có quyền chỉnh sửa dịch vụ này.'}), 403
        flash('Bạn không có quyền chỉnh sửa dịch vụ này.', 'error')
        return redirect(url_for('dashboard.index'))

    name = request.form.get('name', '').strip()
    amount_raw = request.form.get('amount', '')
    currency = request.form.get('currency', 'VND')
    cycle = request.form.get('cycle', 'monthly')
    category_raw = request.form.get('category', '').strip()
    start_date_str = request.form.get('start_date', '')
    end_date_str = request.form.get('end_date', '')
    card_name = request.form.get('card_name', '').strip()

    errors = {}

    if not name:
        errors['name'] = 'Vui lòng nhập tên dịch vụ.'
    if not amount_raw:
        errors['amount'] = 'Vui lòng nhập số tiền.'
    if not start_date_str:
        errors['start_date'] = 'Vui lòng chọn ngày bắt đầu.'
    if not end_date_str:
        errors['end_date'] = 'Vui lòng chọn ngày kết thúc.'
    if not card_name:
        errors['card_name'] = 'Vui lòng nhập thẻ thanh toán.'

    # Auto-categorize if not provided
    if not category_raw:
        category = auto_categorize(name)
    else:
        category = category_raw

    if not errors:
        try:
            sub.name = name
            sub.amount = float(amount_raw)
            sub.currency = currency
            sub.cycle = cycle
            sub.category = category
            sub.start_date = datetime.strptime(start_date_str, '%Y-%m-%d').date()
            sub.end_date = datetime.strptime(end_date_str, '%Y-%m-%d').date()

            if sub.end_date <= sub.start_date:
                errors['end_date'] = 'Ngày kết thúc phải sau ngày bắt đầu.'
            if currency == 'VND' and sub.amount <= 1000:
                errors['amount'] = 'Số tiền VND phải lớn hơn 1.000.'
        except (ValueError, TypeError):
            if _want_json():
                return jsonify(success=False, errors={'general': 'Dữ liệu không hợp lệ.'}), 422
            flash('Dữ liệu không hợp lệ.', 'error')
            return redirect(url_for('dashboard.index'))

    if errors:
        if _want_json():
            return jsonify(success=False, errors=errors), 422
        flash('Vui lòng kiểm tra lại thông tin.', 'error')
        return render_dashboard(errors=errors)

    db.session.commit()

    if _want_json():
        return jsonify(success=True, message='Cập nhật dịch vụ thành công.')
    flash('Cập nhật dịch vụ thành công.', 'success')
    return redirect(url_for('dashboard.index'))


@subscriptions_bp.route('/delete/<int:sub_id>', methods=['POST'])
@login_required
def delete(sub_id):
    sub = Subscription.query.get_or_404(sub_id)
    if sub.user_id != current_user.id:
        if _want_json():
            return jsonify(success=False, error='Bạn không có quyền xóa dịch vụ này.'), 403
        flash('Bạn không có quyền xóa dịch vụ này.', 'error')
        return redirect(url_for('dashboard.index'))
    db.session.delete(sub)
    db.session.commit()

    if _want_json():
        return jsonify(success=True, message='Xóa dịch vụ thành công.')
    return redirect(url_for('dashboard.index'))
