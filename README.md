# CampusShield Lite

A consent-first, explainable phishing early-warning system with a privacy-preserving admin dashboard.

## 🚀 Setup Instructions

### Prerequisites
- Node.js (v18+)
- Python (3.10+)

### 1. Backend Setup
Open a terminal and navigate to the `backend` directory:
```bash
cd backend
```

Create a virtual environment:
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

Install dependencies and run:
```bash
pip install -r requirements.txt
uvicorn main:app --reload
```
*Note: SQLite database (`campusshield.db`) is automatically created on startup with test data.*

### 2. Frontend Setup
Open a new terminal and navigate to the `frontend` directory:
```bash
cd frontend
```

Install dependencies and run:
```bash
npm install
npm run dev
```

### 3. Usage
- App is running at `http://localhost:3000`
- Backend API is at `http://localhost:8000`
- **Student Role**: Simulates an inbox. Click malicious emails to see the explainable risk gauge and use the teach-back module.
- **Admin Role**: Simulates the privacy-first dashboard where noise is injected to prevent individual tracking.

## 🧠 Features
- **Hybrid Phishing Scoring**: Heuristic (keywords, IPs, extensions) + Behavioral scoring.
- **Privacy Layer**: Laplace-like noise injected into admin dashboard stats so individual user actions remain anonymous.
- **Explainability**: Plain-language explanations for why an email was flagged.
- **Teach-Back Module**: Micro-learning quiz when a user interacts with a risky email.
- **Consent-First**: Mock login requires explicit consent before any tracking.
