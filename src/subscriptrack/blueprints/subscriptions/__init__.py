from flask import Blueprint

subscriptions_bp = Blueprint('subscriptions', __name__)

from subscriptrack.blueprints.subscriptions import routes
