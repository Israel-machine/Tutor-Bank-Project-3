from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import generate_password_hash, check_password_hash
from datetime import date

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    students = db.relationship('Student', backref='tutor', lazy=True, cascade="all, delete-orphan")
    #Need to set password

    def set_password(self, password):
        self.password_hash = generate_password_hash(password).decode('utf-8')    
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class Student(db.Model):
    __tablename__ = 'students'

    id = db.Column(db.Integer, primary_key=True)
    student_first_name = db.Column(db.String(50), nullable=False)
    student_last_name = db.Column(db.String(50), nullable=False)
    school = db.Column(db.String(100))
    school_grade = db.Column(db.String(20))
    #use db.Text for varied address length
    billing_address = db.Column(db.Text)
    contact_name = db.Column(db.String(50), nullable=False)
    contact_phone = db.Column(db.String(20))
    contact_email = db.Column(db.String(100))
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    #missing relation
    sessions = db.relationship('Session', backref='student', lazy=True, cascade="all, delete-orphan")


class Session:
    __tablename__ = 'sessions'
    id = db.Column()
    date = db.Column()
    subject = db.Column()
    hourly_rate = db.Column()
    duration_minutes = db.Column()
    session_notes = db.Column()
    student_id = db.Column()

