from flask import Blueprint, request, jsonify
from app import db
from app.models import FollowUp, Candidate
from datetime import date, datetime, timedelta

followups_bp = Blueprint('followups', __name__)

@followups_bp.route('/', methods=['POST'])
def create_followup():
    data = request.get_json()

    try:
        candidate_id = data.get('candidate_id')
        followup_date = data.get('followup_date')
        notes = data.get('notes', '')
        status = data.get('status', 'pending')

        candidate = Candidate.query.get(candidate_id)
        if not candidate:
            return jsonify({"error": "Candidate not found"}), 404
        
        new_followup = FollowUp(
            candidate_id=candidate_id,
            followup_date=datetime.strptime(followup_date, '%Y-%m-%d').date(),
            notes=notes,
            status=status
        )

        db.session.add(new_followup)
        db.session.commit()

        return jsonify(new_followup.to_dict()), 201
    
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400

@followups_bp.route('/due', methods=['GET'])
def get_due_followups():
    today = date.today()
    end_of_week = today + timedelta(days=7)

    followups = FollowUp.query.filter(
        FollowUp.followup_date.between(today, end_of_week),
        FollowUp.status != 'completed'
    ).all()

    return jsonify([f.to_dict() for f in followups]), 200

@followups_bp.route('/<int:id>/complete', methods=['PUT'])
def complete_followup(id):
    followup = FollowUp.query.get(id)

    if not followup:
        return jsonify({"error": "Follow-up not found"}), 404
    
    followup.status = 'completed'

    try:
        db.session.commit()
        return jsonify(followup.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400

@followups_bp.route('/', methods=['GET'])
def get_all_followups():
    try:
        followups = FollowUp.query.all()
        return jsonify([f.to_dict() for f in followups]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
