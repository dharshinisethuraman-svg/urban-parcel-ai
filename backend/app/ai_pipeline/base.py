from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional
import numpy as np

@dataclass
class DetectionFeature:
    feature_type: str                  # "parcel", "building", "road", "vegetation"
    feature_id: str
    pixel_polygon: List[List[float]]   # [[x1, y1], [x2, y2], ...]
    area_pixels: float
    confidence: float
    properties: Dict[str, Any] = field(default_factory=dict)

@dataclass
class DetectionResult:
    features: List[DetectionFeature]
    model_name: str
    model_type: str                   # "CV_PROTOTYPE" or "DEEP_LEARNING"
    disclaimer: str
    processing_metadata: Dict[str, Any] = field(default_factory=dict)

class BaseFeatureDetector(ABC):
    """
    Abstract interface for cadastral feature detection.
    This modular architecture allows plug-and-play replacement of the current
    computer vision prototype with trained deep learning models
    (such as U-Net, Mask R-CNN, or YOLOv8-segmentation) without modifying
    the API or database layer.
    """
    
    @abstractmethod
    def detect(self, image: np.ndarray, **kwargs) -> DetectionResult:
        """Execute detection on a preprocessed RGB/BGR image array."""
        pass

    @property
    @abstractmethod
    def model_type(self) -> str:
        """Returns 'CV_PROTOTYPE' or 'DEEP_LEARNING' for transparency."""
        pass
