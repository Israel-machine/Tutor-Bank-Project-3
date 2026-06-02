from flask import Blueprint, jsonify
from app.models import db, Student, Session
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import func

metrics_bp = Blueprint('metrics', __name__)

@metrics_bp.route('/summary', methods=['GET'])
@jwt_required()
def get_metrics_summary():
    current_user_id = int(get_jwt_identity())
    
    tutor_student_ids = db.session.query(Student.id).filter(Student.user_id == current_user_id).subquery()
    
    stats = db.session.query(
        func.sum(Session.hourly_rate * (Session.duration_minutes / 60.0)),
        func.avg(Session.hourly_rate * (Session.duration_minutes / 60.0)),
        func.sum(Session.duration_minutes),
        func.count(Session.id),
        func.avg(Session.duration_minutes)
    ).filter(Session.student_id.in_(tutor_student_ids)).first()
    
    subject_data = db.session.query(
        Session.subject,
        func.count(Session.id).label('total_sessions'),
        func.sum(Session.duration_minutes).label('total_minutes'),
        func.sum(Session.hourly_rate * (Session.duration_minutes / 60.0)).label('total_revenue')
    ).filter(Session.student_id.in_(tutor_student_ids)).group_by(Session.subject).all()

    return jsonify({
        "total_revenue": round(stats[0] or 0, 2),
        "avg_revenue_per_session": round(stats[1] or 0, 2),
        "total_minutes": stats[2] or 0,
        "total_sessions": stats[3] or 0,
        "avg_duration": round(stats[4] or 0, 1),
        "subjects": [{
            "subject": row.subject,
            "sessions": row.total_sessions,
            "minutes": row.total_minutes,
            "revenue": round(row.total_revenue, 2)
        } for row in subject_data]
    }), 200