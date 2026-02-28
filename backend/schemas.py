from pydantic import BaseModel
from typing import List

class ScoreResult(BaseModel):
    score: float
    level: str
    reasons: List[str]
    confidence: str

class EmailInput(BaseModel):
    subject: str
    sender_email: str
    sender_name: str
    body: str
    has_attachment: bool
    attachment_ext: str = ""

class CheckPhishingRequest(BaseModel):
    user_id: str
    email: EmailInput

class ConsentRequest(BaseModel):
    anonymized_user_id: str
    role: str
    consent_status: bool

class StatsResponse(BaseModel):
    total_phishing_clicks: int
    total_lessons_completed: int
    privacy_noise_applied: bool
