import cv2
import numpy as np
from typing import List, Dict, Any
from app.ai_pipeline.base import DetectionFeature

class ParcelDetector:
    """
    Cadastral Land Parcel Boundary Extraction Module.
    Extracts individual property boundaries, compound walls, hedge lines,
    and land subdivisions from drone orthomosaics.
    """

    def __init__(self, min_parcel_area_px: int = 1500, max_parcel_area_ratio: float = 0.40):
        self.min_parcel_area_px = min_parcel_area_px
        self.max_parcel_area_ratio = max_parcel_area_ratio

    def detect(self, prep_data: Dict[str, Any], road_features: List[DetectionFeature] = None) -> List[DetectionFeature]:
        gray = prep_data["gray"]
        bgr = prep_data["enhanced_bgr"]
        hsv = prep_data["hsv"]
        h, w = prep_data["height"], prep_data["width"]
        total_pixels = h * w
        max_parcel_area_px = total_pixels * self.max_parcel_area_ratio

        # 1. Multi-scale Canny edge detection + Morphological gradient
        blurred = cv2.GaussianBlur(gray, (5, 5), 0)
        edges1 = cv2.Canny(blurred, 30, 90)
        edges2 = cv2.Canny(blurred, 50, 150)
        combined_edges = cv2.bitwise_or(edges1, edges2)

        # 2. Add saturation & color contrast gradients (fences/hedges often show strong color transitions)
        sat = hsv[:, :, 1]
        grad_sat = cv2.morphologyEx(sat, cv2.MORPH_GRADIENT, cv2.getStructuringElement(cv2.MORPH_RECT, (3, 3)))
        _, sat_edges = cv2.threshold(grad_sat, 40, 255, cv2.THRESH_BINARY)
        combined_boundaries = cv2.bitwise_or(combined_edges, sat_edges)

        # 3. Include road borders as natural parcel boundaries
        if road_features:
            road_mask = np.zeros((h, w), dtype=np.uint8)
            for rf in road_features:
                poly = np.array(rf.pixel_polygon, dtype=np.int32)
                cv2.fillPoly(road_mask, [poly], 255)
            road_border = cv2.morphologyEx(road_mask, cv2.MORPH_GRADIENT, cv2.getStructuringElement(cv2.MORPH_RECT, (5, 5)))
            combined_boundaries = cv2.bitwise_or(combined_boundaries, road_border)

        # 4. Morphological line dilation and closing to seal parcel perimeters
        kernel_close = cv2.getStructuringElement(cv2.MORPH_RECT, (7, 7))
        closed_boundaries = cv2.morphologyEx(combined_boundaries, cv2.MORPH_CLOSE, kernel_close, iterations=2)
        dilated_boundaries = cv2.dilate(closed_boundaries, cv2.getStructuringElement(cv2.MORPH_RECT, (3, 3)))

        # 5. Distance Transform and Watershed segmentation to find enclosed parcel cells
        # Invert to get parcel interiors
        parcel_interiors = cv2.bitwise_not(dilated_boundaries)

        # Clean noise inside parcels
        cleaned_interiors = cv2.morphologyEx(parcel_interiors, cv2.MORPH_OPEN, cv2.getStructuringElement(cv2.MORPH_RECT, (5, 5)))

        # Distance transform
        dist_transform = cv2.distanceTransform(cleaned_interiors, cv2.DIST_L2, 5)
        _, sure_fg = cv2.threshold(dist_transform, 0.25 * dist_transform.max(), 255, 0)
        sure_fg = np.uint8(sure_fg)

        # Connected components for markers
        num_markers, markers = cv2.connectedComponents(sure_fg)

        # Watershed segmentation
        markers = markers + 1
        markers[dilated_boundaries == 255] = 0
        watershed_input = cv2.cvtColor(gray, cv2.COLOR_GRAY2BGR)
        cv2.watershed(watershed_input, markers)

        # 6. Extract individual parcel contours from watershed segments
        features: List[DetectionFeature] = []
        parcel_idx = 1

        for marker_id in range(2, num_markers + 1):
            mask = np.uint8(markers == marker_id)
            if cv2.countNonZero(mask) < self.min_parcel_area_px:
                continue

            contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            if not contours:
                continue

            cnt = max(contours, key=cv2.contourArea)
            area = cv2.contourArea(cnt)

            if area < self.min_parcel_area_px or area > max_parcel_area_px:
                continue

            # Check boundary proximity to avoid edge artifacts
            x, y, bw, bh = cv2.boundingRect(cnt)
            if bw * bh > total_pixels * 0.7:
                continue

            # Approximate to surveyor parcel polygon
            # Slightly loose epsilon to produce clean cadastral lots
            epsilon = 0.02 * cv2.arcLength(cnt, True)
            approx = cv2.approxPolyDP(cnt, epsilon, True)

            # Cadastral lots typically have between 4 and 10 corner vertices
            if len(approx) < 3:
                rect = cv2.minAreaRect(cnt)
                box = cv2.boxPoints(rect)
                polygon = [[float(pt[0]), float(pt[1])] for pt in box]
                polygon.append(polygon[0])
            else:
                polygon = [[float(pt[0][0]), float(pt[0][1])] for pt in approx]
                if polygon[0] != polygon[-1]:
                    polygon.append(polygon[0])

            perimeter = cv2.arcLength(cnt, True)

            # Compactness score (isoperimetric quotient: 4 * pi * A / P^2)
            compactness = (4 * np.pi * area) / (perimeter ** 2 + 1e-5)
            confidence = round(min(0.95, max(0.70, 0.60 + min(1.0, compactness * 1.2) * 0.35)), 2)

            features.append(
                DetectionFeature(
                    feature_type="parcel",
                    feature_id=f"PAR-{parcel_idx:03d}",
                    pixel_polygon=polygon,
                    area_pixels=float(area),
                    confidence=confidence,
                    properties={
                        "parcel_number": f"PAR-{parcel_idx:03d}",
                        "status": "AI Detected",
                        "perimeter_px": round(float(perimeter), 1),
                        "compactness": round(float(compactness), 2),
                        "land_use": "Residential Plot"
                    }
                )
            )
            parcel_idx += 1

        # Fallback if watershed produced very few parcels: grid/contour decomposition
        if len(features) < 2:
            features = self._fallback_contour_extraction(dilated_boundaries, h, w, max_parcel_area_px)

        return features

    def _fallback_contour_extraction(self, dilated_boundaries: np.ndarray, h: int, w: int, max_area: float) -> List[DetectionFeature]:
        """Hierarchical contour fallback when watershed marker contrast is subtle."""
        inverted = cv2.bitwise_not(dilated_boundaries)
        contours, _ = cv2.findContours(inverted, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        features = []
        idx = 1
        for cnt in contours:
            area = cv2.contourArea(cnt)
            if area < self.min_parcel_area_px or area > max_area:
                continue
            epsilon = 0.02 * cv2.arcLength(cnt, True)
            approx = cv2.approxPolyDP(cnt, epsilon, True)
            if len(approx) < 3:
                continue
            polygon = [[float(pt[0][0]), float(pt[0][1])] for pt in approx]
            if polygon[0] != polygon[-1]:
                polygon.append(polygon[0])
            features.append(
                DetectionFeature(
                    feature_type="parcel",
                    feature_id=f"PAR-{idx:03d}",
                    pixel_polygon=polygon,
                    area_pixels=float(area),
                    confidence=0.82,
                    properties={
                        "parcel_number": f"PAR-{idx:03d}",
                        "status": "AI Detected",
                        "land_use": "Cadastral Lot"
                    }
                )
            )
            idx += 1
        return features
