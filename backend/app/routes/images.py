import os
import uuid
import shutil
from typing import List
from PIL import Image as PILImage
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status, Form
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.database import get_db, BASE_DIR
from app.models.project import Project
from app.models.image import Image
from app.schemas.image import ImageResponse

router = APIRouter(prefix="/api", tags=["Images"])

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".tif", ".tiff"}
MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024  # 50 MB

@router.post("/projects/{project_id}/upload", response_model=ImageResponse, status_code=status.HTTP_201_CREATED)
async def upload_project_image(
    project_id: str,
    file: UploadFile = File(...),
    location: str = Form(None),
    db: Session = Depends(get_db)
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file format '{ext}'. Supported formats: JPG, JPEG, PNG, TIFF."
        )

    uploads_dir = os.path.join(BASE_DIR, "uploads")
    os.makedirs(uploads_dir, exist_ok=True)

    unique_filename = f"{project_id}_{uuid.uuid4().hex[:8]}_{file.filename}"
    file_path = os.path.join(uploads_dir, unique_filename)

    # Save to disk
    file_size = 0
    with open(file_path, "wb") as buffer:
        while content := await file.read(1024 * 1024):  # 1MB chunks
            file_size += len(content)
            if file_size > MAX_FILE_SIZE_BYTES:
                os.remove(file_path)
                raise HTTPException(status_code=413, detail="File too large. Maximum size allowed is 50MB.")
            buffer.write(content)

    # Validate image and inspect dimensions
    try:
        with PILImage.open(file_path) as img:
            width, height = img.size
    except Exception as e:
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(status_code=400, detail=f"Invalid or corrupted image file: {str(e)}")

    if location and not project.location:
        project.location = location

    # Calculate geographic bounding box for Leaflet ImageOverlay
    # Approximate ~0.08m per pixel ground scale
    # 1 deg latitude ≈ 111,000 meters
    meters_h = height * 0.08
    meters_w = width * 0.08
    delta_lat = (meters_h / 111000.0) / 2.0
    delta_lng = (meters_w / (111000.0 * 0.97)) / 2.0  # approximate cosine adjustment

    image_record = Image(
        project_id=project.id,
        filename=file.filename,
        filepath=file_path,
        file_size=file_size,
        width=width,
        height=height,
        bounds_south=project.center_lat - delta_lat,
        bounds_north=project.center_lat + delta_lat,
        bounds_west=project.center_lng - delta_lng,
        bounds_east=project.center_lng + delta_lng,
        processing_status="uploaded"
    )

    db.add(image_record)
    db.commit()
    db.refresh(image_record)

    return ImageResponse(
        id=image_record.id,
        project_id=image_record.project_id,
        filename=image_record.filename,
        file_size=image_record.file_size,
        width=image_record.width,
        height=image_record.height,
        bounds_south=image_record.bounds_south,
        bounds_west=image_record.bounds_west,
        bounds_north=image_record.bounds_north,
        bounds_east=image_record.bounds_east,
        upload_date=image_record.upload_date,
        processing_status=image_record.processing_status,
        url=f"/api/images/{image_record.id}/file"
    )

@router.get("/projects/{project_id}/images", response_model=List[ImageResponse])
def get_project_images(project_id: str, db: Session = Depends(get_db)):
    images = db.query(Image).filter(Image.project_id == project_id).all()
    res = []
    for img in images:
        res.append(ImageResponse(
            id=img.id,
            project_id=img.project_id,
            filename=img.filename,
            file_size=img.file_size,
            width=img.width,
            height=img.height,
            bounds_south=img.bounds_south,
            bounds_west=img.bounds_west,
            bounds_north=img.bounds_north,
            bounds_east=img.bounds_east,
            upload_date=img.upload_date,
            processing_status=img.processing_status,
            url=f"/api/images/{img.id}/file"
        ))
    return res

@router.get("/images/{image_id}/file")
def get_image_file(image_id: str, db: Session = Depends(get_db)):
    image = db.query(Image).filter(Image.id == image_id).first()
    if not image or not os.path.exists(image.filepath):
        raise HTTPException(status_code=404, detail="Image file not found")

    ext = os.path.splitext(image.filepath)[1].lower()
    media_type = "image/jpeg"
    if ext == ".png":
        media_type = "image/png"
    elif ext in [".tif", ".tiff"]:
        media_type = "image/tiff"

    return FileResponse(image.filepath, media_type=media_type)
