from sqlalchemy import Column, String, DateTime, ForeignKey, JSON
from sqlalchemy import Uuid as UUID
from sqlalchemy.orm import relationship
import uuid, datetime
from app.database import Base

class Report(Base):
    __tablename__ = "reports"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    job_id = Column(UUID(as_uuid=True), ForeignKey("analysis_jobs.id"))
    pdf_path = Column(String)
    recommendations = Column(JSON)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    job = relationship("AnalysisJob", back_populates="report")