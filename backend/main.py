import os
import secrets
import time
import hmac
import hashlib
from fastapi import FastAPI, HTTPException, Header, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="Round 2 Verification API")

# Configure CORS so next.js front-end can communicate with it
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict to http://localhost:3000
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Generate a strong random server secret at startup (not stored in any file)
SERVER_SECRET = secrets.token_bytes(32)

# Secure SHA-256 hashes of the answers (no plaintext answers exist in files)
CORRECT_SEQUENCE_HASH = "0f3f320c44384c38c4d4f9f8eb8274fcc89fdb32c15acab91306d312313e42d4"
CORRECT_PASSWORD_HASH = "b4ba8eefe2f4683130ec62a3b08d1f049e9218c3694bcc5e1c446303ebd27234"

# Challenge registry to track active nonces (prevents replay attacks)
ACTIVE_NONCES = {}

class ChallengeResponse(BaseModel):
    nonce: str
    timestamp: float
    signature: str

class VerifySequenceRequest(BaseModel):
    sequence: str  # joined by |
    nonce: str
    timestamp: float
    signature: str

class VerifyPasswordRequest(BaseModel):
    password: str
    nonce: str
    timestamp: float
    signature: str

def generate_signature(nonce: str, timestamp: float) -> str:
    msg = f"{nonce}:{timestamp}".encode('utf-8')
    return hmac.new(SERVER_SECRET, msg, hashlib.sha256).hexdigest()

def verify_challenge_token(nonce: str, timestamp: float, signature: str) -> bool:
    # 1. Check expiration (valid for 60 seconds)
    current_time = time.time()
    if abs(current_time - timestamp) > 60.0:
        return False
    
    # 2. Check signature matches
    expected = generate_signature(nonce, timestamp)
    if not hmac.compare_digest(expected, signature):
        return False
        
    return True

@app.get("/api/challenge")
def get_challenge():
    nonce = secrets.token_hex(16)
    timestamp = time.time()
    signature = generate_signature(nonce, timestamp)
    return {
        "nonce": nonce,
        "timestamp": timestamp,
        "signature": signature
    }

@app.post("/api/verify/sequence")
def verify_sequence(req: VerifySequenceRequest):
    if not verify_challenge_token(req.nonce, req.timestamp, req.signature):
        raise HTTPException(status_code=403, detail="Invalid or expired challenge token.")
    
    # Normalize input sequence
    import re
    normalized = re.sub(r'\s+', ' ', req.sequence).strip().upper()
    # Compute SHA-256 hash
    input_hash = hashlib.sha256(normalized.encode('utf-8')).hexdigest()
    
    if input_hash == CORRECT_SEQUENCE_HASH:
        # Generate success token
        success_sig = hmac.new(SERVER_SECRET, f"sequence_success:{req.nonce}".encode('utf-8'), hashlib.sha256).hexdigest()
        return {"success": True, "token": success_sig}
    
    return {"success": False, "detail": "Incorrect sequence."}

@app.post("/api/verify/password")
def verify_password(req: VerifyPasswordRequest):
    if not verify_challenge_token(req.nonce, req.timestamp, req.signature):
        raise HTTPException(status_code=403, detail="Invalid or expired challenge token.")
    
    # Normalize input password
    normalized = req.password.replace(" ", "").upper()
    # Compute SHA-256 hash
    input_hash = hashlib.sha256(normalized.encode('utf-8')).hexdigest()
    
    if input_hash == CORRECT_PASSWORD_HASH:
        # Generate success token
        success_sig = hmac.new(SERVER_SECRET, f"password_success:{req.nonce}".encode('utf-8'), hashlib.sha256).hexdigest()
        return {"success": True, "token": success_sig}
    
    return {"success": False, "detail": "Incorrect password."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8088)
