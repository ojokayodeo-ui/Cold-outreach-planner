import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import report

app = FastAPI(title="Cold Outreach Planner API", version="1.0.0")

_raw = os.getenv("ALLOWED_ORIGINS", "")
_extra = [o.strip() for o in _raw.split(",") if o.strip()]
allow_origins = ["http://localhost:3000"] + _extra

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(report.router, prefix="/api")

@app.get("/health")
async def health():
    return {"status": "ok"}
