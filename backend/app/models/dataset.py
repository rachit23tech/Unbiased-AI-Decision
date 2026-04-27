from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, JSON
from sqlalchemy import Uuid as UUID
from sqlalchemy.orm import relationship
import uuid, datetime
from app.database import Base

class Dataset(Base):
    __tablename__ = "datasets"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    filename = Column(String)
    file_path = Column(String)
    row_count = Column(Integer)
    column_names = Column(JSON)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    owner = relationship("User", back_populates="datasets")
    jobs = relationship("AnalysisJob", back_populates="dataset")