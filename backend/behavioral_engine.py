from sqlalchemy.orm import Session
from models import User
import datetime

def check_momentum(db: Session, user_id: str) -> tuple[bool, str]:
    """Checks for rapid clicking behavior (Personal Risk Momentum)."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return False, ""
    
    now = datetime.datetime.utcnow()
    
    # If last interaction was less than 30 seconds ago
    if user.last_interaction and (now - user.last_interaction).total_seconds() < 30:
        user.interaction_streak += 1
    else:
        # Reset streak if slow interaction
        user.interaction_streak = 1
        
    user.last_interaction = now
    db.commit()
    
    # Threshold for momentum (e.g., 3 rapid actions)
    if user.interaction_streak >= 3:
        return True, "You're moving too fast! Phishers rely on speed. Take a breath."
        
    return False, ""

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

