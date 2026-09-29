import json
import threading
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, status
from sqlalchemy.orm import Session

from app.database import get_db, SessionLocal
from app.models.project import Project
from app.models.image import Image
from app.models.parcel import Parcel
from app.models.building import Building
from app.models.road import Road
from app.models.processing_job import ProcessingJob
from app.schemas.image import ProcessingJobResponse
from app.ai_pipeline.segmentation import CadastralSegmentationPipeline

router = APIRouter(prefix="/api", tags=["Processing"])

def run_pipeline_worker(project_id: str, job_id: str):
    """
    Background worker thread executing real AI/computer-vision cadastral analysis.
    Updates DB with granular step progress and persists GeoJSON features.
    """
    db = SessionLocal()
    try:
        job = db.query(ProcessingJob).filter(ProcessingJob.id == job_id).first()
        project = db.query(Project).filter(Project.id == project_id).first()
        image = db.query(Image).filter(Image.project_id == project_id).order_by(Image.upload_date.desc()).first()

        if not job or not project or not image:
            return

        job.status = "running"
        job.progress_pct = 5
        job.current_step = "Initializing analysis pipeline"
        logs = [{"time": datetime.now(timezone.utc).isoformat(), "step": "Init", "message": "Starting cadastral feature extraction workflow"}]
        job.logs_json = json.dumps(logs)
        db.commit()

        # Bounds for vectorization
        bounds = {
            "south": image.bounds_south or (project.center_lat - 0.0016),
            "west": image.bounds_west or (project.center_lng - 0.0022),
            "north": image.bounds_north or (project.center_lat + 0.0016),
            "east": image.bounds_east or (project.center_lng + 0.0022)
        }

        pipeline = CadastralSegmentationPipeline()

        def progress_callback(pct: int, step_name: str, message: str):
            # Fetch fresh job reference inside thread
            curr_job = db.query(ProcessingJob).filter(ProcessingJob.id == job_id).first()
            if curr_job:
                curr_job.progress_pct = pct
                curr_job.current_step = step_name
                try:
                    curr_logs = json.loads(curr_job.logs_json or "[]")
                except Exception:
                    curr_logs = []
                curr_logs.append({
                    "time": datetime.now(timezone.utc).strftime("%H:%M:%S"),
                    "pct": pct,
                    "step": step_name,
                    "message": message
                })
                curr_job.logs_json = json.dumps(curr_logs)
                db.commit()

        # Execute analysis workflow
        results = pipeline.execute_workflow(
            image_path=image.filepath,
            bounds=bounds,
            progress_callback=progress_callback
        )

        # Clear existing features for this project to avoid duplication
        db.query(Parcel).filter(Parcel.project_id == project_id).delete()
        db.query(Building).filter(Building.project_id == project_id).delete()
        db.query(Road).filter(Road.project_id == project_id).delete()

        # Persist Parcels
        for p_feat in results["geojson"]["parcels"]["features"]:
            props = p_feat["properties"]
            parcel_obj = Parcel(
                project_id=project_id,
                parcel_number=props.get("parcel_number", props.get("id")),
                area=float(props.get("area_sqm", 0.0)),
                perimeter=float(props.get("perimeter_m", 0.0)),
                confidence=float(props.get("confidence", 0.85)),
                status=props.get("status", "AI Detected"),
                land_use=props.get("land_use", "Residential Plot"),
                owner_info="Cadastral Municipal Record",
                geometry=json.dumps(p_feat["geometry"])
            )
            db.add(parcel_obj)

        # Persist Buildings
        for b_feat in results["geojson"]["buildings"]["features"]:
            props = b_feat["properties"]
            bld_obj = Building(
                project_id=project_id,
                building_number=props.get("building_number", props.get("id")),
                building_type=props.get("building_type", "Residential"),
                area=float(props.get("area_sqm", 0.0)),
                confidence=float(props.get("confidence", 0.90)),
                roof_type=props.get("roof_type", "Gabled/Flat"),
                geometry=json.dumps(b_feat["geometry"])
            )
            db.add(bld_obj)

        # Persist Roads
        for r_feat in results["geojson"]["roads"]["features"]:
            props = r_feat["properties"]
            road_obj = Road(
                project_id=project_id,
                road_name=props.get("road_name", "Cadastral Road"),
                road_type=props.get("road_type", "Paved / Asphalt"),
                width_m=float(props.get("width_estimated_px", 6.0) * 0.08),
                length_m=float(props.get("length_px", 50.0) * 0.08),
                confidence=float(props.get("confidence", 0.88)),
                geometry=json.dumps(r_feat["geometry"])
            )
            db.add(road_obj)

        # Mark image and job completed
        image.processing_status = "completed"
        job.status = "completed"
        job.progress_pct = 100
        job.current_step = "Analysis completed"
        job.completed_at = datetime.now(timezone.utc)
        db.commit()

    except Exception as e:
        db.rollback()
        curr_job = db.query(ProcessingJob).filter(ProcessingJob.id == job_id).first()
        if curr_job:
            curr_job.status = "failed"
            curr_job.error_message = str(e)
            curr_job.completed_at = datetime.now(timezone.utc)
            db.commit()
    finally:
        db.close()

@router.post("/projects/{project_id}/process", response_model=ProcessingJobResponse, status_code=status.HTTP_202_ACCEPTED)
def start_processing(project_id: str, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    image = db.query(Image).filter(Image.project_id == project_id).first()
    if not image:
        raise HTTPException(status_code=400, detail="Cannot process project without an uploaded drone image.")

    # Create new ProcessingJob
    job = ProcessingJob(
        project_id=project_id,
        status="queued",
        progress_pct=0,
        current_step="Queued for analysis",
        logs_json=json.dumps([{"time": datetime.now(timezone.utc).strftime("%H:%M:%S"), "pct": 0, "step": "Queued", "message": "Job registered in processing queue"}])
    )
    db.add(job)
    image.processing_status = "processing"
    db.commit()
    db.refresh(job)

    # Launch background thread
    threading.Thread(target=run_pipeline_worker, args=(project_id, job.id), daemon=True).start()

    return ProcessingJobResponse(
        id=job.id,
        project_id=job.project_id,
        status=job.status,
        progress_pct=job.progress_pct,
        current_step=job.current_step,
        started_at=job.started_at,
        completed_at=job.completed_at,
        error_message=job.error_message,
        logs=json.loads(job.logs_json)
    )

@router.get("/projects/{project_id}/status", response_model=ProcessingJobResponse)
def get_processing_status(project_id: str, db: Session = Depends(get_db)):
    job = db.query(ProcessingJob).filter(ProcessingJob.project_id == project_id).order_by(ProcessingJob.started_at.desc()).first()
    if not job:
        raise HTTPException(status_code=404, detail="No processing job found for this project")

    logs = []
    if job.logs_json:
        try:
            logs = json.loads(job.logs_json)
        except Exception:
            logs = []

    return ProcessingJobResponse(
        id=job.id,
        project_id=job.project_id,
        status=job.status,
        progress_pct=job.progress_pct,
        current_step=job.current_step,
        started_at=job.started_at,
        completed_at=job.completed_at,
        error_message=job.error_message,
        logs=logs
    )
