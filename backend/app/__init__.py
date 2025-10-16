import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from dotenv import load_dotenv

db = SQLAlchemy()

def create_app():
    load_dotenv()

    app = Flask(__name__)

    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///dev.db')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key')

    db.init_app(app)
    CORS(app)

    from .routes.candidates import candidates_bp
    from .routes.followups import followups_bp

    app.register_blueprint(candidates_bp, url_prefix='/api/candidates')
    app.register_blueprint(followups_bp, url_prefix='/api/followups')

    with app.app_context():
        db.create_all()

    return app
