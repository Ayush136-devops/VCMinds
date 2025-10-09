# 🚀 VCMinds Backend

VCMinds is a backend service for **automating the analysis of startup pitch decks** using state-of-the-art **LLMs (Groq, Llama-3/4)**.  
It supports **PDF** and **PowerPoint (PPTX)** uploads, extracts text, and runs automated **VC-style startup evaluations**.

---

## ✨ Features

- 📤 Upload startup pitch decks (PDF/PPTX)
- 🔍 Extracts complete document text for further analysis
- 🤖 Runs LLM-powered workflow analysis (company info, risks, key insights)
- 💾 Persistent database for storing and retrieving data
- 🔗 Ready for seamless frontend integration

---

## ⚙️ Quickstart

### 1. Clone the Repository & Setup Environment

```bash
git clone https://github.com/your-org/VCMinds.git
cd VCMinds/backend

# Create a virtual environment
python -m venv venv

# Activate it
source venv/bin/activate   # On macOS/Linux
venv\Scripts\activate      # On Windows

# Install dependencies
pip install -r requirements.txt

2. Add Your Groq API Key

Ask an admin for the latest .env file OR

Create a file named .env in the backend root (⚠️ not inside app/) with:

GROQ_API_KEY=sk-...yourkey...


Never commit your .env file to GitHub!

3. Run the Backend Server
uvicorn app.main:app --reload


Swagger UI → http://127.0.0.1:8000/docs

Try:

POST /upload_deck/ → Upload PDF or PPTX

GET /analyze/{doc_id} → Analyze deck content

4. Database

The backend uses SQLite by default (vcminds.db) for data persistence.

It will be automatically created on the first run.

5. Folder Structure
backend/
├── app/
│   ├── main.py
│   ├── db.py
├── vcminds.db
├── .env
├── requirements.txt
└── ...

👥 Contributors

Add all team members here with links to their GitHub profiles!

🧩 Troubleshooting

If Groq LLM outputs "Not Provided", verify:

The text extraction worked correctly.

The model prompt and API key configuration.

For model/LLM errors:

Confirm your .env key.

Check the Groq console for the latest model versions and naming.

💬 Questions?

Open an issue or ping the project admin for help!