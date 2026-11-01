import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import db_manager
from app.routes.auth_routes import router as auth_router
from app.routes.event_routes import router as event_router
from app.routes.ai_routes import router as ai_router
from app.routes.budget_routes import router as budget_router
from app.routes.modules_routes import router as modules_router
from app.routes.dashboard_routes import router as dashboard_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="EventEase AI: Multi-Agent Intelligent Event Planning Platform"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*"
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["*"],
)

@app.on_event("startup")
async def on_startup():
    await db_manager.connect()
    # Seed default demo user and sample event on first run
    from app.utils.seeder import run_all_seeds
    await run_all_seeds()

@app.get("/")
@app.head("/")
async def root():
    return {
        "project": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "online",
        "documentation": "/docs"
    }

# Register API Routers
app.include_router(auth_router, prefix=settings.API_PREFIX)
app.include_router(event_router, prefix=settings.API_PREFIX)
app.include_router(ai_router, prefix=settings.API_PREFIX)
app.include_router(budget_router, prefix=settings.API_PREFIX)
app.include_router(modules_router, prefix=settings.API_PREFIX)
app.include_router(dashboard_router, prefix=settings.API_PREFIX)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)

