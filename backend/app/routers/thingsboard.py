
import logging
from fastapi import APIRouter, HTTPException, Request
from app.database import supabase
from app.models import SensorReading

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/thingsboard", tags=["thingsboard"])


@router.post("/webhook")
async def thingsboard_webhook(request: Request):
    """
    Receive sensor data pushed from ThingsBoard server.
    Accepts the raw JSON body so we can log exactly what ThingsBoard sends,
    then validates and stores it in the sensor_readings table.
    """
    # Log raw body for debugging
    raw_body = await request.body()
    logger.info(f"[ThingsBoard] Raw payload: {raw_body.decode()}")
    print(f"[ThingsBoard] Raw payload: {raw_body.decode()}")

    try:
        payload = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON payload")

    # Validate with Pydantic model
    try:
        reading = SensorReading(**payload)
    except Exception as e:
        logger.error(f"[ThingsBoard] Validation error: {e}")
        raise HTTPException(status_code=422, detail=f"Validation error: {e}")

    if not reading.plant_id:
        raise HTTPException(status_code=400, detail="plant_id is required")

    try:
        data = reading.dict(exclude_none=True)
        result = supabase.table("sensor_readings").insert(data).execute()
        print(f"[ThingsBoard] Data saved for plant: {reading.plant_id}")
        return {"status": "ok", "data": result.data[0]}
    except Exception as e:
        logger.error(f"[ThingsBoard] DB error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
