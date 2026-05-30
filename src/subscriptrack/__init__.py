from flask import Flask
from sqlalchemy import inspect, text
from subscriptrack.config import Config
from subscriptrack.extensions import db, login_manager
from subscriptrack.models import User


def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Initialize extensions
    db.init_app(app)
    login_manager.init_app(app)
    login_manager.login_view = 'auth.login'
    login_manager.login_message = 'Vui lòng đăng nhập để tiếp tục.'

    # User loader
    @login_manager.user_loader
    def load_user(user_id):
        return User.query.get(int(user_id))

    # Register blueprints
    from subscriptrack.blueprints.auth import auth_bp
    from subscriptrack.blueprints.dashboard import dashboard_bp
    from subscriptrack.blueprints.subscriptions import subscriptions_bp
    from subscriptrack.blueprints.analytics import analytics_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(dashboard_bp)
    app.register_blueprint(subscriptions_bp)
    app.register_blueprint(analytics_bp)

    # Create tables and handle migrations
    with app.app_context():
        db.create_all()
        _migrate_database()

    return app


def _migrate_database():
    """Handle schema migrations for existing databases."""
    inspector = inspect(db.engine)
    tables = inspector.get_table_names()

    if 'subscription' in tables:
        columns = [c['name'] for c in inspector.get_columns('subscription')]
        if 'category' not in columns:
            try:
                with db.engine.connect() as conn:
                    conn.execute(text(
                        "ALTER TABLE subscription ADD COLUMN category VARCHAR(50) NOT NULL DEFAULT 'Khác'"
                    ))
                    conn.commit()
                print('[migrate] Added `category` column to subscription table.')
            except Exception as e:
                print(f'[migrate] Could not add category column: {e}')
