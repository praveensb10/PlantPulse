from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import plants, sensor_data, controls

app = FastAPI(title="Plant Monitor API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(plants.router)
app.include_router(sensor_data.router)
app.include_router(controls.router)


@app.get("/")
async def root():
    return {"message": "Plant Monitor API is running"}


@app.get("/health")
async def health():
    return {"status": "ok"}
