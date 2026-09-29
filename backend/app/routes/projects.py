import os
import shutil
from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db, BASE_DIR
from app.models.project import Project
from app.models.image import Image
from app.models.parcel import Parcel
from app.models.building import Building
from app.models.road import Road
from app.models.processing_job import ProcessingJob
from app.schemas.project import ProjectCreate, ProjectUpdate, ProjectResponse, DashboardStats

router = APIRouter(prefix="/api", tags=["Projects"])

@router.get("/projects", response_model=List[ProjectResponse])
def get_projects(db: Session = Depends(get_db)):
    projects = db.query(Project).order_by(Project.created_at.desc()).all()
    results = []
    for p in projects:
        img_count = db.query(Image).filter(Image.project_id == p.id).count()
        parcel_count = db.query(Parcel).filter(Parcel.project_id == p.id).count()
        bld_count = db.query(Building).filter(Building.project_id == p.id).count()
        road_count = db.query(Road).filter(Road.project_id == p.id).count()
        
        # Determine status
        status_val = "ready"
        latest_job = db.query(ProcessingJob).filter(ProcessingJob.project_id == p.id).order_by(ProcessingJob.started_at.desc()).first()
        if latest_job:
            status_val = latest_job.status
        elif img_count > 0:
            status_val = "uploaded"
        
        resp = ProjectResponse(
            id=p.id,
            name=p.name,
            description=p.description,
            location=p.location,
            center_lat=p.center_lat,
            center_lng=p.center_lng,
            zoom_level=p.zoom_level,
            created_at=p.created_at,
            images_count=img_count,
            parcels_count=parcel_count,
            buildings_count=bld_count,
            roads_count=road_count,
            status=status_val
        )
        results.append(resp)
    return results

@router.post("/projects", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
def create_project(data: ProjectCreate, db: Session = Depends(get_db)):
    project = Project(
        name=data.name,
        description=data.description,
        location=data.location or "Urban Survey Area",
        center_lat=data.center_lat or 12.9716,
        center_lng=data.center_lng or 77.5946,
        zoom_level=data.zoom_level or 18
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    return ProjectResponse(
        id=project.id,
        name=project.name,
        description=project.description,
        location=project.location,
        center_lat=project.center_lat,
        center_lng=project.center_lng,
        zoom_level=project.zoom_level,
        created_at=project.created_at,
        images_count=0,
        parcels_count=0,
        buildings_count=0,
        roads_count=0,
        status="ready"
    )

@router.get("/projects/{project_id}", response_model=ProjectResponse)
def get_project(project_id: str, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    img_count = db.query(Image).filter(Image.project_id == project.id).count()
    parcel_count = db.query(Parcel).filter(Parcel.project_id == project.id).count()
    bld_count = db.query(Building).filter(Building.project_id == project.id).count()
    road_count = db.query(Road).filter(Road.project_id == project.id).count()
    
    latest_job = db.query(ProcessingJob).filter(ProcessingJob.project_id == project.id).order_by(ProcessingJob.started_at.desc()).first()
    status_val = latest_job.status if latest_job else ("uploaded" if img_count > 0 else "ready")

    return ProjectResponse(
        id=project.id,
        name=project.name,
        description=project.description,
        location=project.location,
        center_lat=project.center_lat,
        center_lng=project.center_lng,
        zoom_level=project.zoom_level,
        created_at=project.created_at,
        images_count=img_count,
        parcels_count=parcel_count,
        buildings_count=bld_count,
        roads_count=road_count,
        status=status_val
    )

@router.put("/projects/{project_id}", response_model=ProjectResponse)
def update_project(project_id: str, data: ProjectUpdate, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    if data.name is not None:
        project.name = data.name
    if data.description is not None:
        project.description = data.description
    if data.location is not None:
        project.location = data.location
    if data.center_lat is not None:
        project.center_lat = data.center_lat
    if data.center_lng is not None:
        project.center_lng = data.center_lng
    if data.zoom_level is not None:
        project.zoom_level = data.zoom_level

    db.commit()
    db.refresh(project)
    return get_project(project_id, db)

@router.delete("/projects/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(project_id: str, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    db.delete(project)
    db.commit()
    return None

@router.get("/dashboard/stats", response_model=DashboardStats)
def get_dashboard_stats(db: Session = Depends(get_db)):
    total_projects = db.query(Project).count()
    total_images = db.query(Image).count()
    processed_images = db.query(Image).filter(Image.processing_status == "completed").count()
    total_parcels = db.query(Parcel).count()
    total_buildings = db.query(Building).count()
    total_roads = db.query(Road).count()
    
    total_area_res = db.query(func.sum(Parcel.area)).scalar() or 0.0

    recent_projects_orm = db.query(Project).order_by(Project.created_at.desc()).limit(5).all()
    recent_projects = []
    for p in recent_projects_orm:
        img_count = db.query(Image).filter(Image.project_id == p.id).count()
        parcel_count = db.query(Parcel).filter(Parcel.project_id == p.id).count()
        bld_count = db.query(Building).filter(Building.project_id == p.id).count()
        road_count = db.query(Road).filter(Road.project_id == p.id).count()
        latest_job = db.query(ProcessingJob).filter(ProcessingJob.project_id == p.id).order_by(ProcessingJob.started_at.desc()).first()
        status_val = latest_job.status if latest_job else ("uploaded" if img_count > 0 else "ready")

        recent_projects.append(ProjectResponse(
            id=p.id,
            name=p.name,
            description=p.description,
            location=p.location,
            center_lat=p.center_lat,
            center_lng=p.center_lng,
            zoom_level=p.zoom_level,
            created_at=p.created_at,
            images_count=img_count,
            parcels_count=parcel_count,
            buildings_count=bld_count,
            roads_count=road_count,
            status=status_val
        ))

    return DashboardStats(
        total_projects=total_projects,
        total_images=total_images,
        processed_images=processed_images,
        total_parcels=total_parcels,
        total_buildings=total_buildings,
        total_roads=total_roads,
        total_area_surveyed_sqm=round(float(total_area_res), 2),
        recent_projects=recent_projects
    )

@router.post("/projects/init-demo", response_model=ProjectResponse)
def init_demo_project(db: Session = Depends(get_db)):
    """Creates a preloaded demonstration survey project with the synthetic drone orthomosaic."""
    existing_demo = db.query(Project).filter(Project.name == "Demo Drone Survey - Sector 4 Urban Cadastre").first()
    if existing_demo:
        return get_project(existing_demo.id, db)

    proj = Project(
        name="Demo Drone Survey - Sector 4 Urban Cadastre",
        description="Demonstration urban flight survey over high-density residential and commercial land parcels with road network.",
        location="Sector 4 Municipal Survey Area",
        center_lat=12.9716,
        center_lng=77.5946,
        zoom_level=18
    )
    db.add(proj)
    db.commit()
    db.refresh(proj)

    # Copy demo sample image
    sample_src = os.path.join(BASE_DIR, "uploads", "sample_drone_orthomosaic.jpg")
    dest_filename = f"{proj.id}_drone_survey.jpg"
    dest_path = os.path.join(BASE_DIR, "uploads", dest_filename)
    if os.path.exists(sample_src):
        shutil.copyfile(sample_src, dest_path)
    
    # Calculate bounds centered around center_lat/lng
    delta_lat = 0.0016
    delta_lng = 0.0022
    
    image_rec = Image(
        project_id=proj.id,
        filename="sample_drone_orthomosaic.jpg",
        filepath=dest_path,
        file_size=os.path.getsize(dest_path) if os.path.exists(dest_path) else 1500000,
        width=1400,
        height=1050,
        bounds_south=proj.center_lat - delta_lat,
        bounds_north=proj.center_lat + delta_lat,
        bounds_west=proj.center_lng - delta_lng,
        bounds_east=proj.center_lng + delta_lng,
        processing_status="uploaded"
    )
    db.add(image_rec)
    db.commit()

    return get_project(proj.id, db)
