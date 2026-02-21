from fastapi import APIRouter, HTTPException, Header
from app.database import supabase
from app.models import LightToggle
from app.mqtt.publisher import send_rpc_command
from typing import Optional
from datetime import datetime, timezone
import os

router = APIRouter(prefix="/controls", tags=["controls"])

# ThingsBoard device ID for the ESP32 (from .env)
DEVICE_ID = os.getenv("THINGSBOARD_DEVICE_ID")


@router.get("/light/{plant_id}")
async def get_light_status(plant_id: str, authorization: Optional[str] = Header(None)):
    """Get current light status for a plant"""
    try:
        result = (
            supabase.table("light_status")
            .select("*")
            .eq("plant_id", plant_id)
            .order("updated_at", desc=True)
            .limit(1)
            .execute()
        )
        if not result.data:
            return {"is_on": False}
        return result.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/light/{plant_id}")
async def toggle_light(plant_id: str, payload: LightToggle, authorization: Optional[str] = Header(None)):
    """
    Toggle light on/off for a plant.
    Saves state to DB and sends RPC command to ESP32 via ThingsBoard.
    """
    try:
        # Update or insert light status
        existing = (
            supabase.table("light_status")
            .select("id")
            .eq("plant_id", plant_id)
            .execute()
        )

        if existing.data:
            result = (
                supabase.table("light_status")
                .update({"is_on": payload.is_on, "updated_at": datetime.now(timezone.utc).isoformat()})
                .eq("plant_id", plant_id)
                .execute()
            )
        else:
            result = (
                supabase.table("light_status")
                .insert({"plant_id": plant_id, "is_on": payload.is_on})
                .execute()
            )

        # Send RPC command to ESP32 via ThingsBoard
        try:
            await send_rpc_command(
                device_id=DEVICE_ID,
                light_on=payload.is_on,
                water_plant=False,
            )
        except Exception as rpc_err:
            print(f"[Controls] RPC failed (light): {rpc_err}")
            # Don't fail the request — DB state is already updated

        return {"plant_id": plant_id, "is_on": payload.is_on, "message": "Light updated"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/water/{plant_id}")
async def trigger_water(plant_id: str, authorization: Optional[str] = Header(None)):
    """
    Trigger manual watering for a plant.
    Updates last_watered timestamp and sends RPC command to ESP32 via ThingsBoard.
    """
    try:
        now = datetime.now(timezone.utc).isoformat()
        supabase.table("plants").update({"last_watered": now}).eq("id", plant_id).execute()

        # Send RPC command to ESP32 via ThingsBoard
        try:
            await send_rpc_command(
                device_id=DEVICE_ID,
                light_on=False,
                water_plant=True,
            )
        except Exception as rpc_err:
            print(f"[Controls] RPC failed (water): {rpc_err}")

        return {"plant_id": plant_id, "last_watered": now, "message": "Watering triggered"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
