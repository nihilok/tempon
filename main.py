import os
from pathlib import Path

import aiohttp
import uvicorn

from fastapi import FastAPI, APIRouter, Request, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from starlette.middleware.cors import CORSMiddleware
from starlette.responses import RedirectResponse

STATIC_FILES_PATH = Path(os.path.dirname(os.path.abspath(__file__))) / "dist"

DATA_URL = os.environ["DATA_URL"]


async def not_found_response(request: Request, exception: HTTPException):
    # Only serve index.html for non-API routes
    path = request.url.path
    if not path.startswith("/api/"):
        return FileResponse(STATIC_FILES_PATH / "index.html", status_code=200)
    # If the path does not end with a slash, redirect to the same path with a slash
    if not path.endswith("/"):
        return RedirectResponse(f"{path}/", status_code=301)

    # Otherwise, return 404 page
    return FileResponse(STATIC_FILES_PATH / "404.html", status_code=404)

async def internal_server_error_response(request: Request, exception: HTTPException):
    return FileResponse(STATIC_FILES_PATH / "500.html", status_code=500)

exceptions = {
    404: not_found_response,
    500: internal_server_error_response,
}
app = FastAPI(exception_handlers=exceptions)

def set_cors_origins(a: FastAPI):
    a.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

set_cors_origins(app)

# Create API router
api_router = APIRouter(prefix="/api/v3")

@api_router.get("/data/")
async def get_data():
    async with aiohttp.ClientSession() as session:
        async with session.get(DATA_URL) as response:
            if response.status != 200:
                raise HTTPException(status_code=response.status, detail="Error fetching data")
            data = await response.json()
            return data

# Include the API router
app.include_router(api_router)

# Mount static files first (for JS, CSS, images, etc.)
app.mount("/", StaticFiles(directory=STATIC_FILES_PATH, html=True), name="static")

if __name__ == "__main__":
    uvicorn.run("main:app", host="localhost", port=8000, reload=True)