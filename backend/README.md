
# Backend - Recruit Radar

This is the backend API for the Recruit Radar, built with Flask and SQLAlchemy.


## Technologies:
- Flask (Python)
- Flask-CORS
- Flask-Migrate
- SQLAlchemy
- SQLite
- Faker


## Setup Instructions:
1. Navigate to the backend folder:
    cd backend

2. Install dependencies:
    pip install -r requirements.txt

3. Run the server:
    python3 run.py

Server runs on on http://127.0.0.1:5050


## API Endpoints Overview:
GET /candidates – List all candidates
POST /candidates – Create a new candidate
GET /candidates/<id> – Get candidate details
PUT /candidates/<id> – Update candidate
PUT /candidates/<id>/archive – Archive candidate
PUT /candidates/<id>/unarchive – Unarchive candidate
GET /candidates/archived – List archived candidates
GET /candidates/<id>/followups – List candidate follow-ups
PUT /candidates/<id>/stage – Update candidate stage
POST /candidates/seed_followups – Seed dummy follow-ups

