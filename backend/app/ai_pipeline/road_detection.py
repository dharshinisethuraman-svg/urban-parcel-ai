import cv2
import numpy as np
from typing import List, Dict, Any
from app.ai_pipeline.base import DetectionFeature

class RoadDetector:
    """
    Cadastral Road Corridor & Network Detection Module.
    Identifies paved vehicular access ways, street corridors, and thoroughfares
    using low-saturation asphalt/concrete spectral extraction, directional
    morphological bridging, and polygon/polyline vector generation.
    """

    def __init__(self, min_road_length_px: int = 150):
        self.min_road_length_px = min_road_length_px

    def detect(self, prep_data: Dict[str, Any]) -> List[DetectionFeature]:
        hsv = prep_data["hsv"]
        gray = prep_data["gray"]
        h, w = prep_data["height"], prep_data["width"]

        # 1. Asphalt / Pavement spectral filter
        # Roads have low color saturation (neutral grey/black/tan)
        # Value ranges from dark asphalt (30) to light concrete (160)
        mask_asphalt = cv2.inRange(hsv, np.array([0, 0, 30]), np.array([180, 42, 175]))

        # 2. Exclude high-contrast rooftop candidates and deep shadows
        mask_deep_shadow = cv2.inRange(gray, 0, 25)
        road_mask = cv2.bitwise_and(mask_asphalt, cv2.bitwise_not(mask_deep_shadow))

        # 3. Directional morphological line connections
        # Connect road segments horizontally and vertically
        kernel_h = cv2.getStructuringElement(cv2.MORPH_RECT, (25, 5))
        kernel_v = cv2.getStructuringElement(cv2.MORPH_RECT, (5, 25))
        
        morph_h = cv2.morphologyEx(road_mask, cv2.MORPH_CLOSE, kernel_h)
        morph_v = cv2.morphologyEx(road_mask, cv2.MORPH_CLOSE, kernel_v)
        combined_roads = cv2.bitwise_or(morph_h, morph_v)

        # Smooth and bridge intersections
        kernel_sq = cv2.getStructuringElement(cv2.MORPH_RECT, (7, 7))
        combined_roads = cv2.morphologyEx(combined_roads, cv2.MORPH_OPEN, kernel_sq)
        combined_roads = cv2.morphologyEx(combined_roads, cv2.MORPH_CLOSE, kernel_sq, iterations=2)

        # 4. Find contours of road corridors
        contours, _ = cv2.findContours(combined_roads, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

        features: List[DetectionFeature] = []
        road_idx = 1

        for cnt in contours:
            area = cv2.contourArea(cnt)
            # Minimum area for a road corridor
            if area < (self.min_road_length_px * 20):
                continue

            x, y, bw, bh = cv2.boundingRect(cnt)
            aspect_ratio = max(bw, bh) / (min(bw, bh) + 1e-5)
            extent = area / (bw * bh + 1e-5)

            # Roads typically span significant portions or have elongated bounding box
            if aspect_ratio < 2.0 and extent > 0.6:
                # May be a large parking lot or open field, not linear road corridor
                continue

            # Approximate polygon boundary
            epsilon = 0.015 * cv2.arcLength(cnt, True)
            approx = cv2.approxPolyDP(cnt, epsilon, True)

            if len(approx) < 4:
                continue

            polygon = [[float(pt[0][0]), float(pt[0][1])] for pt in approx]
            if polygon[0] != polygon[-1]:
                polygon.append(polygon[0])

            # Classify road hierarchy based on dimension
            major_dim = max(bw, bh)
            road_type = "Arterial Corridor" if major_dim > (max(h, w) * 0.6) else "Access Way / Secondary"

            features.append(
                DetectionFeature(
                    feature_type="road",
                    feature_id=f"RD-{road_idx:02d}",
                    pixel_polygon=polygon,
                    area_pixels=float(area),
                    confidence=0.87,
                    properties={
                        "road_name": f"Cadastral Road RD-{road_idx:02d}",
                        "road_type": road_type,
                        "width_estimated_px": round(area / (major_dim + 1e-5), 1),
                        "length_px": round(float(major_dim), 1)
                    }
                )
            )
            road_idx += 1

        return features
