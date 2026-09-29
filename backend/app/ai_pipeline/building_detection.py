import cv2
import numpy as np
from typing import List, Dict, Any
from app.ai_pipeline.base import DetectionFeature

class BuildingDetector:
    """
    Cadastral Building Detection Module.
    Combines spectral roof segmentation, morphological rectangularization,
    and polygonal contour analysis to identify building footprints from drone imagery.
    """

    def __init__(self, min_area_px: int = 400, max_area_ratio: float = 0.35):
        self.min_area_px = min_area_px
        self.max_area_ratio = max_area_ratio

    def detect(self, prep_data: Dict[str, Any]) -> List[DetectionFeature]:
        hsv = prep_data["hsv"]
        gray = prep_data["gray"]
        bgr = prep_data["enhanced_bgr"]
        h, w = prep_data["height"], prep_data["width"]
        total_pixels = h * w
        max_area_px = total_pixels * self.max_area_ratio

        # 1. Color masks for common rooftop materials
        # Terracotta / Red / Orange tiles
        mask_red1 = cv2.inRange(hsv, np.array([0, 40, 60]), np.array([15, 255, 255]))
        mask_red2 = cv2.inRange(hsv, np.array([165, 40, 60]), np.array([180, 255, 255]))
        mask_terracotta = cv2.bitwise_or(mask_red1, mask_red2)

        # Concrete / Grey slabs / White reflective roofs
        # Low saturation, moderate to high value
        mask_concrete = cv2.inRange(hsv, np.array([0, 0, 110]), np.array([180, 45, 245]))

        # Blue / Green tin roofs
        mask_tin = cv2.inRange(hsv, np.array([85, 40, 60]), np.array([135, 255, 255]))

        # Combine spectral building roof candidates
        combined_roof_mask = cv2.bitwise_or(mask_terracotta, mask_concrete)
        combined_roof_mask = cv2.bitwise_or(combined_roof_mask, mask_tin)

        # 2. Exclude high-vegetation green zones from roofs
        mask_green_veg = cv2.inRange(hsv, np.array([25, 40, 35]), np.array([85, 255, 240]))
        roof_candidate = cv2.bitwise_and(combined_roof_mask, cv2.bitwise_not(mask_green_veg))

        # 3. Morphological operations to coalesce roof facets and smooth boundaries
        kernel_sq = cv2.getStructuringElement(cv2.MORPH_RECT, (9, 9))
        opened = cv2.morphologyEx(roof_candidate, cv2.MORPH_OPEN, kernel_sq, iterations=1)
        closed = cv2.morphologyEx(opened, cv2.MORPH_CLOSE, kernel_sq, iterations=2)

        # 4. Find contours
        contours, _ = cv2.findContours(closed, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

        features: List[DetectionFeature] = []
        building_idx = 1

        for cnt in contours:
            area = cv2.contourArea(cnt)
            if area < self.min_area_px or area > max_area_px:
                continue

            # Check aspect ratio of bounding box
            x, y, bw, bh = cv2.boundingRect(cnt)
            aspect_ratio = float(bw) / float(bh) if bh > 0 else 0
            if aspect_ratio < 0.2 or aspect_ratio > 5.0:
                continue  # likely road or linear boundary fence, not building

            # Approximate to polygonal footprint
            epsilon = 0.025 * cv2.arcLength(cnt, True)
            approx = cv2.approxPolyDP(cnt, epsilon, True)

            # Minimum 4 vertices for building footprint
            if len(approx) < 4:
                # Use minimum area rectangle if polygon approximation degenerated
                rect = cv2.minAreaRect(cnt)
                box = cv2.boxPoints(rect)
                polygon = [[float(pt[0]), float(pt[1])] for pt in box]
                polygon.append(polygon[0])
            else:
                polygon = [[float(pt[0][0]), float(pt[0][1])] for pt in approx]
                # Ensure closed ring
                if polygon[0] != polygon[-1]:
                    polygon.append(polygon[0])

            # Classify roof type based on predominant color in roof patch
            roi_hsv = hsv[y:y+bh, x:x+bw]
            mean_hsv = cv2.mean(roi_hsv)[:3] if roi_hsv.size > 0 else (0, 0, 0)
            if (mean_hsv[0] < 20 or mean_hsv[0] > 160) and mean_hsv[1] > 40:
                roof_type = "Terracotta / Tile"
            elif mean_hsv[0] > 80 and mean_hsv[0] < 140:
                roof_type = "Metal / Tin Sheet"
            else:
                roof_type = "Concrete Slab / Flat"

            # Confidence score estimation based on solidity and edge sharpness
            hull = cv2.convexHull(cnt)
            hull_area = cv2.contourArea(hull)
            solidity = float(area) / hull_area if hull_area > 0 else 0.5
            confidence = round(min(0.96, max(0.72, 0.65 + solidity * 0.3)), 2)

            features.append(
                DetectionFeature(
                    feature_type="building",
                    feature_id=f"BLD-{building_idx:02d}",
                    pixel_polygon=polygon,
                    area_pixels=float(area),
                    confidence=confidence,
                    properties={
                        "building_number": f"BLD-{building_idx:02d}",
                        "building_type": "Residential" if area < 2500 else "Commercial / Multi-Unit",
                        "roof_type": roof_type,
                        "solidity": round(solidity, 2)
                    }
                )
            )
            building_idx += 1

        return features
