# Recruit Radar

A simple web application for recruiters to manage candidates, track follow-ups, and handle stages in a recruitment workflow.


## Technologies Used:
- Backend: Flask (Python), Flask-CORS, Flask-Migrate, SQLAlchemy, Faker
- Frontend: React (JavaScript), useEffect/useState, CSS, HTML
- Database: SQLite


## Setup and Run Instructions:
1. Clone the repository and run:
   git clone https://github.com/piarda/capstone-2-full-stack-recruit-radar.git
   cd capstone-2-full-stack-recruit-radar

2. Backend setup:
    cd backend
    pip install -r requirements.txt

3. Frontend setup:
    cd frontend
    npm install

4. Run the backend:
    python3 run.py

5. Run the frontend:
    npm run dev


## Core Functionality:
- Create, read, and update candidates and info
- Archive/unarchive candidates
- Track and sort candidate follow-ups
- Update candidate stages
    -- Stages include: 'Sourcing', 'Application', 'Phone Screen', 'Interviewing', 'Offer', 'Hired', and 'Rejected'
- Validation for name, email, and phone


------------------------------------------------------
## Please proceed to read backend and frontend READMEs
