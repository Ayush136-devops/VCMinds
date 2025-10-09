from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
import datetime

DATABASE_URL = "sqlite:///./vcminds.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)

Base = declarative_base()

class StartupDocument(Base):
    __tablename__ = "startup_documents"

    id = Column(Integer, primary_key=True, index=True)
    file_name = Column(String(200))
    upload_time = Column(DateTime, default=datetime.datetime.utcnow)
    text = Column(Text)
    analysis_status = Column(String(32), default="uploaded")  # uploaded / analyzed / error
    analysis_result = Column(Text)  # Store as JSON string or summary from LLM

def init_db():
    Base.metadata.create_all(bind=engine)
