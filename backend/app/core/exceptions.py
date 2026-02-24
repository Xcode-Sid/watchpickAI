from fastapi import Request
from fastapi.responses import JSONResponse


async def http_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Catch HTTPException and return consistent JSON."""
    from fastapi import HTTPException
    if isinstance(exc, HTTPException):
        return JSONResponse(
            status_code=exc.status_code,
            content={"success": False, "data": None, "error": exc.detail},
        )
    return JSONResponse(
        status_code=500,
        content={"success": False, "data": None, "error": "Internal server error"},
    )


async def generic_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Catch unhandled exceptions and return consistent JSON."""
    return JSONResponse(
        status_code=500,
        content={"success": False, "data": None, "error": str(exc) if request.app.debug else "Internal server error"},
    )
