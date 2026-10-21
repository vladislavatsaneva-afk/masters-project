from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
import app.db.base_imports
from app.api.routes import signals, auth
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import (officers, emergency_calls, drafts, dashboard)


app = FastAPI()

app.include_router(signals.router)
app.include_router(auth.router)
app.include_router(officers.router)
app.include_router(emergency_calls.router)
app.include_router(drafts.router)
app.include_router(dashboard.router)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "API running"}