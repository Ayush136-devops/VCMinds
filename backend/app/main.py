from fastapi import FastAPI, HTTPException, File, UploadFile, Depends
from sqlalchemy.orm import Session
from app.db import SessionLocal, init_db, StartupDocument
import pdfplumber
from pptx import Presentation
import io
import os
import json
from dotenv import load_dotenv
from groq import Groq

# Load environment variables from .env
load_dotenv()

print("LOADED API KEY:", os.getenv("GROQ_API_KEY"))

app = FastAPI(title="VCMinds Backend API")
init_db()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

PROMPT_TEMPLATE = """
You are an expert startup analyst for VC investors. Extract the following directly from the full text of a pitch deck. 
If information is missing, write "Not provided". 
Return your answer as a valid JSON object ONLY.

Fields to extract:
- Company Name
- Founder(s)
- Problem Statement
- Solution Overview
- Market Size
- Business Model
- Traction
- Funding Ask
- Key Risks/Red Flags
- 1-Sentence Investment Summary
- Overall Score (1-10, as a number)

Pitch deck text:
\"\"\"
{pitch_text}
\"\"\"
"""

@app.post("/upload_deck/")
async def upload_deck(file: UploadFile = File(...), db: Session = Depends(get_db)):
    filename = file.filename.lower()
    contents = await file.read()

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
    prompt = PROMPT_TEMPLATE.format(pitch_text=pitch_text[:4000])  # limit context to 4000 chars

    groq_api_key = os.getenv("GROQ_API_KEY")
    if not groq_api_key:
        raise HTTPException(status_code=500, detail="Groq API key missing")
    client = Groq(api_key=groq_api_key)

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",  # quick/cheap/free, change if needed
            messages=[{"role": "user", "content": prompt}],
            max_tokens=1024,
            temperature=0.2,
        )
        raw_content = response.choices[0].message.content
        print("RAW CONTENT FROM LLM:\n", raw_content)
        import re

        # Try to extract JSON object from inside triple backticks
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

    except Exception as e:
        doc.analysis_status = "error"
        db.commit()
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")
