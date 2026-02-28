from sqlalchemy import Column, Integer, String, Boolean, Float
from database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True, index=True) # UUID anonymized
    role = Column(String, default="Student")
    consent_status = Column(Boolean, default=False)
    clicked_phishing_count = Column(Integer, default=0)
    lessons_completed = Column(Integer, default=0)

class GlobalStats(Base):
    __tablename__ = "global_stats"
    id = Column(Integer, primary_key=True, index=True)
    total_phishing_clicks = Column(Integer, default=0)
    total_lessons_completed = Column(Integer, default=0)
