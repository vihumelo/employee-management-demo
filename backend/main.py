from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.routes import router as employees_router
from app.core.config import settings
from app.core.logging_config import configure_logging, get_logger

configure_logging(settings.log_level)
logger = get_logger("Application")
app = FastAPI(
    title="Employee Management API",
    description=(
        "Manage employee records, including personal details, admission dates, "
        "and job roles."
    ),
    version="0.1.0",
    openapi_tags=[
        {
            "name": "Employees",
            "description": "Create, retrieve, update, and delete employee records.",
        }
    ],
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(employees_router)


@app.exception_handler(Exception)
async def handle_unexpected_exception(
    _request: Request, error: Exception
) -> JSONResponse:
    logger.error("Unhandled request error (%s)", type(error).__name__)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"},
    )
