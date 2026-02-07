"""
API FastAPI do serviço de IA (AGNO).
Endpoint: POST /chat — recebe message, sessionId, userId e retorna reply.
"""
import os
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Garantir que o diretório tmp existe (SqliteDb)
Path("tmp").mkdir(exist_ok=True)

from agent import chat

app = FastAPI(title="Loja IA Service", version="0.1.0")

# CORS: evita 405 em OPTIONS (preflight) quando frontend/backend chamam de outra origem
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "service": "ai-service",
        "docs": "/docs",
        "health": "/health",
        "chat": "POST /chat",
    }


class ChatRequest(BaseModel):
    message: str
    sessionId: str
    userId: str | None = None


class ChatResponse(BaseModel):
    reply: str


@app.get("/health")
def health():
    return {"status": "ok", "service": "ai-service"}


@app.post("/chat", response_model=ChatResponse)
def post_chat(body: ChatRequest):
    if not (body.message or "").strip():
        raise HTTPException(status_code=400, detail="message is required")
    session_id = (body.sessionId or "").strip() or "default"
    user_id = (body.userId or "").strip() or session_id
    reply = chat(body.message.strip(), session_id=session_id, user_id=user_id)
    return ChatResponse(reply=reply)


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run(app, host="0.0.0.0", port=port)
