import os
import sys
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

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
    "http://localhost:5174",
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

# --- Routes ---
app.include_router(predict_router)