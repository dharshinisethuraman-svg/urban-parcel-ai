# System Architecture & Technical Specifications

## 1. System Overview
The **AI-Based Automated Urban Parcel Mapping and Cadastral Feature Extraction System using Drone Imagery** is a full-stack photogrammetric GIS application designed to accelerate cadastral property boundary delineation, building footprint extraction, and road network vectorization.

```
                    ┌───────────────────────────────────────────┐
                    │      High-Resolution Drone Imagery        │
                    │        (Orthomosaic TIFF / JPEG)          │
                    └─────────────────────┬─────────────────────┘
                                          │
                                          ▼
                    ┌───────────────────────────────────────────┐
                    │       FastAPI REST Ingestion Layer        │
                    │  (File Validation, Spatial Bounding Box)  │
                    └─────────────────────┬─────────────────────┘
                                          │
                                          ▼
┌───────────────────────────────────────────────────────────────────────────────────┐
│                           AI / Computer Vision Pipeline                           │
│                                                                                   │
│  ┌───────────────────────┐    ┌────────────────────────┐    ┌──────────────────┐  │
│  │     Preprocessing     │───▶│  Road Network Detector │───▶│   Roof Spectral  │  │
│  │ (Bilateral + CLAHE)   │    │  (Linear Corridors)    │    │ (HSV + Geometry) │  │
│  └───────────────────────┘    └────────────────────────┘    └──────────────────┘  │
│             │                                                         │           │
│             ▼                                                         ▼           │
│  ┌─────────────────────────────────────────────────────────────────────────────┐  │
│  │             Parcel Delineation (Multi-Scale Gradient + Watershed)           │  │
│  └──────────────────────────────────────┬──────────────────────────────────────┘  │
│                                         │                                         │
│                                         ▼                                         │
│  ┌─────────────────────────────────────────────────────────────────────────────┐  │
│  │             Spatial Topology & Associative Containment Engine               │  │
│  └──────────────────────────────────────┬──────────────────────────────────────┘  │
│                                         │                                         │
│                                         ▼                                         │
│  ┌─────────────────────────────────────────────────────────────────────────────┐  │
│  │            Vectorization Engine (WGS84 EPSG:4326 Projection & GSD)          │  │
│  └─────────────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────┬─────────────────────────────────────────┘
                                          │
                                          ▼
┌───────────────────────────────────────────────────────────────────────────────────┐
│                          Database & Persistence Layer                             │
│                  SQLite / SQLAlchemy (WGS84 Coordinates Ready)                    │
│                [Projects, Images, Parcels, Buildings, Roads, Jobs]                │
└─────────────────────────────────────────┬─────────────────────────────────────────┘
                                          │
                                          ▼
┌───────────────────────────────────────────────────────────────────────────────────┐
│                             Interactive GIS Frontend                              │
│              React 19 + Leaflet (ImageOverlay, Vector Layers, Editing)            │
│         [Opacity Slider, Feature Inspection, Vertex Editor, GeoJSON Export]       │
└───────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Component Design

### 2.1 Backend (`FastAPI`)
- **Framework:** FastAPI with asynchronous ASGI execution
- **Database ORM:** SQLAlchemy 2.0 with SQLite foreign key pragmas
- **Data Validation:** Pydantic v2 schemas for request validation and serialization
- **Spatial Interchange:** RFC 7946 GeoJSON `FeatureCollection` formats

### 2.2 AI / Computer Vision Engine (`app/ai_pipeline`)
- **`BaseFeatureDetector`:** Abstract base class establishing contract for detection models.
- **`ImagePreprocessor`:** Bilateral edge-preserving noise filter + CLAHE (Contrast-Limited Adaptive Histogram Equalization) on LAB color space.
- **`BuildingDetector`:** Multi-spectral rooftop isolation (terracotta tile, concrete slab, metal roofing), shadow validation, and rectangularization.
- **`RoadDetector`:** Neutral grey / asphalt low-saturation mask, directional morphological kernels, and centerline corridor extraction.
- **`ParcelDetector`:** Multi-scale Canny gradient, edge closing, distance transform, and watershed partitioning into cadastral parcels.
- **`PostProcessor`:** Evaluates topological containment (identifies which buildings reside within which parcel), assigns land use, and injects cadastral survey disclaimers.
- **`Vectorizer`:** Transforms pixel coordinates $(x, y)$ to geographic coordinates $(lng, lat)$ based on image bounds and ground sampling distance (GSD).

### 2.3 Frontend (`React + Vite + Leaflet`)
- **Map View:** Leaflet `L.map` rendering high-precision `L.imageOverlay` aligned with vector GeoJSON layers.
- **Inspection Drawer:** Instant metric readout ($m^2$, sq ft, perimeter, confidence, status).
- **Interactive Editing:** Modal editor to adjust coordinates, land use, and reclassify parcels from `AI Detected` to `User Corrected`.
- **Exporting:** Direct downloads for GeoJSON and CSV.
