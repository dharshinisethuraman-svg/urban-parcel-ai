import cv2
import numpy as np
from PIL import Image
import os
from typing import Tuple, Dict, Any

class ImagePreprocessor:
    """
    Standard preprocessing for aerial drone imagery:
    - Format normalisation and multi-channel handling (TIFF, PNG, JPEG)
    - Contrast-Limited Adaptive Histogram Equalisation (CLAHE)
    - Edge-preserving bilateral filtering to suppress sensor noise while preserving parcel borders
    - Multi-space color extraction (RGB, HSV, LAB)
    """

    def __init__(self, target_max_dim: int = 1920):
        self.target_max_dim = target_max_dim

    def load_image(self, file_path: str) -> Tuple[np.ndarray, float]:
        """
        Load drone image from disk, maintaining color integrity.
        Returns the BGR image array and the resize scale factor applied.
        """
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"Image not found at {file_path}")

        # Check for TIFF / GeoTIFF or standard formats
        ext = os.path.splitext(file_path)[1].lower()
        if ext in [".tif", ".tiff"]:
            pil_img = Image.open(file_path)
            rgb = np.array(pil_img.convert("RGB"))
            bgr = cv2.cvtColor(rgb, cv2.COLOR_RGB2BGR)
        else:
            bgr = cv2.imread(file_path, cv2.IMREAD_COLOR)

        if bgr is None:
            raise ValueError(f"Failed to read image at {file_path}")

        h, w = bgr.shape[:2]
        scale = 1.0
        if max(h, w) > self.target_max_dim:
            scale = self.target_max_dim / float(max(h, w))
            new_w = int(w * scale)
            new_h = int(h * scale)
            bgr = cv2.resize(bgr, (new_w, new_h), interpolation=cv2.INTER_AREA)

        return bgr, scale

    def enhance(self, bgr: np.ndarray) -> Dict[str, Any]:
        """
        Process BGR image into filtered channels and enhanced representations.
        """
        # 1. Bilateral filter for noise reduction with edge preservation
        denoised = cv2.bilateralFilter(bgr, d=7, sigmaColor=50, sigmaSpace=50)

        # 2. LAB Color Space & CLAHE on Luminance
        lab = cv2.cvtColor(denoised, cv2.COLOR_BGR2LAB)
        l, a, b = cv2.split(lab)
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        cl = clahe.apply(l)
        enhanced_lab = cv2.merge((cl, a, b))
        enhanced_bgr = cv2.cvtColor(enhanced_lab, cv2.COLOR_LAB2BGR)

        # 3. Grayscale and HSV
        gray = cv2.cvtColor(enhanced_bgr, cv2.COLOR_BGR2GRAY)
        hsv = cv2.cvtColor(enhanced_bgr, cv2.COLOR_BGR2HSV)

        return {
            "original_bgr": bgr,
            "enhanced_bgr": enhanced_bgr,
            "gray": gray,
            "hsv": hsv,
            "lab": enhanced_lab,
            "height": bgr.shape[0],
            "width": bgr.shape[1]
        }
