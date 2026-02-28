from fastapi import FastAPI, Depends, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import database
import models
import schemas
from scoring_engine import get_heuristic_score, generate_reasons
from behavioral_engine import get_behavioral_modifier
from privacy import apply_laplace_noise

models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="CampusShield Lite API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For hackathon simplicity
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_db():
    db = database.SessionLocal()
    if not db.query(models.GlobalStats).first():
        db.add(models.GlobalStats(id=1, total_phishing_clicks=0, total_lessons_completed=0))
        db.commit()
    db.close()

@app.post("/consent")
def update_consent(req: schemas.ConsentRequest, db: Session = Depends(database.get_db)):
    user = db.query(models.User).filter(models.User.id == req.anonymized_user_id).first()
    if not user:
        user = models.User(id=req.anonymized_user_id, role=req.role, consent_status=req.consent_status)
        db.add(user)
    else:
        user.consent_status = req.consent_status
        user.role = req.role
    db.commit()
    return {"status": "success", "consent_status": user.consent_status}

@app.post("/revoke_consent")
def revoke_consent(user_id: str, db: Session = Depends(database.get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if user:
        user.consent_status = False
        db.commit()
        return {"status": "success", "message": "Consent revoked."}
    raise HTTPException(status_code=404, detail="User not found")

@app.post("/check_phishing", response_model=schemas.ScoreResult)
def check_phishing(req: schemas.CheckPhishingRequest, db: Session = Depends(database.get_db)):
    # Hybrid Scoring Engine
    h_score = get_heuristic_score(req.email)
    b_modifier = get_behavioral_modifier(db, req.user_id)
    
    final_score = min(max(h_score + b_modifier, 0.0), 100.0)
    
    if final_score < 30:
        level = "Low"
        confidence = "High"
    elif final_score < 70:
        level = "Medium"
        confidence = "Medium"
    else:
        level = "High"
        confidence = "High"
        
    reasons = generate_reasons(req.email, final_score)
    
    return schemas.ScoreResult(
        score=final_score,
        level=level,
        reasons=reasons,
        confidence=confidence
    )

@app.post("/record_click")
def record_click(user_id: str, db: Session = Depends(database.get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if user and user.consent_status:
        user.clicked_phishing_count += 1
        
    stats = db.query(models.GlobalStats).first()
    stats.total_phishing_clicks += 1
    db.commit()
    return {"status": "success"}

@app.post("/complete_lesson")
def complete_lesson(user_id: str, db: Session = Depends(database.get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if user and user.consent_status:
        user.lessons_completed += 1
        
    stats = db.query(models.GlobalStats).first()
    stats.total_lessons_completed += 1
    db.commit()
    return {"status": "success"}

@app.get("/admin/stats", response_model=schemas.StatsResponse)
def get_admin_stats(db: Session = Depends(database.get_db)):
    stats = db.query(models.GlobalStats).first()
    
    # Privacy Layer: Noise Injection
    noisy_clicks = apply_laplace_noise(stats.total_phishing_clicks)
    noisy_lessons = apply_laplace_noise(stats.total_lessons_completed)
    
    return schemas.StatsResponse(
        total_phishing_clicks=noisy_clicks,
        total_lessons_completed=noisy_lessons,
        privacy_noise_applied=True
    )
