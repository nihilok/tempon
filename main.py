import asyncio
import os
import sys
from pathlib import Path

import aiohttp
import requests
import uvicorn

from fastapi import FastAPI, APIRouter, Request, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from starlette.middleware.cors import CORSMiddleware
from starlette.responses import RedirectResponse, StreamingResponse
from fast_auth import fast_auth

STATIC_FILES_PATH = Path(os.path.dirname(os.path.abspath(__file__))) / "dist"

DATA_URL = os.environ["DATA_URL"]
VIDEO_IP = os.getenv("VIDEO_IP")


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

@api_router.get("/video/")
async def proxy_video():
    if not VIDEO_IP:
        raise HTTPException(status_code=404, detail="Video feed not found")
    video_feed_url = f"http://{VIDEO_IP}"

    async with aiohttp.ClientSession() as session:
        async with session.get(video_feed_url) as resp:
            if resp.status != 200:
                raise HTTPException(status_code=resp.status, detail="Error fetching video feed")

            async def generate():
                async for chunk in resp.content.iter_any():
                    yield chunk

            return StreamingResponse(generate(), headers=resp.headers)

# Include the API router
app.include_router(api_router)

# Mount static files first (for JS, CSS, images, etc.)
app.mount("/", StaticFiles(directory=STATIC_FILES_PATH, html=True), name="static")

if __name__ == "__main__":
    uvicorn.run("main:app", host="localhost", port=8000, reload=True)