"""
Wolfstitch Cloud - FastAPI Application Entry Point
Railway-optimized deployment with enhanced error handling and dependency management
"""

import os
import sys
import tempfile
import logging
import asyncio
from contextlib import asynccontextmanager
from typing import Optional

# Add project root to Python path for Railway
if '/app' not in sys.path:
    sys.path.insert(0, '/app')
if os.getcwd() not in sys.path:
    sys.path.insert(0, os.getcwd())

from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
import uvicorn

# Configure logging early
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Global variables for dependencies
WOLFCORE_AVAILABLE = False
WOLFSTITCH_CLASS = None
settings = None

def initialize_dependencies():
    """Initialize all dependencies with graceful fallbacks"""
    global WOLFCORE_AVAILABLE, WOLFSTITCH_CLASS, settings
    
    # Try to import wolfcore
    try:
        from wolfcore import Wolfstitch
        WOLFSTITCH_CLASS = Wolfstitch
        WOLFCORE_AVAILABLE = True
        logger.info("✅ Wolfcore successfully imported")
    except ImportError as e:
        logger.warning(f"⚠️ Wolfcore import failed: {e}")
        logger.warning("🔧 Continuing with limited functionality")
        WOLFCORE_AVAILABLE = False

    # Try to import settings
    try:
        from backend.config import settings as app_settings
        settings = app_settings
        logger.info("✅ Backend config successfully imported")
    except ImportError as e:
        logger.warning(f"⚠️ Backend config import failed: {e}")
        # Fallback configuration for Railway
        class Settings:
            ENVIRONMENT = os.getenv("ENVIRONMENT", "production")
            DEBUG = os.getenv("DEBUG", "false").lower() == "true"
            LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
            ALLOWED_HOSTS = os.getenv("ALLOWED_HOSTS", "*").split(",")
            SECRET_KEY = os.getenv("SECRET_KEY", "fallback-railway-key")
        settings = Settings()
        logger.info("🔧 Using fallback configuration")

# Initialize dependencies
initialize_dependencies()

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan management"""
    logger.info("🚀 Starting Wolfstitch Cloud API...")
    
    # Create upload directory
    upload_dir = os.getenv("UPLOAD_DIR", "./uploads")
    os.makedirs(upload_dir, exist_ok=True)
    logger.info(f"📁 Upload directory ready: {upload_dir}")
    
    # Log configuration status
    logger.info(f"🌍 Environment: {settings.ENVIRONMENT}")
    logger.info(f"🧠 Wolfcore available: {WOLFCORE_AVAILABLE}")
    logger.info(f"🐍 Python path: {sys.path[:3]}...")  # First 3 paths
    
    yield
    
    logger.info("🛑 Shutting down Wolfstitch Cloud API...")

# Determine CORS origins based on environment
def get_cors_origins():
    """Get CORS origins based on environment"""
    if settings.ENVIRONMENT.lower() == "production":
        return [
            "https://www.wolfstitch.dev",
            "https://wolfstitch.dev", 
            "https://app.wolfstitch.dev"
        ]
    else:
        return [
            "http://localhost:3000",
            "http://127.0.0.1:3000",
            "https://www.wolfstitch.dev",
            "https://wolfstitch.dev"
        ]

# Create FastAPI application
app = FastAPI(
    title="Wolfstitch Cloud API",
    description="AI Dataset Preparation Platform - Cloud Native",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Configure CORS
cors_origins = get_cors_origins()
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "Accept", "Origin"]
)

# Add trusted host middleware for Railway
if settings.ENVIRONMENT.lower() == "production":
    app.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=["api.wolfstitch.dev", "*.railway.app", "*.up.railway.app"]
    )

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint for Railway and monitoring"""
    return {
        "status": "healthy",
        "environment": settings.ENVIRONMENT,
        "wolfcore_available": WOLFCORE_AVAILABLE,
        "python_version": f"{sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}",
        "service": "wolfstitch-cloud-api",
        "timestamp": asyncio.get_event_loop().time()
    }

# Root endpoint
@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "message": "Wolfstitch Cloud API",
        "version": "1.0.0",
        "status": "operational",
        "docs_url": "/docs",
        "health_url": "/health",
        "wolfcore_status": "available" if WOLFCORE_AVAILABLE else "unavailable"
    }

# File processing endpoint
@app.post("/api/v1/quick-process")
async def quick_process_file(
    file: UploadFile = File(...),
    tokenizer: Optional[str] = "gpt-4",
    max_tokens: Optional[int] = 1000
):
    """
    Process uploaded file into chunks
    Supports 40+ file formats when wolfcore is available
    """
    if not WOLFCORE_AVAILABLE:
        logger.error("Wolfcore not available for file processing")
        raise HTTPException(
            status_code=503,
            detail={
                "message": "File processing service unavailable",
                "error": "Wolfcore dependency not loaded",
                "suggestion": "Please check server configuration"
            }
        )
    
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file selected")
    
    # Validate file size (100MB limit)
    max_size = 100 * 1024 * 1024  # 100MB
    content = await file.read()
    if len(content) > max_size:
        raise HTTPException(
            status_code=413,
            detail=f"File too large. Maximum size is 100MB, got {len(content) / 1024 / 1024:.1f}MB"
        )
    
    # Reset file pointer
    await file.seek(0)
    
    logger.info(f"Processing file: {file.filename} ({len(content)} bytes)")
    
    # Create temporary file
    with tempfile.NamedTemporaryFile(
        delete=False, 
        suffix=f".{file.filename.split('.')[-1]}"
    ) as tmp:
        content = await file.read()
        tmp.write(content)
        tmp_path = tmp.name
    
    try:
        # Process with wolfcore
        wf = WOLFSTITCH_CLASS()
        
        # Use sync processing for better compatibility
        if hasattr(wf, 'process_file_async'):
            result = await wf.process_file_async(
                tmp_path,
                tokenizer=tokenizer,
                max_tokens=max_tokens
            )
        else:
            # Fallback to sync processing
            result = wf.process_file(
                tmp_path,
                tokenizer=tokenizer,
                max_tokens=max_tokens
            )
        
        logger.info(f"✅ Processing completed: {len(result.chunks)} chunks, {result.total_tokens} tokens")
        
        return {
            "message": "File processed successfully",
            "filename": file.filename,
            "chunks": len(result.chunks),
            "total_tokens": result.total_tokens,
            "average_chunk_size": result.total_tokens // len(result.chunks) if result.chunks else 0,
            "preview": [
                {
                    "text": chunk.text[:100] + "..." if len(chunk.text) > 100 else chunk.text,
                    "tokens": getattr(chunk, 'tokens', 0)
                }
                for chunk in result.chunks[:3]
            ]
        }
        
    except Exception as e:
        logger.error(f"❌ Processing failed for {file.filename}: {e}")
        return JSONResponse(
            status_code=500,
            content={
                "message": "File processing failed",
                "error": str(e),
                "filename": file.filename,
                "suggestion": "Please try a different file or contact support"
            }
        )
    finally:
        # Cleanup temp file
        try:
            if os.path.exists(tmp_path):
                os.unlink(tmp_path)
        except Exception as cleanup_error:
            logger.warning(f"⚠️ Failed to cleanup temp file: {cleanup_error}")

# Advanced processing endpoint (future use)
@app.post("/api/v1/process")
async def process_file_advanced(
    file: UploadFile = File(...),
    config: Optional[dict] = None
):
    """Advanced file processing with custom configuration"""
    # Placeholder for future advanced processing features
    return {
        "message": "Advanced processing endpoint - coming soon",
        "filename": file.filename,
        "status": "pending_implementation"
    }

# Error handlers
@app.exception_handler(404)
async def not_found_handler(request, exc):
    """Custom 404 handler"""
    return JSONResponse(
        status_code=404,
        content={
            "message": "Endpoint not found",
            "docs_url": "/docs",
            "available_endpoints": ["/", "/health", "/api/v1/quick-process"]
        }
    )

@app.exception_handler(500)
async def internal_error_handler(request, exc):
    """Custom 500 handler"""
    logger.error(f"Internal server error: {exc}")
    return JSONResponse(
        status_code=500,
        content={
            "message": "Internal server error",
            "detail": str(exc) if settings.DEBUG else "An unexpected error occurred",
            "suggestion": "Please try again or contact support if the problem persists"
        }
    )

# Railway-compatible startup
if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    
    logger.info(f"🚀 Starting server on {host}:{port}")
    logger.info(f"🌍 Environment: {settings.ENVIRONMENT}")
    logger.info(f"🔧 CORS origins: {cors_origins}")
    
    uvicorn.run(
        "backend.main:app",
        host=host,
        port=port,
        log_level=settings.LOG_LEVEL.lower() if hasattr(settings, 'LOG_LEVEL') else "info",
        reload=settings.DEBUG if hasattr(settings, 'DEBUG') else False
    )