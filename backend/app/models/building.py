import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Building(Base):
    __tablename__ = "buildings"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = Column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    building_number = Column(String(50), nullable=False)
    building_type = Column(String(50), default="Residential")     # Residential, Commercial, Outbuilding
    area = Column(Float, nullable=False, default=0.0)             # Footprint area in square meters
    confidence = Column(Float, nullable=False, default=0.90)      # AI confidence
    roof_type = Column(String(50), default="Gabled/Flat")
    
    # GeoJSON geometry stored as serialized JSON string
    geometry = Column(Text, nullable=False)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    project = relationship("Project", back_populates="buildings")
