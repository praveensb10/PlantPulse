from fastapi import APIRouter, HTTPException, Header
from app.database import supabase
from app.models import SensorReading
from typing import Optional

router = APIRouter(prefix="/sensor-data", tags=["sensor-data"])


@router.get("/{plant_id}")
async def get_latest_sensor_data(plant_id: str, authorization: Optional[str] = Header(None)):
    """Get the latest sensor reading for a plant"""
    try:
        result = (
            supabase.table("sensor_readings")
            .select("*")
            .eq("plant_id", plant_id)
            .order("timestamp", desc=True)
            .limit(1)
            .execute()
        )
        if not result.data:
            return None
        return result.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{plant_id}/history")
async def get_sensor_history(plant_id: str, limit: int = 20, authorization: Optional[str] = Header(None)):
    """Get recent sensor readings history for a plant"""
    try:
        result = (
            supabase.table("sensor_readings")
            .select("*")
            .eq("plant_id", plant_id)
            .order("timestamp", desc=True)
            .limit(limit)
            .execute()
        )
        return result.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/")
async def insert_sensor_reading(reading: SensorReading):
    """
    Insert a new sensor reading.
    -----------------------------------------------------------------
    AMRITH - INTEGRATION POINT:
    Your MQTT subscriber should call this endpoint (or call the
    supabase insert directly) whenever new data arrives from ESP32.
    The ESP32 should publish JSON with these fields:
    {
        "plant_id": "<uuid of the plant>",
        "soil_moisture": 42.5,
        "temperature": 27.3,
        "humidity": 65.0,
        "light_intensity": 850.0,
        "nitrogen": 75.0,
        "phosphorus": 22.0,
        "potassium": 110.0,
        "watering_needed": true,
        "health_status": "Healthy"
    }
    -----------------------------------------------------------------
    """
    try:
        data = reading.dict()
        result = supabase.table("sensor_readings").insert(data).execute()
        return result.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
