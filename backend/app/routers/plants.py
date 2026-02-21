from fastapi import APIRouter, HTTPException, Header
from app.database import supabase
from app.models import PlantCreate
from typing import Optional
import json

router = APIRouter(prefix="/plants", tags=["plants"])


def get_user_id(authorization: str) -> str:
    """Extract user from JWT token via Supabase"""
    try:
        token = authorization.replace("Bearer ", "")
        user = supabase.auth.get_user(token)
        return user.user.id
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")


@router.get("/")
async def get_plants(authorization: Optional[str] = Header(None)):
    user_id = get_user_id(authorization)
    try:
        result = supabase.table("plants").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
        return result.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/")
async def create_plant(plant: PlantCreate, authorization: Optional[str] = Header(None)):
    user_id = get_user_id(authorization)
    try:
        data = {
            "user_id": user_id,
            "name": plant.name,
            "variety": plant.variety,
            "plant_type": plant.plant_type,
            "image_url": plant.image_url,
        }
        result = supabase.table("plants").insert(data).execute()

        # Insert dummy sensor reading so detail page works immediately
        plant_id = result.data[0]["id"]
        dummy_reading = {
            "plant_id": plant_id,
            "soil_moisture": 42.5,
            "temperature": 27.3,
            "humidity": 65.0,
            "light_intensity": 850.0,
            "nitrogen": 75.0,
            "phosphorus": 22.0,
            "potassium": 110.0,
            "watering_needed": True,
            "health_status": "Moderate Stress",
            "light_on": False,
        }
        supabase.table("sensor_readings").insert(dummy_reading).execute()

        # Insert default light status
        supabase.table("light_status").insert({"plant_id": plant_id, "is_on": False}).execute()

        return result.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{plant_id}")
async def get_plant(plant_id: str, authorization: Optional[str] = Header(None)):
    user_id = get_user_id(authorization)
    try:
        result = supabase.table("plants").select("*").eq("id", plant_id).eq("user_id", user_id).single().execute()
        return result.data
    except Exception as e:
        raise HTTPException(status_code=404, detail="Plant not found")


@router.delete("/{plant_id}")
async def delete_plant(plant_id: str, authorization: Optional[str] = Header(None)):
    user_id = get_user_id(authorization)
    try:
        supabase.table("plants").delete().eq("id", plant_id).eq("user_id", user_id).execute()
        return {"message": "Plant deleted"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
