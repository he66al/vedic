from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import Optional
import uuid
from datetime import datetime, timezone

from calculator import compute_chart

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI(title="Vedic Astrology API")
api_router = APIRouter(prefix="/api")


class CalculateRequest(BaseModel):
    birth_date: str = Field(..., description="YYYY-MM-DD")
    birth_time: str = Field(..., description="HH:MM (24h)")
    latitude: float
    longitude: float
    timezone: Optional[str] = None
    place_name: Optional[str] = None


class SavedChart(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    request: CalculateRequest
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


@api_router.get("/")
async def root():
    return {"message": "Vedic Astrology API", "status": "ok"}


@api_router.post("/calculate")
async def calculate(req: CalculateRequest):
    try:
        year, month, day = map(int, req.birth_date.split("-"))
        hour, minute = map(int, req.birth_time.split(":"))
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid date or time format")

    try:
        result = compute_chart(
            year=year, month=month, day=day, hour=hour, minute=minute,
            latitude=req.latitude, longitude=req.longitude,
            timezone_name=req.timezone,
        )
    except Exception as e:
        logging.exception("Chart calculation failed")
        raise HTTPException(status_code=500, detail=f"Calculation error: {e}")

    # Persist request (optional history)
    doc = {
        "id": str(uuid.uuid4()),
        "request": req.model_dump(),
        "place_name": req.place_name,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    try:
        await db.charts.insert_one({**doc})
    except Exception:
        pass

    result["id"] = doc["id"]
    return result


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
)
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
