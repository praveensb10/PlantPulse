from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class PlantCreate(BaseModel):
    name: str
    variety: Optional[str] = None
    plant_type: Optional[str] = None
    image_url: Optional[str] = None


class PlantResponse(BaseModel):
    id: int
    user_id: str
    name: str
    variety: Optional[str]
    plant_type: Optional[str]
    image_url: Optional[str]
    last_watered: Optional[datetime]
    created_at: datetime


class SensorReading(BaseModel):
    plant_id: int
    soil_moisture: Optional[float] = None
    temperature: Optional[float] = None
    humidity: Optional[float] = None
    light_intensity: Optional[float] = None
    nitrogen: Optional[float] = None
    phosphorus: Optional[float] = None
    potassium: Optional[float] = None
    watering_needed: Optional[bool] = None
    health_status: Optional[str] = None


class LightToggle(BaseModel):
    is_on: bool


class WaterTrigger(BaseModel):
    plant_id: str
