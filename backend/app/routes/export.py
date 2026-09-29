import io
import csv
import json
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import Response, StreamingResponse
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.project import Project
from app.models.parcel import Parcel
from app.models.building import Building
from app.models.road import Road
from app.ai_pipeline.postprocessing import LEGAL_DISCLAIMER

router = APIRouter(prefix="/api/projects/{project_id}/export", tags=["Export"])

@router.get("/geojson")
def export_geojson(
    project_id: str,
    layer: Optional[str] = Query("combined", description="Layer to export: combined, parcels, buildings, roads"),
    db: Session = Depends(get_db)
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    features = []

    if layer in ["parcels", "combined", "all"]:
        parcels = db.query(Parcel).filter(Parcel.project_id == project_id).all()
        for p in parcels:
            features.append({
                "type": "Feature",
                "id": p.id,
                "geometry": json.loads(p.geometry),
                "properties": {
                    "layer": "parcel",
                    "parcel_number": p.parcel_number,
                    "area_sqm": p.area,
                    "perimeter_m": p.perimeter,
                    "confidence": p.confidence,
                    "status": p.status,
                    "land_use": p.land_use,
                    "owner_info": p.owner_info,
                    "project_name": project.name
                }
            })

    if layer in ["buildings", "combined", "all"]:
        buildings = db.query(Building).filter(Building.project_id == project_id).all()
        for b in buildings:
            features.append({
                "type": "Feature",
                "id": b.id,
                "geometry": json.loads(b.geometry),
                "properties": {
                    "layer": "building",
                    "building_number": b.building_number,
                    "building_type": b.building_type,
                    "area_sqm": b.area,
                    "confidence": b.confidence,
                    "roof_type": b.roof_type,
                    "project_name": project.name
                }
            })

    if layer in ["roads", "combined", "all"]:
        roads = db.query(Road).filter(Road.project_id == project_id).all()
        for r in roads:
            features.append({
                "type": "Feature",
                "id": r.id,
                "geometry": json.loads(r.geometry),
                "properties": {
                    "layer": "road",
                    "road_name": r.road_name,
                    "road_type": r.road_type,
                    "width_m": r.width_m,
                    "length_m": r.length_m,
                    "confidence": r.confidence,
                    "project_name": project.name
                }
            })

    export_obj = {
        "type": "FeatureCollection",
        "name": f"{project.name}_{layer}_cadastre",
        "crs": {
            "type": "name",
            "properties": {"name": "urn:ogc:def:crs:OGC:1.3:CRS84"}
        },
        "disclaimer": LEGAL_DISCLAIMER,
        "features": features
    }

    json_str = json.dumps(export_obj, indent=2)
    filename = f"{project.name.replace(' ', '_').lower()}_{layer}.geojson"

    return Response(
        content=json_str,
        media_type="application/geo+json",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )

@router.get("/csv")
def export_csv(
    project_id: str,
    layer: Optional[str] = Query("parcels", description="Layer to export: parcels, buildings"),
    db: Session = Depends(get_db)
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    output = io.StringIO()
    writer = csv.writer(output)

    if layer == "parcels":
        writer.writerow([
            "Parcel ID", "Parcel Number", "Area (sqm)", "Perimeter (m)",
            "Confidence", "Survey Status", "Land Use Classification", "Registry Information"
        ])
        parcels = db.query(Parcel).filter(Parcel.project_id == project_id).all()
        for p in parcels:
            writer.writerow([
                p.id, p.parcel_number, p.area, p.perimeter,
                p.confidence, p.status, p.land_use, p.owner_info
            ])
        filename = f"{project.name.replace(' ', '_').lower()}_parcels.csv"

    elif layer == "buildings":
        writer.writerow([
            "Building ID", "Building Number", "Footprint Area (sqm)", "Confidence", "Classification", "Roof Material"
        ])
        buildings = db.query(Building).filter(Building.project_id == project_id).all()
        for b in buildings:
            writer.writerow([
                b.id, b.building_number, b.area, b.confidence, b.building_type, b.roof_type
            ])
        filename = f"{project.name.replace(' ', '_').lower()}_buildings.csv"

    else:
        raise HTTPException(status_code=400, detail="CSV export supported for 'parcels' and 'buildings'")

    output.seek(0)
    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )
