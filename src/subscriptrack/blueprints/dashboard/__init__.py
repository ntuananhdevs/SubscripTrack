from flask import Blueprint

dashboard_bp = Blueprint('dashboard', __name__)

from subscriptrack.blueprints.dashboard import routes
