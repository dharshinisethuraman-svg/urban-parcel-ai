import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.database import Base, engine, BASE_DIR
from app.routes.projects import router as projects_router
from app.routes.images import router as images_router
from app.routes.processing import router as processing_router
from app.routes.features import router as features_router
from app.routes.export import router as export_router
from app.ai_pipeline.postprocessing import LEGAL_DISCLAIMER
from demo_data.generate_sample_drone_data import generate_realistic_drone_orthomosaic

# Create all database tables immediately
Base.metadata.create_all(bind=engine)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Ensure tables exist
    Base.metadata.create_all(bind=engine)

    # Ensure directories exist
    uploads_dir = os.path.join(BASE_DIR, "uploads")
    os.makedirs(uploads_dir, exist_ok=True)

    # Ensure demo sample image exists
    sample_path = os.path.join(uploads_dir, "sample_drone_orthomosaic.jpg")
    if not os.path.exists(sample_path):
        try:
            generate_realistic_drone_orthomosaic(sample_path)
        except Exception as e:
            print(f"[Warning] Failed to generate demo orthomosaic: {e}")

    yield

app = FastAPI(
    title="AI-Based Automated Urban Parcel Mapping & Cadastral Feature Extraction System",
    description="Automated cadastral mapping, parcel boundary delineation, building extraction, and road network vectorization from drone imagery.",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for development and cross-origin frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount uploads directory for static file access
uploads_dir = os.path.join(BASE_DIR, "uploads")
os.makedirs(uploads_dir, exist_ok=True)
app.mount("/static/uploads", StaticFiles(directory=uploads_dir), name="uploads")

# Include Routers
app.include_router(projects_router)
app.include_router(images_router)
app.include_router(processing_router)
app.include_router(features_router)
app.include_router(export_router)

@app.get("/")
def root():
    return {
        "system": "AI-Based Automated Urban Parcel Mapping and Cadastral Feature Extraction System",
        "status": "online",
        "version": "1.0.0",
        "ai_engine": {
            "mode": "Computer Vision Prototype (Modular Architecture)",
            "supported_models_future": ["U-Net", "Mask R-CNN", "YOLOv8-seg", "SAM (Segment Anything)"],
            "current_implementation": "Spectral Roof Analysis, Multi-Scale Canny/Sobel Boundary Delineation, Watershed Cadastral Partitioning"
        },
        "disclaimer": LEGAL_DISCLAIMER,
        "docs_url": "/docs"
    }

@app.get("/api/health")
def health():
    return {
        "status": "healthy",
        "database": "SQLite (WGS84 Vector Coordinates ready for PostGIS)",
        "disclaimer": LEGAL_DISCLAIMER
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
