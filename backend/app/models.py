from app import db
from datetime import datetime, timezone

class Candidate(db.Model):
    __tablename__ = 'candidates'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    phone = db.Column(db.String(20))
    notes = db.Column(db.Text)
    archived = db.Column(db.Boolean, default=False)
    stage = db.Column(db.String(50), default='Sourcing')
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    followups = db.relationship('FollowUp', backref='candidate', cascade='all, delete-orphan')

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "phone": self.phone,
            "notes": self.notes,
            "archived": self.archived,
            "stage": self.stage,
            "created_at": self.created_at.isoformat(),
        }
    
class FollowUp(db.Model):
    __tablename__ = 'followups'

    id = db.Column(db.Integer, primary_key=True)
    candidate_id = db.Column(db.Integer, db.ForeignKey('candidates.id'), nullable=False)
    followup_date = db.Column(db.Date, nullable=False)
    status = db.Column(db.String(50), default='pending')
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            "id": self.id,
            "candidate_id": self.candidate_id,
            "followup_date": self.followup_date.isoformat(),
            "status": self.status,
            "notes": self.notes,
            "created_at": self.created_at.isoformat(),
        }
