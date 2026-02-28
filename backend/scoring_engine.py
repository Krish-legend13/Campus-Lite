import re
from schemas import EmailInput

def get_heuristic_score(email: EmailInput) -> float:
    score = 0.0
    
    # Suspicious keywords
    suspicious_keywords = ["urgent", "password", "verify", "account suspended", "login", "click here", "payment"]
    content = (email.subject + " " + email.body).lower()
    for kw in suspicious_keywords:
        if kw in content:
            score += 15
            
    # IP-based URLs (very basic regex check)
    ip_pattern = re.compile(r"\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b")
    if ip_pattern.search(email.body):
        score += 30
        
    # Display-name mismatch
    name_parts = email.sender_name.lower().split()
    if name_parts and name_parts[0] not in email.sender_email.lower():
        score += 20
        
    # Attachment risk
    if email.has_attachment:
        dangerous_exts = [".exe", ".scr", ".zip", ".vbs", ".js"]
        if email.attachment_ext.lower() in dangerous_exts:
            score += 40
            
    return min(score, 100.0)

def generate_reasons(email: EmailInput, score: float) -> list[str]:
    reasons = []
    if score >= 30:
        reasons.append("Contains urgent or suspicious keywords often found in phishing.")
    if email.has_attachment and email.attachment_ext in [".exe", ".scr", ".zip"]:
        reasons.append("Contains a potentially dangerous attachment type.")
    if "http://" in email.body or re.search(r"\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b", email.body):
        reasons.append("Contains suspicious links or IP addresses instead of domain names.")
    if email.sender_name.lower().split()[0] not in email.sender_email.lower():
        reasons.append("Sender name does not match the email address.")
    if not reasons and score > 0:
        reasons.append("Displays slight anomalies compared to normal university communications.")
    if not reasons:
        reasons.append("Looks like a safe, standard email.")
    return reasons
