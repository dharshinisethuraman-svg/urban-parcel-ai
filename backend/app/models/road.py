import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Road(Base):
    __tablename__ = "roads"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = Column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    road_name = Column(String(100), default="Cadastral Access Way")
    road_type = Column(String(50), default="Paved / Asphalt")      # Paved, Unpaved, Pathway, Primary
    width_m = Column(Float, nullable=False, default=6.0)          # Estimated width in meters
    length_m = Column(Float, nullable=False, default=0.0)         # Estimated length in meters
    confidence = Column(Float, nullable=False, default=0.88)
    
    # GeoJSON geometry stored as serialized JSON string (LineString or Polygon)
    geometry = Column(Text, nullable=False)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    project = relationship("Project", back_populates="roads")
