from fastapi import FastAPI, HTTPException, File, UploadFile, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from app.db import SessionLocal, init_db, StartupDocument
import pdfplumber
from pptx import Presentation
import io
import os
import json
import re
from dotenv import load_dotenv
import google.generativeai as genai
from google.generativeai.types import HarmCategory, HarmBlockThreshold

load_dotenv()
print("LOADED GEMINI API KEY:", os.getenv("GEMINI_API_KEY"))

app = FastAPI(title="VCMinds Backend API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

init_db()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/upload_deck/")
async def upload_deck(file: UploadFile = File(...), db: Session = Depends(get_db)):
    filename = file.filename.lower()
    contents = await file.read()
    all_text = ""

    if filename.endswith(".pdf"):
        with pdfplumber.open(io.BytesIO(contents)) as pdf:
            all_text = "".join([page.extract_text() or "" for page in pdf.pages])
        doc_type = "pdf"
    elif filename.endswith(".pptx"):
        prs = Presentation(io.BytesIO(contents))
        text_runs = []
        for slide in prs.slides:
            for shape in slide.shapes:
                if hasattr(shape, "text"):
                    text_runs.append(shape.text)
        all_text = "\n".join(text_runs)
        doc_type = "pptx"
    else:
        raise HTTPException(status_code=400, detail="Only PDF and PPTX files are supported.")

    doc = StartupDocument(
        file_name=file.filename,
        text=all_text,
        analysis_status="uploaded"
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)
    return {"doc_id": doc.id, "file_name": doc.file_name, "doc_type": doc_type}

@app.get("/doc/{doc_id}")
def get_document(doc_id: int, db: Session = Depends(get_db)):
    doc = db.query(StartupDocument).filter(StartupDocument.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return {
        "doc_id": doc.id,
        "file_name": doc.file_name,
        "upload_time": doc.upload_time,
        "text": doc.text,
        "analysis_status": doc.analysis_status,
        "analysis_result": doc.analysis_result
    }

@app.post("/analyze/{doc_id}")
def analyze_document(doc_id: int, db: Session = Depends(get_db)):
    doc = db.query(StartupDocument).filter(StartupDocument.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    pitch_text = doc.text or ""
    
    prompt = f"""
You are a venture capital analyst specializing in startup due diligence.
Analyze the following pitch deck carefully and extract key investment information.
Focus on clarity, accuracy, and investor-relevant insight.
Return ONLY a valid JSON object — no extra text, markdown, or explanations.

If any field is missing or unclear, return "Not provided".

*For 'Overall Score', give an integer from 1 (poor) to 10 (excellent) reflecting the investment quality of this startup based on the pitch deck. Always fill this with your AI evaluation — do NOT repeat the default.*

The response should exactly follow this format:

{{
  "Company Name": "",
  "Founder(s)": "",
  "Problem Statement": "",
  "Solution Overview": "",
  "Market Size": "",
  "Business Model": "",
  "Traction": "",
  "Funding Ask": "",
  "Key Risks/Red Flags": "",
  "1-Sentence Investment Summary": "",
  "Overall Score": <AI-GENERATED SCORE from 1 to 10>
}}

Pitch deck text:
{pitch_text[:8000]}
"""

    gemini_api_key = os.getenv("GEMINI_API_KEY")
    if not gemini_api_key:
        raise HTTPException(status_code=500, detail="Gemini API key missing")

    try:
        genai.configure(api_key=gemini_api_key)
        model = genai.GenerativeModel('models/gemini-2.5-flash')
        
        safety_settings = {
            HarmCategory.HARM_CATEGORY_HARASSMENT: HarmBlockThreshold.BLOCK_NONE,
            HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlockThreshold.BLOCK_NONE,
            HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: HarmBlockThreshold.BLOCK_NONE,
            HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_NONE,
        }
        
        response = model.generate_content(prompt, safety_settings=safety_settings)
        raw_content = response.text
        print("RAW CONTENT FROM GEMINI:\n", raw_content)

        match = re.search(r"\{.*\}", raw_content, re.DOTALL)
        if not match:
            raise HTTPException(status_code=500, detail="No JSON found in model output")
        json_str = match.group(0)

        analysis_result = json.loads(json_str)
        doc.analysis_result = json.dumps(analysis_result)
        doc.analysis_status = "analyzed"
        db.commit()
        db.refresh(doc)
        return {"doc_id": doc.id, "analysis_result": analysis_result}

    except json.JSONDecodeError as e:
        print(f"JSON DECODE ERROR: {e}")
        doc.analysis_status = "error"
        db.commit()
        raise HTTPException(status_code=500, detail=f"JSON parsing failed: {str(e)}")
    except Exception as e:
        print(f"ANALYSIS ERROR: {e}")
        doc.analysis_status = "error"
        db.commit()
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@app.get("/docs/")
def list_all_docs(db: Session = Depends(get_db)):
    docs = db.query(StartupDocument).filter(StartupDocument.analysis_status == "analyzed").all()
    return {
        "startups": [
            {
                "id": doc.id,
                "file_name": doc.file_name,
                "upload_time": doc.upload_time.isoformat() if doc.upload_time else None,
                "analysis_result": doc.analysis_result
            }
            for doc in docs
        ]
    }
