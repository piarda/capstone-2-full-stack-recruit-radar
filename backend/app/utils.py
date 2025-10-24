import re
from app import db
from flask import jsonify
from .models import Candidate

class ValidationError(Exception):
    pass

def validate_name(name):
    if not name or len(name.strip()) == 0:
        raise ValidationError("Name cannot be empty")
    
def validate_email(email):
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if not email or not re.match(pattern, email):
        raise ValidationError("Invalid email format")

def validate_phone(phone):
    if phone and not re.match(r'^\+?1?\d{9,15}$', phone):
        raise ValidationError("Invalid phone format")
    
def get_candidate_or_404(candidate_id):
    candidate = Candidate.query.get(candidate_id)
    if not candidate:
        return None, jsonify({"error": "Candidate not found"}), 404
    return candidate, None, None

def commit_or_rollback(obj=None, success_status=200, message=None):
    try:
        db.session.commit()
        if message:
            return jsonify({"message": message}), success_status
        elif obj:
            return jsonify(obj.to_dict()), success_status
        else:
            return jsonify({"success": True}), success_status
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400
