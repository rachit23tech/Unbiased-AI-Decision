from sqlalchemy import Column, String, Float, Boolean, ForeignKey
from sqlalchemy import Uuid as UUID
from sqlalchemy.orm import relationship
import uuid
from app.database import Base

class BiasResult(Base):
    __tablename__ = "bias_results"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    job_id = Column(UUID(as_uuid=True), ForeignKey("analysis_jobs.id"))
    metric_name = Column(String)
    metric_value = Column(Float)
    threshold = Column(Float)
    passed = Column(Boolean)
    job = relationship("AnalysisJob", back_populates="results")