from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict

class ImageResponse(BaseModel):
    id: str
    project_id: str
    filename: str
    file_size: int
    width: Optional[int] = None
    height: Optional[int] = None
    bounds_south: Optional[float] = None
    bounds_west: Optional[float] = None
    bounds_north: Optional[float] = None
    bounds_east: Optional[float] = None
    upload_date: datetime
    processing_status: str
    url: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class ProcessingJobResponse(BaseModel):
    id: str
    project_id: str
    status: str
    progress_pct: int
    current_step: str
    started_at: datetime
    completed_at: Optional[datetime] = None
    error_message: Optional[str] = None
    logs: Optional[list] = []

    model_config = ConfigDict(from_attributes=True)
