import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class ProcessingJob(Base):
    __tablename__ = "processing_jobs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = Column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    status = Column(String(50), default="queued")     # queued, running, completed, failed
    progress_pct = Column(Integer, default=0)         # 0 - 100
    current_step = Column(String(100), default="Initialized")
    error_message = Column(Text, nullable=True)
    logs_json = Column(Text, default="[]")            # Serialized list of log step entries
    started_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    completed_at = Column(DateTime, nullable=True)

    # Relationships
    project = relationship("Project", back_populates="processing_jobs")
