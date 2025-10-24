from flask import Blueprint, request, jsonify
from sqlalchemy import func, asc, desc, nulls_last
from app.models import Candidate, FollowUp
from app import db
from ..utils import get_candidate_or_404, commit_or_rollback, validate_name, validate_email, validate_phone, ValidationError

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
    data = request.get_json(force=True)
    if not data:
        return jsonify({"error": "No JSON body provided"}), 400

    try:
        validate_name(data.get('name'))
        validate_email(data.get('email'))
        validate_phone(data.get('phone'))

        new_candidate = Candidate(
            name=data.get('name').strip(),
            email=data.get('email').strip(),
            phone=data.get('phone').strip() if data.get('phone') else None,
            notes=data.get('notes')
        )
        db.session.add(new_candidate)
        return commit_or_rollback(new_candidate, success_status=201)

    except ValidationError as e:
        return jsonify({"error": str(e)}), 400

@candidates_bp.route('/<int:id>', methods=['GET'])
def get_candidate_by_id(id):
    candidate, resp, status = get_candidate_or_404(id)
    if resp:
        return resp, status
    return jsonify(candidate.to_dict()), 200

@candidates_bp.route('/<int:id>', methods=['PUT'])
def update_candidate(id):
    candidate, resp, status = get_candidate_or_404(id)
    if resp:
        return resp, status

    data = request.get_json()
    try:
        if 'name' in data:
            validate_name(data.get('name'))
            candidate.name = data.get('name').strip()
        if 'email' in data:
            validate_email(data.get('email'))
            candidate.email = data.get('email').strip()
        if 'phone' in data:
            validate_phone(data.get('phone'))
            candidate.phone = data.get('phone').strip() if data.get('phone') else None
        if 'notes' in data:
            candidate.notes = data.get('notes')
        return commit_or_rollback(candidate)

    except ValidationError as e:
        return jsonify({"error": str(e)}), 400

@candidates_bp.route('/<int:id>/archive', methods=['PUT'])
def archive_candidate(id):
    candidate, resp, status = get_candidate_or_404(id)
    if resp:
        return resp, status

    candidate.archived = True
    return commit_or_rollback(message=f"Candidate {id} archived.")

@candidates_bp.route('/<int:id>/unarchive', methods=['PUT'])
def unarchive_candidate(id):
    candidate, resp, status = get_candidate_or_404(id)
    if resp:
        return resp, status

    candidate.archived = False
    return commit_or_rollback(message=f"Candidate {id} unarchived.")

@candidates_bp.route('/archived', methods=['GET'])
def get_archived_candidates():
    archived_candidates = Candidate.query.filter_by(archived=True).all()
    return jsonify([candidate.to_dict() for candidate in archived_candidates]), 200

@candidates_bp.route('/<int:id>/followups', methods=['GET'])
def get_candidate_followups(id):
    candidate, resp, status = get_candidate_or_404(id)
    if resp:
        return resp, status

    followups = [f.to_dict() for f in candidate.followups]
    sorted_followups = sorted(followups, key=lambda f: f["followup_date"])
    return jsonify(sorted_followups), 200

@candidates_bp.route('/<int:id>/stage', methods=['PUT'])
def update_stage(id):
    candidate, resp, status = get_candidate_or_404(id)
    if resp:
        return resp, status

    data = request.get_json()
    new_stage = data.get('stage')
    if not new_stage:
        return jsonify({"error": "Stage is required"}), 400

    candidate.stage = new_stage
    return commit_or_rollback(candidate)

# Route used for adding dummy candidates
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
