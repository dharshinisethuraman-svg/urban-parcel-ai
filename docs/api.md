# Cadastral API Reference Documentation

All endpoints are hosted at `http://127.0.0.1:8000/api`. Interactive OpenAPI / Swagger UI is accessible at `http://127.0.0.1:8000/docs`.

---

## 1. Projects API

### `POST /api/projects`
Creates a new cadastral survey project.
- **Request Body:**
```json
{
  "name": "Ward 5 Urban Cadastre",
  "description": "High-resolution drone orthomosaic survey",
  "location": "Municipal Ward 5",
  "center_lat": 12.9716,
  "center_lng": 77.5946,
  "zoom_level": 18
}
```
- **Response:** `201 Created` with project object.

### `GET /api/projects`
Returns a list of all survey projects with feature statistics.

### `GET /api/projects/{project_id}`
Returns details for a specific project.

### `DELETE /api/projects/{project_id}`
Deletes the project, associated images, parcels, buildings, and processing jobs (`CASCADE`).

### `POST /api/projects/init-demo`
Pre-initializes the demonstration drone survey project with synthetic urban imagery.

### `GET /api/dashboard/stats`
Returns aggregated statistics for the dashboard (total projects, images, parcels, buildings, roads, and total surveyed ground area).

---

## 2. Imagery API

### `POST /api/projects/{project_id}/upload`
Uploads a drone orthomosaic image.
- **Content-Type:** `multipart/form-data`
- **Fields:**
  - `file`: Image binary (`JPG`, `JPEG`, `PNG`, `TIFF`, max 50MB)
  - `location`: Optional text location string
- **Response:** `201 Created` with image metadata including WGS84 bounding box.

### `GET /api/images/{image_id}/file`
Serves the raw image file for Leaflet `L.imageOverlay`.

---

## 3. AI Processing API

### `POST /api/projects/{project_id}/process`
Initiates the asynchronous AI feature extraction workflow.
- **Response:** `202 Accepted` with initial job record.

### `GET /api/projects/{project_id}/status`
Polls current processing status and step logs.
- **Response:**
```json
{
  "id": "job-uuid",
  "project_id": "proj-uuid",
  "status": "completed",
  "progress_pct": 100,
  "current_step": "Analysis completed",
  "logs": [
    {"time": "14:02:11", "step": "Image Preprocessing", "message": "..."},
    {"time": "14:02:12", "step": "Road Network Detection", "message": "..."}
  ]
}
```

---

## 4. Cadastral Features API

### `GET /api/projects/{project_id}/layers`
Returns a combined manifest of all spatial layers:
- `image_overlay`: bounds and image URL
- `parcels`: GeoJSON FeatureCollection
- `buildings`: GeoJSON FeatureCollection
- `roads`: GeoJSON FeatureCollection
- `disclaimer`: Official cadastral survey legal disclaimer

### `PUT /api/projects/{project_id}/parcels/{parcel_id}`
Updates a parcel's geometry or metadata following human-in-the-loop surveyor editing. Automatically marks status as `"User Corrected"`.

---

## 5. Export API

### `GET /api/projects/{project_id}/export/geojson?layer=combined|parcels|buildings|roads`
Downloads standard RFC 7946 GeoJSON file with WGS84 coordinates.

### `GET /api/projects/{project_id}/export/csv?layer=parcels|buildings`
Downloads tabular CSV spreadsheet containing attribute records.
