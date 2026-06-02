from flask import Flask
from flask_cors import CORS
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from app.config import Config
from app.models import db 
from dotenv import load_dotenv

load_dotenv()

migrate = Migrate()
jwt = JWTManager()

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    CORS(app)

    from app.routes.auth import auth_bp
    app.register_blueprint(auth_bp, url_prefix='/api/auth')

    from app.routes.students import students_bp
    app.register_blueprint(students_bp, url_prefix='/api/students')

    from app.routes.sessions import sessions_bp
    app.register_blueprint(sessions_bp, url_prefix='/api') 

    return app