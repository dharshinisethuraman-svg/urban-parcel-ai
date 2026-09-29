from app.routes.projects import router as projects_router
from app.routes.images import router as images_router
from app.routes.processing import router as processing_router
from app.routes.features import router as features_router
from app.routes.export import router as export_router

__all__ = [
    "projects_router",
    "images_router",
    "processing_router",
    "features_router",
    "export_router"
]
