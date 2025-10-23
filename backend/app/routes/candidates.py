from flask import Blueprint, request, jsonify
from sqlalchemy import func, asc, desc, nulls_last
from app.models import Candidate, FollowUp
from app import db

candidates_bp = Blueprint('candidates', __name__)

@candidates_bp.route('/', methods=['GET'])
def get_candidates():
    try:
        page = request.args.get('page', 1, type=int)
        limit = request.args.get('limit', 10, type=int)
        search = request.args.get('search', '', type=str).strip().lower()

        earliest_followup_subq = (
            db.session.query(
                FollowUp.candidate_id,
                func.min(FollowUp.followup_date).label('earliest_followup_date')
            )
            .group_by(FollowUp.candidate_id)
            .subquery()
        )

        query = (
            db.session.query(Candidate)
            .outerjoin(earliest_followup_subq, Candidate.id == earliest_followup_subq.c.candidate_id)
            .filter(Candidate.archived == False)
        )

        if search:
            query = query.filter(Candidate.name.ilike(f"%{search}%"))

        query = query.order_by(
            nulls_last(asc(earliest_followup_subq.c.earliest_followup_date)),
            desc(Candidate.created_at)
        )

        paginated = query.paginate(page=page, per_page=limit, error_out=False)

        candidates = [c.to_dict() for c in paginated.items]
        return jsonify({
            "candidates": candidates,
            "total": paginated.total,
            "pages": paginated.pages,
            "current_page": paginated.page
        }), 200
    
    except Exception as e:
        print("Pagination error", str(e))
        return jsonify({"error": "Failed to fetch candidates"}), 500

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

@candidates_bp.route('/<int:id>/stage', methods=['PUT'])
def update_stage(id):
    candidate = Candidate.query.get(id)
    if not candidate:
        return jsonify({"error": "Candidate not found"}), 404
    
    data = request.get_json()
    new_stage = data.get('stage')

    if not new_stage:
        return jsonify({"error": "Stage is required"}), 400
    
    candidate.stage = new_stage
    try:
        db.session.commit()
        return jsonify(candidate.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# Remove later
@candidates_bp.route('/seed_followups', methods=['POST'])
def seed_followups():
    from datetime import datetime, timedelta
    import random

    try:
        candidates = Candidate.query.filter_by(archived=False).all()
        for i, candidate in enumerate(candidates[:10]):
            for _ in range(random.randint(1, 3)):
                days_ago = random.randint(0, 30)
                followup = FollowUp(
                    candidate_id=candidate.id,
                    followup_date=datetime.utcnow() - timedelta(days=days_ago),
                    status=random.choice(['pending', 'completed']),
                    notes=f'Dummy follow-up {random.randint(100, 999)}'
                )
                db.session.add(followup)

        db.session.commit()
        return jsonify({"message": "Dummy follow-ups added."}), 201

    except Exception as e:
        print("Seeding error:", e)
        return jsonify({"error": "Failed to seed follow-ups"}), 500
