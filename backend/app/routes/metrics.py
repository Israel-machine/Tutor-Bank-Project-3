from flask import Blueprint, jsonify
from app.models import db, Student, Session
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from collections import defaultdict

metrics_bp = Blueprint('metrics', __name__)

@metrics_bp.route('/summary', methods=['GET'])
@jwt_required()
def get_metrics_summary():
    user_id = get_jwt_identity()
    
    now = datetime.now()
    current_year = now.year
    current_month = now.month

    students = Student.query.filter_by(user_id=user_id).all()
    student_map = {s.id: f"{s.student_first_name} {s.student_last_name}" for s in students}
    student_ids = list(student_map.keys())

    if not student_ids:
        return jsonify({
            "total_revenue": "0.00", "avg_revenue_per_session": "0.00",
            "total_sessions": 0, "total_minutes": 0, "avg_duration": "0.00",
            "revenue_ranking": [], "minutes_ranking": [], "subjects": []
        })

    sessions = Session.query.filter(
        Session.student_id.in_(student_ids),
        db.extract('year', Session.date) == current_year,
        db.extract('month', Session.date) == current_month
    ).all()

    student_revenue = defaultdict(float)
    student_minutes = defaultdict(int)
    subject_data = defaultdict(lambda: {"sessions": 0, "total_minutes": 0, "total_revenue": 0.0})

    total_revenue = 0.0
    total_minutes = 0
    total_sessions = len(sessions)

    for s in sessions:
        cost = (s.hourly_rate * s.duration_minutes) / 60.0
        total_revenue += cost
        total_minutes += s.duration_minutes
        
        student_revenue[s.student_id] += cost
        student_minutes[s.student_id] += s.duration_minutes

        subject_data[s.subject]["sessions"] += 1
        subject_data[s.subject]["total_minutes"] += s.duration_minutes
        subject_data[s.subject]["total_revenue"] += cost

    rev_rank = sorted(
        [{"name": student_map[sid], "revenue": f"{amt:.2f}"} for sid, amt in student_revenue.items()],
        key=lambda x: float(x["revenue"]), reverse=True
    )[:10]

    min_rank = sorted(
        [{"name": student_map[sid], "minutes": mins} for sid, mins in student_minutes.items()],
        key=lambda x: x["minutes"], reverse=True
    )[:10]

    formatted_subjects = []
    for subj, data in subject_data.items():
        avg_mins = data["total_minutes"] / data["sessions"] if data["sessions"] > 0 else 0
        
        formatted_subjects.append({
            "subject": subj,
            "sessions": data["sessions"],
            "avg_minutes": round(avg_mins, 1),
            "revenue": f"{data['total_revenue']:.2f}"
        })

    avg_rev = total_revenue / total_sessions if total_sessions > 0 else 0.0
    avg_dur = total_minutes / total_sessions if total_sessions > 0 else 0.0

    return jsonify({
        "total_revenue": f"{total_revenue:.2f}",
        "avg_revenue_per_session": f"{avg_rev:.2f}",
        "total_sessions": total_sessions,
        "total_minutes": total_minutes,
        "avg_duration": f"{avg_dur:.2f}",
        "revenue_ranking": rev_rank,
        "minutes_ranking": min_rank,
        "subjects": formatted_subjects
    })