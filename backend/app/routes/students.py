from flask import Blueprint, request, jsonify
from app.models import db, Student
from flask_jwt_extended import jwt_required, get_jwt_identity

students_bp = Blueprint('students', __name__) 

@students_bp.route('', methods=['GET'])
@jwt_required()
def get_students():
    # Pitch Match: Data Security via get_jwt_identity()
    current_user_id = int(get_jwt_identity())
    students = Student.query.filter_by(user_id=current_user_id).all()
    
    return jsonify([{
        "id": s.id,
        "student_first_name": s.student_first_name,
        "student_last_name": s.student_last_name,
        "school": s.school,
        "school_grade": s.school_grade,
        "billing_address": s.billing_address,
        "contact_name": s.contact_name,
        "contact_phone": s.contact_phone,
        "contact_email": s.contact_email
    } for s in students]), 200


@students_bp.route('', methods=['POST'])
@jwt_required()
def create_student():
    current_user_id = int(get_jwt_identity())
    data = request.get_json() or {}
    
    # Pitch Match: Captures all 8 student fields
    first_name = data.get('student_first_name')
    last_name = data.get('student_last_name')
    contact_name = data.get('contact_name')
    
    if not first_name or not last_name or not contact_name:
        return jsonify({"error": "First name, last_name, and contact_name are required"}), 400

    new_student = Student(
        student_first_name=first_name,
        student_last_name=last_name,
        school=data.get('school'),
        school_grade=data.get('school_grade'),
        billing_address=data.get('billing_address'),
        contact_name=contact_name,
        contact_phone=data.get('contact_phone'),
        contact_email=data.get('contact_email'),
        user_id=current_user_id
    )
    
    db.session.add(new_student)
    db.session.commit()
    return jsonify({"message": "Student created successfully", "id": new_student.id}), 201


@students_bp.route('/<int:student_id>', methods=['PUT'])
@jwt_required()
def update_student(student_id):
    current_user_id = int(get_jwt_identity())
    student = db.session.get(Student, student_id)
    
    # Secure Check: Ensure student exists AND belongs to this user
    if not student or student.user_id != current_user_id:
        return jsonify({"error": "Student not found or unauthorized access"}), 404
        
    data = request.get_json() or {}
    
    student.student_first_name = data.get('student_first_name', student.student_first_name)
    student.student_last_name = data.get('student_last_name', student.student_last_name)
    student.school = data.get('school', student.school)
    student.school_grade = data.get('school_grade', student.school_grade)
    student.billing_address = data.get('billing_address', student.billing_address)
    student.contact_name = data.get('contact_name', student.contact_name)
    student.contact_phone = data.get('contact_phone', student.contact_phone)
    student.contact_email = data.get('contact_email', student.contact_email)
    
    db.session.commit()
    return jsonify({"message": "Student updated successfully"}), 200


@students_bp.route('/<int:student_id>', methods=['DELETE'])
@jwt_required()
def delete_student(student_id):
    current_user_id = int(get_jwt_identity())
    student = db.session.get(Student, student_id)
    
    if not student or student.user_id != current_user_id:
        return jsonify({"error": "Student not found or unauthorized access"}), 404
        
    db.session.delete(student)
    db.session.commit()
    return jsonify({"message": "Student (and associated sessions) deleted successfully"}), 200