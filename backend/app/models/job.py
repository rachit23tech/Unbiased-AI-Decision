from sqlalchemy import Column, String, DateTime, ForeignKey, JSON, Enum
from sqlalchemy import Uuid as UUID
from sqlalchemy.orm import relationship
import uuid, datetime
from app.database import Base

class AnalysisJob(Base):
    __tablename__ = "analysis_jobs"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    dataset_id = Column(UUID(as_uuid=True), ForeignKey("datasets.id"))
    model_id = Column(UUID(as_uuid=True), ForeignKey("ml_models.id"), nullable=True)
    status = Column(Enum("pending","running","done","failed", name="job_status"), default="pending")
    target_column = Column(String)
    sensitive_columns = Column(JSON)
    bias_score = Column(String, nullable=True)
    started_at = Column(DateTime, nullable=True)
    finished_at = Column(DateTime, nullable=True)
    dataset = relationship("Dataset", back_populates="jobs")
    results = relationship("BiasResult", back_populates="job")
    report = relationship("Report", back_populates="job", uselist=False)