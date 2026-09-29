import math
from typing import List, Dict, Any, Tuple
from shapely.geometry import Polygon, LineString, mapping
from shapely.validation import make_valid
from app.ai_pipeline.base import DetectionFeature

class Vectorizer:
    """
    Translates pixel-space detections into standard GeoJSON geographic vectors
    referenced to real-world WGS84 (EPSG:4326) coordinates matching Leaflet overlays.
    """

    def __init__(self, bounds: Dict[str, float], img_width: int, img_height: int, gsd_m_per_px: float = 0.08):
        self.south = bounds["south"]
        self.west = bounds["west"]
        self.north = bounds["north"]
        self.east = bounds["east"]
        self.width = max(1, img_width)
        self.height = max(1, img_height)
        self.gsd = gsd_m_per_px

    def pixel_to_geo(self, px: float, py: float) -> Tuple[float, float]:
        """Convert pixel (x, y) to (longitude, latitude)."""
        clamped_x = max(0.0, min(float(self.width), float(px)))
        clamped_y = max(0.0, min(float(self.height), float(py)))

        lng = self.west + (clamped_x / float(self.width)) * (self.east - self.west)
        lat = self.north - (clamped_y / float(self.height)) * (self.north - self.south)
        return (round(lng, 7), round(lat, 7))

    def vectorize_feature(self, feature: DetectionFeature) -> Dict[str, Any]:
        """
        Convert a DetectionFeature with pixel_polygon into a valid GeoJSON Feature dict.
        """
        geo_coords = [self.pixel_to_geo(pt[0], pt[1]) for pt in feature.pixel_polygon]

        # Ensure polygon ring is closed
        if len(geo_coords) >= 3 and geo_coords[0] != geo_coords[-1]:
            geo_coords.append(geo_coords[0])

        # Compute metric area using GSD (Ground Sampling Distance)
        area_sqm = round(feature.area_pixels * (self.gsd ** 2), 2)
        perimeter_m = round(math.sqrt(feature.area_pixels) * 4 * self.gsd, 2)

        try:
            poly = Polygon(geo_coords)
            if not poly.is_valid:
                poly = make_valid(poly)
            geom_dict = mapping(poly)
        except Exception:
            geom_dict = {
                "type": "Polygon",
                "coordinates": [geo_coords]
            }

        properties = dict(feature.properties)
        properties.update({
            "id": feature.feature_id,
            "feature_type": feature.feature_type,
            "area_sqm": area_sqm,
            "perimeter_m": perimeter_m,
            "confidence": feature.confidence,
        })

        return {
            "type": "Feature",
            "id": feature.feature_id,
            "geometry": geom_dict,
            "properties": properties
        }

    def to_feature_collection(self, features: List[DetectionFeature], feature_type_filter: str = None) -> Dict[str, Any]:
        """Create standard GeoJSON FeatureCollection."""
        geojson_features = []
        for feat in features:
            if feature_type_filter and feat.feature_type != feature_type_filter:
                continue
            geojson_features.append(self.vectorize_feature(feat))

        return {
            "type": "FeatureCollection",
            "features": geojson_features,
            "metadata": {
                "total_features": len(geojson_features),
                "crs": "urn:ogc:def:crs:OGC:1.3:CRS84",
                "gsd_m": self.gsd
            }
        }
