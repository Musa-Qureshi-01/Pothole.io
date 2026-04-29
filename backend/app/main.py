import os
import sys
from pathlib import Path

import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# --- Path setup (so `backend.` imports work) ---
_PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
if str(_PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(_PROJECT_ROOT))

# --- Load .env for LOCAL only (Railway uses its own env vars) ---
load_dotenv(dotenv_path=_PROJECT_ROOT / ".env")

# --- Routers ---
from backend.app.api.predict import router as predict_router

# --- App ---
app = FastAPI(title="Pothole Segmentation API")

# --- CORS: allow ONLY frontend origins ---
DEFAULT_ORIGINS = [
    "https://pothole-io.vercel.app",
    "https://pothole-4ltew161q-musa-qureshi-01s-projects.vercel.app",
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
]


env_origins = os.getenv("CORS_ORIGINS", "")
origins = [o.strip() for o in env_origins.split(",") if o.strip()] or DEFAULT_ORIGINS

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,  # keep True if you use cookies/auth
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Health check ---
@app.get("/")
def root():
    return {"status": "ok", "service": "pothole-api"}


# --- Turnstile Server-Side Validation ---
TURNSTILE_SECRET_KEY = os.getenv("TURNSTILE_SECRET_KEY", "")


class TurnstileVerifyRequest(BaseModel):
    token: str


@app.post("/api/turnstile-verify")
async def verify_turnstile(req: TurnstileVerifyRequest):
    """Validate a Cloudflare Turnstile token server-side."""
    if not TURNSTILE_SECRET_KEY:
        raise HTTPException(status_code=500, detail="TURNSTILE_SECRET_KEY not configured")

    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://challenges.cloudflare.com/turnstile/v0/siteverify",
            data={
                "secret": TURNSTILE_SECRET_KEY,
                "response": req.token,
            },
            timeout=10,
        )

    result = response.json()
    if not result.get("success"):
        raise HTTPException(status_code=400, detail={"success": False, "error-codes": result.get("error-codes", [])})

    return {"success": True}


# --- Routes ---
app.include_router(predict_router)