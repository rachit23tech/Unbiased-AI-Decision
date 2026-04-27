from sqlalchemy import Column, String, DateTime, Enum
from sqlalchemy import Uuid as UUID
from sqlalchemy.orm import relationship
import uuid, datetime
from app.database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(Enum("admin", "analyst", name="user_role"), default="analyst")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    datasets = relationship("Dataset", back_populates="owner")