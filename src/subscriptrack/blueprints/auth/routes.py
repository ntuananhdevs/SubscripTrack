from flask import render_template, request, redirect, url_for, flash
from flask_login import login_user, logout_user, login_required, current_user
from subscriptrack.extensions import db
from subscriptrack.models import User
from subscriptrack.blueprints.auth import auth_bp


@auth_bp.route('/register', methods=['GET', 'POST'])
def register():
    if current_user.is_authenticated:
        return redirect(url_for('dashboard.index'))

    errors = {}
    if request.method == 'POST':
        username = request.form.get('username', '').strip()
        email = request.form.get('email', '').strip()
        password = request.form.get('password', '')
        confirm = request.form.get('confirm_password', '')

        if not username:
            errors['username'] = 'Vui lòng nhập tên đăng nhập.'
        if not email:
            errors['email'] = 'Vui lòng nhập email.'
        if not password:
            errors['password'] = 'Vui lòng nhập mật khẩu.'
        if password and password != confirm:
            errors['confirm_password'] = 'Mật khẩu xác nhận không khớp.'

        if not errors:
            if User.query.filter_by(username=username).first():
                errors['username'] = 'Tên đăng nhập đã tồn tại.'

            if User.query.filter_by(email=email).first():
                errors['email'] = 'Email đã được sử dụng.'

        if not errors:
            user = User(username=username, email=email)
            user.set_password(password)
            db.session.add(user)
            db.session.commit()
            flash('Đăng ký thành công! Vui lòng đăng nhập.', 'success')
            return redirect(url_for('auth.login'))

    return render_template('auth/register.html', errors=errors)


@auth_bp.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('dashboard.index'))

    errors = {}
    if request.method == 'POST':
        username = request.form.get('username', '').strip()
        password = request.form.get('password', '')
        remember = request.form.get('remember') == 'on'

        if not username:
            errors['username'] = 'Vui lòng nhập tên đăng nhập.'
        if not password:
            errors['password'] = 'Vui lòng nhập mật khẩu.'

        if not errors:
            user = User.query.filter_by(username=username).first()
            if not user or not user.check_password(password):
                errors['general'] = 'Tên đăng nhập hoặc mật khẩu không đúng.'
            else:
                login_user(user, remember=remember)
                next_page = request.args.get('next')
                return redirect(next_page or url_for('dashboard.index'))

    return render_template('auth/login.html', errors=errors)


@auth_bp.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('auth.login'))
