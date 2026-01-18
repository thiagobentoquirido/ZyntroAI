from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from app.model import ZyntroModel

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

model = ZyntroModel()

class ChatRequest(BaseModel):
    message: str

@app.get("/")
def root():
    return {"status": "ZyntroAI online 🤖✨"}

@app.post("/chat")
def chat(data: ChatRequest):
    return {"response": model.chat(data.message)}

@app.post("/process")
async def process_image(
    file: UploadFile = File(...),
    prompt: str = Form(...)
):
    image_bytes = await file.read()
    text = model.analyze_image(image_bytes, prompt)
    return {"text": text, "image": None}
