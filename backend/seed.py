from app import create_app, db  
from app.models import User, Student, Session
from datetime import date

app = create_app()

with app.app_context():
    print("Clearing old database tables...")
    db.drop_all()
    db.create_all()

    print("Seeding default user...")
    test_tutor = User(username="tutor1")
    test_tutor.set_password("password123")
    db.session.add(test_tutor)
    db.session.commit()

    print("Seeding mock students...")
    student_1 = Student(
        student_first_name="Alex", 
        student_last_name="Smith", 
        school="Oak High", 
        school_grade="10th",
        billing_address="123 Main St", 
        contact_name="Sarah Smith",
        contact_phone="555-0192", 
        contact_email="sarah@example.com",
        user_id=test_tutor.id
    )
    db.session.add(student_1)
    db.session.commit()

    print("Seeding initial tutoring sessions...")
    session_1 = Session(
        date=date(2026, 5, 28), subject="Math", hourly_rate=45.0,
        duration_minutes=60, session_notes="Reviewed quadratic formulas.",
        student_id=student_1.id
    )
    db.session.add(session_1)
    db.session.commit()

    print("Database seeding completed successfully!")