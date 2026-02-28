from sqlalchemy.orm import Session
from models import User

def get_behavioral_modifier(db: Session, user_id: str) -> float:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return 0.0
        
    modifier = 0.0
    # Increase risk score if they keep clicking phishing
    if user.clicked_phishing_count > 0:
        modifier += (user.clicked_phishing_count * 10.0)
        
    # Decrease risk score if they completed lessons (shows better awareness)
    if user.lessons_completed > 0:
        modifier -= (user.lessons_completed * 5.0)
        
    # Cap the modifier
    return max(min(modifier, 30.0), -20.0)
