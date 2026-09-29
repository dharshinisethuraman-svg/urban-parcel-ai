# AI-Based Automated Urban Parcel Mapping and Cadastral Feature Extraction System using Drone Imagery

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React_19_+_Vite-61DAFB?logo=react)](https://react.dev)
[![Leaflet](https://img.shields.io/badge/GIS-Leaflet-199900?logo=leaflet)](https://leafletjs.com)
[![OpenCV](https://img.shields.io/badge/CV-OpenCV_5-5C3EE8?logo=opencv)](https://opencv.org)
[![Shapely](https://img.shields.io/badge/Geometry-Shapely-3776AB)](https://shapely.readthedocs.io)

---

## 1. Project Overview & Problem Statement

Urban cadastral mapping—the surveying and delineation of land parcel boundaries, buildings, and road infrastructure—is conventionally a manual, time-intensive, and costly process. Field surveyors must physically measure boundary corners, and GIS technicians manually digitize boundaries from aerial orthomosaics.

This full-stack system provides an **AI-powered photogrammetric platform** that automatically ingests aerial drone orthomosaics, executes multi-class cadastral feature extraction (parcels, buildings, roads), renders the results on an interactive GIS map, allows human-in-the-loop surveyor boundary corrections, and exports standardized OGC GeoJSON and tabular CSV data.

---

## 2. Key Features

- **Drone Imagery Upload:** Drag-and-drop support for high-resolution aerial orthomosaics (`JPG`, `JPEG`, `PNG`, `TIFF` up to 50MB) with automatic spatial bounding calculation.
- **Preloaded Synthetic Survey Demo:** One-click instant demonstration with a high-resolution urban aerial survey featuring roads, parcels, and diverse roof styles.
- **Modular AI & Computer Vision Pipeline:**
  - Bilateral edge-preserving noise suppression & CLAHE contrast enhancement
  - Asphalt & concrete road network detection
  - Spectral rooftop extraction (terracotta tile, concrete slab, tin/metal roofs)
  - Multi-scale gradient & distance-transform watershed cadastral parcel delineation
  - Associative spatial topology (assigning building footprints to containing parcel lots)
  - Sub-pixel WGS84 EPSG:4326 projection & Ground Sampling Distance (GSD) metric scaling
- **Interactive GIS Map Viewer (Leaflet):**
  - High-precision geo-referenced drone imagery overlay with a real-time opacity slider
  - Layer toggles for Parcels, Buildings, Roads, and Basemaps (CartoDB Positron, OpenStreetMap, ESRI Satellite)
  - Interactive feature hover and inspection drawer ($m^2$, sq ft, perimeter, confidence, status)
- **Surveyor Human-in-the-Loop Editing:**
  - Select any parcel to modify boundary vertices and attributes
  - Differentiates between `AI Detected` and `User Corrected` cadastral records
  - Reset to original AI boundary anytime
- **Standardized OGC Export:**
  - RFC 7946 GeoJSON download for QGIS, ArcGIS, MapServer
  - Attribute tabular CSV download for land registry databases
- **Executive Dashboard:**
  - Real-time survey statistics, project management, and area metrics

---

## 3. Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite, Leaflet, Lucide Icons, Fetch API, HTML5/CSS3 |
| **Backend API** | Python 3.12, FastAPI, Uvicorn, Pydantic v2 |
| **Database** | SQLite with Foreign Keys enabled (designed for drop-in PostgreSQL / PostGIS migration) |
| **Computer Vision** | OpenCV 5, NumPy, Pillow, Shapely |
| **Spatial Standards** | GeoJSON (RFC 7946), WGS84 (EPSG:4326), Metric GSD Projection |

---

## 4. Project Folder Structure

```text
urban-parcel-ai/
├── backend/
│   ├── app/
│   │   ├── main.py                  # FastAPI entry point & CORS
│   │   ├── database.py              # SQLite / PostGIS engine & session
│   │   ├── models/                  # SQLAlchemy ORM models
│   │   │   ├── project.py
│   │   │   ├── image.py
│   │   │   ├── parcel.py
│   │   │   ├── building.py
│   │   │   ├── road.py
│   │   │   └── processing_job.py
│   │   ├── schemas/                 # Pydantic v2 schemas
│   │   │   ├── project.py
│   │   │   ├── feature.py
│   │   │   ├── geojson.py
│   │   │   └── image.py
│   │   ├── routes/                  # API endpoints
│   │   │   ├── projects.py
│   │   │   ├── images.py
│   │   │   ├── processing.py
│   │   │   ├── features.py
│   │   │   └── export.py
│   │   └── ai_pipeline/             # Modular Computer Vision / AI engine
│   │       ├── base.py              # Abstract Base Detector interface
│   │       ├── preprocessing.py     # Bilateral filter & CLAHE
│   │       ├── building_detection.py# Rooftop spectral segmentation
│   │       ├── road_detection.py    # Asphalt corridor detection
│   │       ├── parcel_detection.py  # Multi-scale gradient & watershed
│   │       ├── postprocessing.py    # Spatial containment & disclaimers
│   │       └── vectorization.py     # WGS84 projection & GeoJSON
│   ├── demo_data/
│   │   └── generate_sample_drone_data.py
│   ├── uploads/                     # Stored drone orthomosaics
│   ├── requirements.txt
│   └── test_api_flow.py             # Automated end-to-end integration test
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Sidebar.jsx
│   │   │   ├── TopHeader.jsx
│   │   │   ├── DisclaimerBanner.jsx
│   │   │   ├── LayerControl.jsx
│   │   │   ├── ParcelDetailDrawer.jsx
│   │   │   └── EditParcelModal.jsx
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── UploadPage.jsx
│   │   │   ├── ProcessingPage.jsx
│   │   │   ├── MapViewerPage.jsx
│   │   │   ├── ExportPage.jsx
│   │   │   └── AboutPage.jsx
│   │   ├── services/
│   │   │   └── api.js               # REST client
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css                # GIS dashboard stylesheet
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
│
├── data/
│   └── samples/                     # Sample drone orthomosaics
├── docs/
│   ├── architecture.md              # Architectural blueprint
│   ├── api.md                       # Complete REST API reference
│   └── methodology.md               # Photogrammetric mathematical formulas
├── README.md
└── .gitignore
```

---

## 5. Installation & Setup Instructions (Windows)

### Prerequisites
- **Python 3.10+** (Tested on Python 3.12)
- **Node.js 18+** (Tested on Node.js 24)
- **PowerShell** or Command Prompt

### Step 1: Clone or Navigate to Project
```powershell
cd C:\Users\dhars_k0iux1h\.gemini\antigravity\scratch\urban-parcel-ai
```

### Step 2: Set up Backend Dependencies
```powershell
cd backend
python -m pip install -r requirements.txt
```

### Step 3: Set up Frontend Dependencies
```powershell
cd ..\frontend
npm install
```

---

## 6. Running the Application

### Start the FastAPI Backend
Open a PowerShell terminal:
```powershell
cd C:\Users\dhars_k0iux1h\.gemini\antigravity\scratch\urban-parcel-ai\backend
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
The backend API and Swagger UI will be live at:
- **API Base:** `http://127.0.0.1:8000`
- **Swagger Docs:** `http://127.0.0.1:8000/docs`

### Start the React Frontend
Open a second PowerShell terminal:
```powershell
cd C:\Users\dhars_k0iux1h\.gemini\antigravity\scratch\urban-parcel-ai\frontend
npm run dev
```
The React GIS dashboard will open at:
- **Web App:** `http://localhost:5173`

---

## 7. How the AI Pipeline Works

```text
Drone Imagery (TIFF / JPEG)
         ↓
1. Image Preprocessing (Bilateral Noise Filtering & LAB/CLAHE Contrast Enhancement)
         ↓
2. Feature Detection (Asphalt Road Corridors & Rooftop Spectral Segmentation)
         ↓
3. Parcel Delineation (Multi-Scale Canny/Sobel Gradient & Watershed Partitioning)
         ↓
4. Spatial Topology (Containment analysis: assigning buildings to parcel lots)
         ↓
5. Vectorization & GSD Projection (Pixel to WGS84 EPSG:4326 GeoJSON)
         ↓
Database Persistence & Interactive Leaflet Overlay
```

---

## 8. AI Transparency & Future Deep Learning Roadmap

### Current Implementation: Computer Vision Prototype
To maintain academic and professional transparency, this prototype does not falsely claim to use deep learning. It uses a **classical computer vision segmentation pipeline** combining multi-scale edge detection, morphological bridging, color-space thresholding, and watershed partitioning.

### Drop-In Deep Learning Integration
The backend is structured around an abstract base class (`BaseFeatureDetector` in `backend/app/ai_pipeline/base.py`). This allows seamless replacement with:
1. **U-Net / ResNet Feature Pyramid Networks:** For semantic segmentation of aerial land cover.
2. **YOLOv8-seg / Mask R-CNN:** For instance segmentation of individual building footprints.
3. **Segment Anything Model (SAM):** For prompt-based interactive parcel segmentation.
4. **Elevation Models (DEM/DSM):** For height-based 3D building modeling.

---

## 9. Cadastral Accuracy & Ethical Legal Disclaimer

> [!WARNING]
> **Legal Surveying Notice:**
> AI-generated parcel boundaries and building footprints are indicative representations designed for **decision-support, preliminary planning, and mapping assistance**. They do **not** replace legally binding land surveys. All extracted boundaries require verification and official ground-truthing by authorized cadastral and surveying professionals before legal registration in government land records.
