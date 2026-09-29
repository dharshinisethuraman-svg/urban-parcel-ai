import json
from typing import List, Dict, Any
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.project import Project
from app.models.image import Image
from app.models.parcel import Parcel
from app.models.building import Building
from app.models.road import Road
from app.schemas.feature import ParcelResponse, ParcelUpdate, BuildingResponse, RoadResponse
from app.schemas.geojson import GeoJSONFeatureCollection
from app.ai_pipeline.postprocessing import LEGAL_DISCLAIMER

router = APIRouter(prefix="/api/projects/{project_id}", tags=["Cadastral Features"])

@router.get("/parcels", response_model=GeoJSONFeatureCollection)
def get_project_parcels(project_id: str, db: Session = Depends(get_db)):
    parcels = db.query(Parcel).filter(Parcel.project_id == project_id).all()
    features = []
    for p in parcels:
        geom = json.loads(p.geometry)
        features.append({
            "type": "Feature",
            "id": p.id,
            "geometry": geom,
            "properties": {
                "id": p.id,
                "parcel_number": p.parcel_number,
                "area": p.area,
                "perimeter": p.perimeter,
                "confidence": p.confidence,
                "status": p.status,
                "land_use": p.land_use,
                "owner_info": p.owner_info,
                "created_at": p.created_at.isoformat(),
                "updated_at": p.updated_at.isoformat()
            }
        })
    return {
        "type": "FeatureCollection",
        "features": features,
        "metadata": {
            "total_parcels": len(features),
            "disclaimer": LEGAL_DISCLAIMER
        }
    }

@router.get("/buildings", response_model=GeoJSONFeatureCollection)
def get_project_buildings(project_id: str, db: Session = Depends(get_db)):
    buildings = db.query(Building).filter(Building.project_id == project_id).all()
    features = []
    for b in buildings:
        geom = json.loads(b.geometry)
        features.append({
            "type": "Feature",
            "id": b.id,
            "geometry": geom,
            "properties": {
                "id": b.id,
                "building_number": b.building_number,
                "building_type": b.building_type,
                "area": b.area,
                "confidence": b.confidence,
                "roof_type": b.roof_type,
                "created_at": b.created_at.isoformat()
            }
        })
    return {
        "type": "FeatureCollection",
        "features": features,
        "metadata": {
            "total_buildings": len(features)
        }
    }

@router.get("/roads", response_model=GeoJSONFeatureCollection)
def get_project_roads(project_id: str, db: Session = Depends(get_db)):
    roads = db.query(Road).filter(Road.project_id == project_id).all()
    features = []
    for r in roads:
        geom = json.loads(r.geometry)
        features.append({
            "type": "Feature",
            "id": r.id,
            "geometry": geom,
            "properties": {
                "id": r.id,
                "road_name": r.road_name,
                "road_type": r.road_type,
                "width_m": r.width_m,
                "length_m": r.length_m,
                "confidence": r.confidence,
                "created_at": r.created_at.isoformat()
            }
        })
    return {
        "type": "FeatureCollection",
        "features": features,
        "metadata": {
            "total_roads": len(features)
        }
    }

@router.put("/parcels/{parcel_id}", response_model=ParcelResponse)
def update_parcel(project_id: str, parcel_id: str, data: ParcelUpdate, db: Session = Depends(get_db)):
    parcel = db.query(Parcel).filter(Parcel.id == parcel_id, Parcel.project_id == project_id).first()
    if not parcel:
        raise HTTPException(status_code=404, detail="Parcel not found")

    if data.parcel_number is not None:
        parcel.parcel_number = data.parcel_number
    if data.geometry is not None:
        parcel.geometry = json.dumps(data.geometry.model_dump())
        parcel.status = data.status or "User Corrected"
    if data.status is not None:
        parcel.status = data.status
    if data.land_use is not None:
        parcel.land_use = data.land_use
    if data.owner_info is not None:
        parcel.owner_info = data.owner_info
    if data.area is not None:
        parcel.area = data.area
    if data.perimeter is not None:
        parcel.perimeter = data.perimeter

    parcel.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(parcel)

    return ParcelResponse(
        id=parcel.id,
        project_id=parcel.project_id,
        parcel_number=parcel.parcel_number,
        area=parcel.area,
        perimeter=parcel.perimeter,
        confidence=parcel.confidence,
        status=parcel.status,
        land_use=parcel.land_use,
        owner_info=parcel.owner_info,
        geometry=json.loads(parcel.geometry),
        created_at=parcel.created_at,
        updated_at=parcel.updated_at
    )

@router.get("/layers")
def get_all_project_layers(project_id: str, db: Session = Depends(get_db)):
    """
    Combined layer manifest for Leaflet map:
    Returns Drone Image metadata (with overlay bounds), Parcel polygons,
    Building polygons, and Road networks.
    """
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    image = db.query(Image).filter(Image.project_id == project_id).order_by(Image.upload_date.desc()).first()

    parcels_fc = get_project_parcels(project_id, db)
    buildings_fc = get_project_buildings(project_id, db)
    roads_fc = get_project_roads(project_id, db)

    image_overlay = None
    if image:
        image_overlay = {
            "id": image.id,
            "filename": image.filename,
            "url": f"/api/images/{image.id}/file",
            "bounds": [
                [image.bounds_south, image.bounds_west],
                [image.bounds_north, image.bounds_east]
            ],
            "width": image.width,
            "height": image.height,
            "status": image.processing_status
        }

    return {
        "project": {
            "id": project.id,
            "name": project.name,
            "location": project.location,
            "center": [project.center_lat, project.center_lng],
            "zoom": project.zoom_level
        },
        "image_overlay": image_overlay,
        "parcels": parcels_fc,
        "buildings": buildings_fc,
        "roads": roads_fc,
        "disclaimer": LEGAL_DISCLAIMER
    }
