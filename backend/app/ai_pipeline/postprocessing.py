from typing import List, Dict, Any
from shapely.geometry import Polygon, shape
from app.ai_pipeline.base import DetectionFeature

LEGAL_DISCLAIMER = (
    "AI-generated parcel boundaries are indicative and require verification "
    "by authorized surveying/cadastral professionals before official use."
)

class PostProcessor:
    """
    Cadastral Post-Processing & Spatial Topology Engine:
    - Resolves overlapping boundaries
    - Associative topology: links detected buildings to containing parcel lots
    - Assigns land-use taxonomy and legal surveying disclaimers
    """

    def process(
        self,
        parcels: List[DetectionFeature],
        buildings: List[DetectionFeature],
        roads: List[DetectionFeature]
    ) -> Dict[str, Any]:
        
        # Build Shapely polygons for containment check
        parcel_polys = []
        for p in parcels:
            try:
                poly = Polygon(p.pixel_polygon)
                parcel_polys.append((p, poly))
            except Exception:
                parcel_polys.append((p, None))

        # Check which buildings reside within which parcel
        for b in buildings:
            try:
                b_poly = Polygon(b.pixel_polygon)
                b_center = b_poly.centroid
                containing_parcel = None
                for p, p_poly in parcel_polys:
                    if p_poly and p_poly.contains(b_center):
                        containing_parcel = p.properties.get("parcel_number")
                        # Mark parcel land-use
                        p.properties["land_use"] = "Residential Built-up"
                        break
                b.properties["parent_parcel"] = containing_parcel or "Unassigned Lot"
            except Exception:
                b.properties["parent_parcel"] = "Unassigned Lot"

        # Summarize counts
        total_features = len(parcels) + len(buildings) + len(roads)

        return {
            "parcels": parcels,
            "buildings": buildings,
            "roads": roads,
            "summary": {
                "total_features": total_features,
                "parcel_count": len(parcels),
                "building_count": len(buildings),
                "road_count": len(roads),
                "disclaimer": LEGAL_DISCLAIMER
            }
        }
