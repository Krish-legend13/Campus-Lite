import re
import math
import os
import json
from dotenv import load_dotenv
import google.generativeai as genai
from schemas import EmailInput, PsychologicalTrigger

load_dotenv()

# Configure GenAI
api_key = os.getenv("GEMINI_API_KEY")
model_name = os.getenv("GEMINI_MODEL", "gemini-1.5-flash") # Defaulting to 1.5-flash as requested

if api_key:
    genai.configure(api_key=api_key)

def calculate_entropy(text: str) -> float:
    """Calculates the Shannon entropy of a string."""
    if not text:
        return 0.0
    entropy = 0
    for x in range(256):
        p_x = float(text.count(chr(x))) / len(text)
        if p_x > 0:
            entropy += - p_x * math.log(p_x, 2)
    return entropy

def detect_psychological_triggers(email: EmailInput) -> list[PsychologicalTrigger]:
    """
    Uses Gemini API if available to detect psychological manipulation.
    Falls back to keyword matching if no API key is set.
    """
    triggers = []
    content = (email.subject + " " + email.body).lower()

    # ---------------------------------------------------------
    # 1. AI-POWERED DETECTION (GEMINI)
    # ---------------------------------------------------------
    if api_key and api_key != "YOUR_API_KEY_HERE":
        try:
            model = genai.GenerativeModel(model_name)
            prompt = f"""
            Analyze the following email for psychological manipulation tactics used in phishing.
            
            Email Subject: {email.subject}
            Email Sender: {email.sender_name} <{email.sender_email}>
            Email Body: {email.body}
            
            Identify up to 3 distinct psychological triggers.
            Return ONLY a valid JSON array of objects with these keys:
            - category: string (e.g., "Urgency", "Fear", "Authority", "Curiosity", "Social Proof")
            - description: string (short explanation of how it is used in this specific email)
            - confidence: float (0.0 to 1.0)
            
            If no strong triggers are found, return an empty array [].
            """
            
            response = model.generate_content(prompt)
            
            # Simple cleaning of response text to ensure JSON parsing
            clean_text = response.text.replace("```json", "").replace("```", "").strip()
            data = json.loads(clean_text)
            
            for item in data:
                triggers.append(PsychologicalTrigger(
                    category=item.get("category", "Unknown"),
                    description=item.get("description", ""),
                    confidence=float(item.get("confidence", 0.0))
                ))
            return triggers

        except Exception as e:
            print(f"Gemini API Error: {e}")
            # Fallback to heuristic if API fails
            pass

    # ---------------------------------------------------------
    # 2. HEURISTIC FALLBACK (If no API key or API fails)
    # ---------------------------------------------------------
    
    # 1. Urgency / Fear
    urgency_keywords = ["urgent", "immediately", "24 hours", "suspended", "expire", "critical", "warning"]
    urgency_score = sum(1 for kw in urgency_keywords if kw in content)
    if urgency_score > 0:
        triggers.append(PsychologicalTrigger(
            category="Urgency & Fear",
            description="Uses time pressure to bypass critical thinking.",
            confidence=min(0.5 + (urgency_score * 0.1), 0.95)
        ))
        
    # 2. Authority
    authority_keywords = ["admin", "ceo", "president", "security team", "it support", "legal", "compliance"]
    auth_score = sum(1 for kw in authority_keywords if kw in content) or ("admin" in email.sender_name.lower())
    if auth_score:
        triggers.append(PsychologicalTrigger(
            category="Authority",
            description="Impersonates a trusted figure to demand compliance.",
            confidence=0.85
        ))
        
    # 3. Curiosity / Greed
    greed_keywords = ["prize", "winner", "invoice attached", "delivery failed", "salary", "bonus"]
    if any(kw in content for kw in greed_keywords):
        triggers.append(PsychologicalTrigger(
            category="Curiosity & Greed",
            description="Leverages desire for gain or missing out (FOMO).",
            confidence=0.75
        ))
        
    return triggers

def get_heuristic_score(email: EmailInput) -> float:
    score = 0.0
    reasons = []

    # Suspicious keywords
    suspicious_keywords = ["urgent", "password", "verify", "account suspended", "login", "click here", "payment", "immediate action"]
    content = (email.subject + " " + email.body).lower()
    for kw in suspicious_keywords:
        if kw in content:
            score += 15
            
    # IP-based URLs
    ip_pattern = re.compile(r"\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b")
    if ip_pattern.search(email.body):
        score += 30
        
    # Display-name mismatch
    name_parts = email.sender_name.lower().split()
    if name_parts and name_parts[0] not in email.sender_email.lower():
        score += 20
    
    # Entropy-based domain randomness (Mocking domain extraction)
    # Checks if the part before @ or domain has high entropy (random characters)
    try:
        domain_part = email.sender_email.split('@')[1]
        if calculate_entropy(domain_part) > 3.5: # Threshold for randomness
            score += 25
    except IndexError:
        pass
        
    # Attachment risk
    if email.has_attachment:
        dangerous_exts = [".exe", ".scr", ".zip", ".vbs", ".js"]
        if email.attachment_ext.lower() in dangerous_exts:
            score += 40
            
    return min(score, 100.0)


def generate_reasons(email: EmailInput, score: float) -> list[str]:
    reasons = []
    
    # Re-evaluating for specific reasons to return
    if any(kw in (email.subject + " " + email.body).lower() for kw in ["urgent", "password", "verify", "account suspended"]):
         reasons.append("Contains urgent or suspicious keywords associated with phishing.")

    if email.has_attachment and email.attachment_ext in [".exe", ".scr", ".zip", ".vbs", ".js"]:
        reasons.append(f"Contains a high-risk attachment type ({email.attachment_ext}).")

    if re.search(r"\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b", email.body):
        reasons.append("Contains raw IP addresses in the body, which is a strong phishing indicator.")

    if email.sender_name.lower().split()[0] not in email.sender_email.lower():
         reasons.append("Sender display name does not match the email address.")

    try:
        domain_part = email.sender_email.split('@')[1]
        if calculate_entropy(domain_part) > 3.5:
             reasons.append("Sender domain appears randomly generated (high entropy).")
    except:
        pass

    if not reasons and score > 20:
        reasons.append("Exhibits anomalous patterns typical of phishing attempts.")
    
    if score < 20: 
        reasons.append("No significant threats detected.")

    return reasons
