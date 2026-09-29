from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict

class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None
    location: Optional[str] = "Urban Survey Area"
    center_lat: Optional[float] = 12.9716
    center_lng: Optional[float] = 77.5946
    zoom_level: Optional[int] = 18

class ProjectCreate(ProjectBase):
    pass

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None
    center_lat: Optional[float] = None
    center_lng: Optional[float] = None
    zoom_level: Optional[int] = None

class ProjectResponse(ProjectBase):
    id: str
    created_at: datetime
    images_count: Optional[int] = 0
    parcels_count: Optional[int] = 0
    buildings_count: Optional[int] = 0
    roads_count: Optional[int] = 0
    status: Optional[str] = "ready"

    model_config = ConfigDict(from_attributes=True)

class DashboardStats(BaseModel):
    total_projects: int
    total_images: int
    processed_images: int
    total_parcels: int
    total_buildings: int
    total_roads: int
    total_area_surveyed_sqm: float
    recent_projects: List[ProjectResponse]
