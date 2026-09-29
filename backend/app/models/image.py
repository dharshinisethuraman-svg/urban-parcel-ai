import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Image(Base):
    __tablename__ = "images"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = Column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    filename = Column(String(255), nullable=False)
    filepath = Column(String(512), nullable=False)
    file_size = Column(Integer, nullable=False, default=0)
    width = Column(Integer, nullable=True, default=0)
    height = Column(Integer, nullable=True, default=0)
    
    # Bounding coordinates for Leaflet ImageOverlay (South, West, North, East)
    bounds_south = Column(Float, nullable=True)
    bounds_west = Column(Float, nullable=True)
    bounds_north = Column(Float, nullable=True)
    bounds_east = Column(Float, nullable=True)

    upload_date = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    processing_status = Column(String(50), default="uploaded")  # uploaded, processing, completed, failed

    # Relationships
    project = relationship("Project", back_populates="images")
