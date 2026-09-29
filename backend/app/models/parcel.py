import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Parcel(Base):
    __tablename__ = "parcels"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = Column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    parcel_number = Column(String(50), nullable=False)
    area = Column(Float, nullable=False, default=0.0)             # Calculated area in square meters
    perimeter = Column(Float, nullable=False, default=0.0)        # Boundary perimeter in meters
    confidence = Column(Float, nullable=False, default=0.85)      # Confidence score (0.0 - 1.0)
    status = Column(String(50), default="AI Detected")            # "AI Detected", "User Corrected", "Verified"
    land_use = Column(String(100), default="Residential")
    owner_info = Column(String(255), default="Urban Cadastre Registry")
    
    # GeoJSON geometry stored as serialized JSON string: {"type": "Polygon", "coordinates": [...]}
    geometry = Column(Text, nullable=False)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    project = relationship("Project", back_populates="parcels")
