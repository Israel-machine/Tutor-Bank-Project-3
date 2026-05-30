from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import generate_password_hash, check_password_hash
from datetime import date

db = SQLAlchemy()

class User:
    __tablename__ = 'users'
    id = db.Column()
    username = db.Column()
    password_hash = db.Column()
    #missing relation

class Student:
    __tablename__ = 'students'
    id = db.Column()
    student_first_name = db.Column()
    student_last_name = db.Column()
    school = db.Column()
    school_grade = b.Column()
    billing_address = db.Column()
    contact_name = db.Column()
    contact_phone = db.Column()
    contact_email = db.Column()
    user_id = db.Column()
    #missing relation


class Session:
    __tablename__ = 'sessions'
    id = db.Column()
    date = db.Column()
    subject = db.Column()
    hourly_rate = db.Column()
    duration_minutes = db.Column()
    session_notes = db.Column()
    student_id = db.Column()

