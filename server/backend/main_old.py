"""
Main FastAPI Application

Entry point for the Agentic Multimodal Patient Understanding System.
"""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from contextlib import asynccontextmanager
import logging
import sys
from datetime import datetime

from routers import patient_analysis_router, health_router
from config import settings

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler("logs/app.log") if settings.LOG_TO_FILE else logging.NullHandler()
    ]
)

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan manager.
    
    Handles startup and shutdown events.
    """
    # Startup
    logger.info("=" * 80)
    logger.info("Starting Agentic Multimodal Patient Understanding System")
    logger.info(f"Environment: {settings.ENVIRONMENT}")
    logger.info(f"Debug Mode: {settings.DEBUG}")
    logger.info("=" * 80)
    
    yield
    
    # Shutdown
    logger.info("Shutting down Agentic Multimodal Patient Understanding System")


# Create FastAPI application
app = FastAPI(
    title=settings.APP_NAME,
    description=settings.APP_DESCRIPTION,
    version=settings.VERSION,
    lifespan=lifespan,
    debug=settings.DEBUG,
    docs_url="/docs" if settings.ENABLE_DOCS else None,
    redoc_url="/redoc" if settings.ENABLE_DOCS else None,
)


# ============= Middleware =============

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Request logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    """
    Log all incoming requests.
    """
    start_time = datetime.utcnow()
    
    # Log request
    logger.info(f"Request: {request.method} {request.url.path}")
    
    # Process request
    response = await call_next(request)
    
    # Log response
    process_time = (datetime.utcnow() - start_time).total_seconds() * 1000
    logger.info(
        f"Response: {request.method} {request.url.path} - "
        f"Status: {response.status_code} - Time: {process_time:.2f}ms"
    )
    
    return response


# ============= Exception Handlers =============

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """
    Handle validation errors with detailed error messages.
    """
    logger.error(f"Validation error: {exc.errors()}")
    return JSONResponse(
        status_code=422,
        content={
            "error": "Validation Error",
            "detail": exc.errors(),
            "timestamp": datetime.utcnow().isoformat()
        }
    )


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """
    Global exception handler for unhandled errors.
    """
    logger.error(f"Unhandled exception: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal Server Error",
            "detail": str(exc) if settings.DEBUG else "An unexpected error occurred",
            "timestamp": datetime.utcnow().isoformat()
        }
    )


# ============= Include Routers =============

app.include_router(health_router)
app.include_router(patient_analysis_router)


# ============= Root Endpoint =============

@app.get("/", tags=["Root"])
async def root():
    """
    Root endpoint providing API information.
    """
    return {
        "name": settings.APP_NAME,
        "version": settings.VERSION,
        "description": settings.APP_DESCRIPTION,
        "status": "running",
        "timestamp": datetime.utcnow().isoformat(),
        "endpoints": {
            "documentation": "/docs" if settings.ENABLE_DOCS else "disabled",
            "health_check": "/api/v1/health/",
            "patient_analysis": "/api/v1/analysis/patient",
            "agent_status": "/api/v1/analysis/status"
        }
    }


# ============= Application Entry Point =============

if __name__ == "__main__":
    import uvicorn
    
    logger.info("Starting application with Uvicorn...")
    
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level=settings.LOG_LEVEL.lower()
    )
