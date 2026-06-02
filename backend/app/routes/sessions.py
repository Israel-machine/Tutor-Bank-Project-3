from flask import Blueprint, request, jsonify
from app.models import db, Student, Session
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime

sessions_bp = Blueprint('sessions', __name__)

@sessions_bp.route('/students/<int:student_id>/sessions', methods=['GET'])
@jwt_required()
def get_student_sessions(student_id):
    current_user_id = int(get_jwt_identity())
    student = db.session.get(Student, student_id)
    
    if not student or student.user_id != current_user_id:
        return jsonify({"error": "Student not found or unauthorized access"}), 404
        
    sessions = Session.query.filter_by(student_id=student_id).order_by(Session.date.desc()).all()
    
    return jsonify([{
        "id": s.id,
        "date": s.date.isoformat(),
        "subject": s.subject,
        "hourly_rate": s.hourly_rate,
        "duration_minutes": s.duration_minutes,
        "session_notes": s.session_notes,
        "student_id": s.student_id
    } for s in sessions]), 200


@sessions_bp.route('/students/<int:student_id>/sessions', methods=['POST'])
@jwt_required()
def create_session(student_id):
    current_user_id = int(get_jwt_identity())
    student = db.session.get(Student, student_id)
    
    if not student or student.user_id != current_user_id:
        return jsonify({"error": "Student not found or unauthorized access"}), 404
        
    data = request.get_json() or {}
    subject = data.get('subject')
    hourly_rate = data.get('hourly_rate')
    duration_minutes = data.get('duration_minutes')
    
    if not subject or hourly_rate is None or not duration_minutes:
        return jsonify({"error": "Subject, hourly rate, and duration are required"}), 400
        
    date_str = data.get('date')
    session_date = datetime.strptime(date_str, "%Y-%m-%d").date() if date_str else None

    new_session = Session(
        subject=subject,
        hourly_rate=float(hourly_rate),
        duration_minutes=int(duration_minutes),
        session_notes=data.get('session_notes', ''),
        student_id=student_id
    )
    if session_date:
        new_session.date = session_date
        
    db.session.add(new_session)
    db.session.commit()
    return jsonify({"message": "Session logged successfully", "id": new_session.id}), 201


@sessions_bp.route('/sessions/<int:session_id>', methods=['PUT'])
@jwt_required()
def update_session(session_id):
    current_user_id = int(get_jwt_identity())
    session = db.session.get(Session, session_id)
    
    if not session or session.student.user_id != current_user_id:
        return jsonify({"error": "Session not found or unauthorized access"}), 404
        
    data = request.get_json() or {}
    
    if data.get('date'):
        session.date = datetime.strptime(data.get('date'), "%Y-%m-%d").date()
        
    session.subject = data.get('subject', session.subject)
    session.hourly_rate = float(data.get('hourly_rate', session.hourly_rate))
    session.duration_minutes = int(data.get('duration_minutes', session.duration_minutes))
    session.session_notes = data.get('session_notes', session.session_notes)
    
    db.session.commit()
    return jsonify({"message": "Session updated successfully"}), 200


@sessions_bp.route('/sessions/<int:session_id>', methods=['DELETE'])
@jwt_required()
def delete_session(session_id):
    current_user_id = int(get_jwt_identity())
    session = db.session.get(Session, session_id)
    
    if not session or session.student.user_id != current_user_id:
        return jsonify({"error": "Session not found or unauthorized access"}), 404
        
    db.session.delete(session)
    db.session.commit()
    return jsonify({"message": "Session deleted successfully"}), 200