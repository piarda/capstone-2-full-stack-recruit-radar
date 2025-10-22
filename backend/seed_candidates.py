from faker import Faker
from app import create_app, db
from app.models import Candidate
import random

app = create_app()
faker = Faker()

stage_options = ['Sourcing', 'Application', 'Phone Screen', 'Interviewing', 'Offer', 'Hired', 'Rejected']

with app.app_context():
    for _ in range(50):
        candidate = Candidate(
            name=faker.name(),
            email=faker.unique.email(),
            phone=faker.phone_number(),
            notes=faker.text(max_nb_chars=200),
            archived=False,
            stage=random.choice(stage_options)
        )
        db.session.add(candidate)
    db.session.commit()
    print("50 'fake' candidates added.")
