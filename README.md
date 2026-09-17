Missio — Temporary Staffing Matching

A swipe-based matching application connecting employers with temporary workers.

Employer space: post job listings (pay, working hours, period, location) and view the temporary workers who have matched with their listings.
Temporary worker space: define their search criteria, then swipe through job listings (left = skip, right = match).

Tech stack: React (Vite) + Python (FastAPI) + SQLite.

Starting the Application
./start.sh

This script installs the dependencies if necessary, initializes the database with demo data on the first launch, and then starts:

Frontend: http://localhost:5173
Backend (API + interactive documentation): http://localhost:8000/docs
Demo Accounts
Role	Email	Password
Employer (Bordeaux)	employeur.bordeaux@demo.fr	demo1234
Employer (Paris)	employeur.paris@demo.fr	demo1234
Temporary Worker	interimaire@demo.fr	demo1234
Stopping the Application
./stop.sh
Resetting Demo Data
cd backend && source .venv/bin/activate && python -m app.seed

⚠️ This command deletes all existing data.
