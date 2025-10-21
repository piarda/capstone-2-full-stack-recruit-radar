from flask import Blueprint, request, jsonify
from app.models import Candidate
from app import db

candidates_bp = Blueprint('candidates', __name__)

@candidates_bp.route('/', methods=['GET'])
def get_candidates():
    candidates = Candidate.query.filter_by(archived=False).all()
    return jsonify([candidate.to_dict() for candidate in candidates]), 200

@candidates_bp.route('/', methods=['POST'])
def create_candidate():
    try:
        data = request.get_json(force=True)
        print("Incoming data:", data)

        if not data:
            return jsonify({"error": "No JSON body provided"}), 400

        new_candidate = Candidate(
            name=data.get('name'),
            email=data.get('email'),
            phone=data.get('phone'),
            notes=data.get('notes')
        )
        db.session.add(new_candidate)
        db.session.commit()
        return jsonify(new_candidate.to_dict()), 201
    except Exception as e:
        print("Error duriing candidate creation:", str(e))
        db.session.rollback()
        return jsonify({"error": str(e)}), 400

@candidates_bp.route('/<int:id>', methods=['GET'])
def get_candidate_by_id(id):
    candidate = Candidate.query.get(id)

    if not candidate:
        return jsonify({"error": "Candidate not found"}), 404
    
    return jsonify(candidate.to_dict()), 200

@candidates_bp.route('/<int:id>', methods=['PUT'])
def update_candidate(id):
    candidate = Candidate.query.get(id)

    if not candidate:
        return jsonify({"error": "Candidate not found"}), 404
    
    data = request.get_json()

    candidate.name = data.get('name', candidate.name)
    candidate.email = data.get('email', candidate.email)
    candidate.phone = data.get('phone', candidate.phone)
    candidate.notes = data.get('notes', candidate.notes)

    try:
        db.session.commit()
        return jsonify(candidate.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400

@candidates_bp.route('/<int:id>/archive', methods=['PUT'])
def archive_candidate(id):
    candidate = Candidate.query.get(id)

    if not candidate:
        return jsonify({"error": "Candidate not found"}), 404
    
    candidate.archived = True

    try:
        db.session.commit()
        return jsonify({"message": f"Candidate {id} archived."}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400

@candidates_bp.route('/<int:id>/unarchive', methods=['PUT'])
def unarchive_candidate(id):
    candidate = Candidate.query.get(id)

    if not candidate:
        return jsonify({"error": "Candidate not found"}), 404
    
    candidate.archived = False

    try:
        db.session.commit()
        return jsonify({"message": f"Candidate {id} unarchived."}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400

@candidates_bp.route('/archived', methods=['GET'])
def get_archived_candidates():
    archived_candidates = Candidate.query.filter_by(archived=True).all()
    return jsonify([candidate.to_dict() for candidate in archived_candidates]), 200

@candidates_bp.route('/<int:id>/followups', methods=['GET'])
def get_candidate_followups(id):
    candidate = Candidate.query.get(id)

    if not candidate:
        return jsonify({"error": "Candidate not found"}), 404
    
    followups = [f.to_dict() for f in candidate.followups]
    sorted_followups = sorted(followups, key=lambda f: f["followup_date"])

    return jsonify(sorted_followups), 200
