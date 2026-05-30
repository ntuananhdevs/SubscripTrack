from flask import Blueprint

auth_bp = Blueprint('auth', __name__)

from subscriptrack.blueprints.auth import routes
