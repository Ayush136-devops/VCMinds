# db.py
from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import datetime
import os

# TEMPORARY: Hardcode the URL for testing
DATABASE_URL = "postgresql://postgres.rvgxzcwleefwtrmottrz:Kaustubh%4005@aws-1-us-east-1.pooler.supabase.com:6543/postgres"

# Or use environment variable with hardcoded fallback
# DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres.rvgxzcwleefwtrmottrz:Kaustubh%4005@aws-1-us-east-1.pooler.supabase.com:6543/postgres")

if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_recycle=3600,
    echo=False
)

SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
Base = declarative_base()

class StartupDocument(Base):
    __tablename__ = "startup_documents"
    id = Column(Integer, primary_key=True, index=True)
    file_name = Column(String(200))
    upload_time = Column(DateTime, default=datetime.datetime.utcnow)
    text = Column(Text)
    analysis_status = Column(String(32), default="uploaded")
    analysis_result = Column(Text)

def init_db():
    Base.metadata.create_all(bind=engine)