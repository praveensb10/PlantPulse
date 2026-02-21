# PlantPulse — Smart Indoor Garden Monitor

IoT-powered tabletop garden monitoring web app for indoor plants (Tulsi, Green Chilli, Spinach etc.)

## How it all connects

```
ESP32 (sensors + TFLite ML)
    → MQTT publish
        → subscriber.py (receives + saves to Supabase)
            → Supabase DB
                → FastAPI backend (reads from DB)
                    → React frontend (displays live)
```

The ESP32 runs the TFLite ML model locally and sends both sensor readings AND prediction results (watering_needed, health_status) via MQTT. The backend just stores and serves it. The frontend displays it.

---

## Live Sensor Updates

The Plant Detail page automatically polls for new sensor data every 30 seconds without any page refresh:

```js
// frontend/src/pages/PlantDetail.jsx
const interval = setInterval(async () => {
  const sensorData = await getLatestSensorData(id)
  setSensor(sensorData)
}, 30000)
```

For demo/presentation, change `30000` to `5000` for 5 second updates — one line change.

---

---

## Project Structure

```
plant-monitor/
├── frontend/   → React + Vite + Tailwind
└── backend/    → FastAPI (Python)
```

---

## Running Locally

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
# Runs on http://localhost:8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

---

## oT Integration

Only need to touch ONE file: `backend/app/mqtt/subscriber.py`

1. Install paho-mqtt: `pip install paho-mqtt`
2. Open `subscriber.py` and fill in:
   - `MQTT_BROKER` — your broker URL
   - `MQTT_PORT` — usually 1883
   - `MQTT_TOPIC` — match with ESP32 publish topic
3. Run subscriber separately: `python -m app.mqtt.subscriber`

ESP32 should publish this JSON to the MQTT topic:
```json
{
  "plant_id": "<uuid from Supabase plants table>",
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
```

For light/water commands FROM the app TO ESP32, add MQTT publish calls in:
- `backend/app/routers/controls.py` → `toggle_light()` and `trigger_water()`
(marked with # AMRITH comments)

---

## NPK Thresholds
- Nitrogen: Deficient < 40, Optimal 40–120 mg/kg
- Phosphorus: Deficient < 10, Optimal 10–40 mg/kg  
- Potassium: Deficient < 50, Optimal 50–200 mg/kg

---

## Deployment (later)
- Frontend → Vercel
- Backend → Railway or Render
