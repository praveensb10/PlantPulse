from fastapi import APIRouter, HTTPException, Header
from app.database import supabase
from app.models import LightToggle
from typing import Optional
from datetime import datetime, timezone

router = APIRouter(prefix="/controls", tags=["controls"])


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
    Saves state to DB. Frontend reads this to show current state.
    -----------------------------------------------------------------
    AMRITH - INTEGRATION POINT:
    After saving to DB, add your MQTT publish command here to send
    the on/off signal to the ESP32 grow light.
    Example: mqtt_client.publish(f"plant/{plant_id}/light", "ON"/"OFF")
    -----------------------------------------------------------------
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

        # AMRITH: Add MQTT publish here
        # mqtt_client.publish(f"plant/{plant_id}/light", "ON" if payload.is_on else "OFF")

        return {"plant_id": plant_id, "is_on": payload.is_on, "message": "Light updated"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/water/{plant_id}")
async def trigger_water(plant_id: str, authorization: Optional[str] = Header(None)):
    """
    Trigger manual watering for a plant.
    Updates last_watered timestamp in plants table.
    -----------------------------------------------------------------
    AMRITH - INTEGRATION POINT:
    After updating DB, add your MQTT publish command here to trigger
    the water pump on ESP32.
    Example: mqtt_client.publish(f"plant/{plant_id}/water", "TRIGGER")
    -----------------------------------------------------------------
    """
    try:
        now = datetime.now(timezone.utc).isoformat()
        supabase.table("plants").update({"last_watered": now}).eq("id", plant_id).execute()

        # AMRITH: Add MQTT publish here
        # mqtt_client.publish(f"plant/{plant_id}/water", "TRIGGER")

        return {"plant_id": plant_id, "last_watered": now, "message": "Watering triggered"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
