from datetime import datetime
from typing import Any, Dict, Optional
from pydantic import BaseModel, ConfigDict
from app.schemas.geojson import GeoJSONGeometry

class ParcelBase(BaseModel):
    parcel_number: str
    area: float
    perimeter: float
    confidence: float
    status: str = "AI Detected"
    land_use: str = "Residential"
    owner_info: Optional[str] = "Urban Cadastre Registry"

class ParcelUpdate(BaseModel):
    parcel_number: Optional[str] = None
    geometry: Optional[GeoJSONGeometry] = None
    status: Optional[str] = "User Corrected"
    land_use: Optional[str] = None
    owner_info: Optional[str] = None
    area: Optional[float] = None
    perimeter: Optional[float] = None

class ParcelResponse(ParcelBase):
    id: str
    project_id: str
    geometry: Dict[str, Any]
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class BuildingBase(BaseModel):
    building_number: str
    building_type: str = "Residential"
    area: float
    confidence: float
    roof_type: str = "Gabled/Flat"

class BuildingResponse(BuildingBase):
    id: str
    project_id: str
    geometry: Dict[str, Any]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class RoadBase(BaseModel):
    road_name: str
    road_type: str = "Paved / Asphalt"
    width_m: float = 6.0
    length_m: float
    confidence: float

class RoadResponse(RoadBase):
    id: str
    project_id: str
    geometry: Dict[str, Any]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
