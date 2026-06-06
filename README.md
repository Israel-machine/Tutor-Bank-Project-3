# Tutor-Bank-Project-3

TutorBank offers many essential solutions for freelance tutors who are often juggling school, other jobs, or lack the business tools to properly document all of their meetings. As a part-time tutor myself, I have found myself having to keep track of my meetings and billing manually, using rudimentary tools like google sheets to generate reports and keep track of my meetings. This meant writing all of my formulas from scratch and needing access to a laptop to enter meetings. This would prove to be a challenge after a long day or when I didn’t have immediate access to my laptop.  Allowing users to have a simple to use application would make logging sessions easier and therefore reduce the number of errors they commit when entering data long after the session has ended. 

Using this app, tutors will be able to log student data, record session-specific details (duration, subject, and hourly rates), and view a dynamic "Metrics Dashboard" that visualizes revenue and workload trends.

---

## Tech Stack & Key Architectures
- **Frontend:** React (Vite single-page application structure), React Router DOM, Centralized Context API for global session state management.
- **Backend:** Flask WSGI application engine.
- **Database/Security:** Flask-Bcrypt (salted password hashing) and secure JSON Web Tokens (`Flask-JWT-Extended`) for strict multi-user data isolation.
- **Styling:** Centralized custom CSS styling

---

## Overview of Features & Functionality

- **Secure Session Management:** Custom user registration and login forms with global login state indicators. Unauthenticated requests are immediately blocked via frontend protected router wrappers.
- **Dynamic Caseload Manager:** Full CRUD interface for student profiles featuring automated input regex filters (e.g., dynamic contact phone formatting).
- **Individual Session Logging:** Captures dates, subjects, customizable durations, hourly billing increments, and lesson progress notes.
- **Analytical Metrics:** Real-time summary generation displaying gross monthly revenues, total session logs, automated average lengths of meetings, visual representation of session data, and top-10 performance student rankings.

---

## Step-by-Step Installation & Local Setup
### Prerequisite Checklist
Ensure you have the following environments globally running on your host machine:
- **Python** (v3.9 or higher)
- **Node.js** (v16.x or higher) and **npm**

---

### Backend Server Setup:
cd backend
python run.py

### Frontend Server Setup:
cd frontend
npm install react-router-dom
