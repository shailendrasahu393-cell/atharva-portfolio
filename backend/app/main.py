import json
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from sse_starlette.sse import EventSourceResponse
from pydantic import BaseModel
from typing import List
from app.services.profile_import_service import merge_profile_data
from app.services.ai_service import get_chat_response

app = FastAPI(title="AI Portfolio API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    history: List[ChatMessage] = []

@app.get("/")
async def root():
    return {"status": "ok", "message": "Atharva Portfolio API is running"}

@app.get("/health")
@app.get("/api/health")
async def health_check():
    return {"status": "ok"}

@app.get("/api/profile")
async def get_profile():
    return merge_profile_data()

@app.get("/api/projects")
async def get_projects():
    data = merge_profile_data()
    return data.get("projects", [])

@app.get("/api/skills")
async def get_skills():
    data = merge_profile_data()
    return data.get("skills", {})

@app.post("/api/chat")
async def chat_endpoint(request: ChatRequest):
    return EventSourceResponse(get_chat_response(request.message, request.history))
