import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, Float, Integer, DateTime
from sqlalchemy.orm import relationship
from app.database import Base

class Project(Base):
    __tablename__ = "projects"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    location = Column(String(255), nullable=True, default="Urban Area")
    center_lat = Column(Float, nullable=False, default=12.9716)   # Default sample latitude
    center_lng = Column(Float, nullable=False, default=77.5946)   # Default sample longitude
    zoom_level = Column(Integer, nullable=False, default=18)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    images = relationship("Image", back_populates="project", cascade="all, delete-orphan")
    parcels = relationship("Parcel", back_populates="project", cascade="all, delete-orphan")
    buildings = relationship("Building", back_populates="project", cascade="all, delete-orphan")
    roads = relationship("Road", back_populates="project", cascade="all, delete-orphan")
    processing_jobs = relationship("ProcessingJob", back_populates="project", cascade="all, delete-orphan")
