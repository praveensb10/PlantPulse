"""
MQTT Subscriber - AMRITH's INTEGRATION FILE
============================================
This is the ONLY file Amrith needs to modify for IoT integration.

Steps for Amrith:
1. Install paho-mqtt: pip install paho-mqtt
2. Fill in MQTT_BROKER, MQTT_PORT, MQTT_TOPIC below
3. Run this file separately: python -m app.mqtt.subscriber
4. ESP32 should publish JSON to the topic with this structure:
   {
       "plant_id": "<uuid>",
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

NPK thresholds (for reference - TFLite model on ESP32 handles this):
- Nitrogen: Deficient < 40, Optimal 40-120, Excess > 120
- Phosphorus: Deficient < 10, Optimal 10-40, Excess > 40
- Potassium: Deficient < 50, Optimal 50-200, Excess > 200
"""

import json
import os
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from app.database import supabase

# ============================================================
# AMRITH - FILL THESE IN
# ============================================================
MQTT_BROKER = "YOUR_MQTT_BROKER_URL"   # e.g. "broker.hivemq.com"
MQTT_PORT = 1883
MQTT_TOPIC = "plant-monitor/sensors"   # match with ESP32 publish topic
MQTT_USERNAME = None                    # if broker needs auth
MQTT_PASSWORD = None                    # if broker needs auth
# ============================================================


def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print(f"[MQTT] Connected to broker: {MQTT_BROKER}")
        client.subscribe(MQTT_TOPIC)
        print(f"[MQTT] Subscribed to topic: {MQTT_TOPIC}")
    else:
        print(f"[MQTT] Connection failed with code {rc}")


def on_message(client, userdata, msg):
    try:
        payload = json.loads(msg.payload.decode("utf-8"))
        print(f"[MQTT] Received: {payload}")

        # Validate plant_id exists
        plant_id = payload.get("plant_id")
        if not plant_id:
            print("[MQTT] Error: No plant_id in payload")
            return

        # Save to Supabase
        reading = {
            "plant_id": plant_id,
            "soil_moisture": payload.get("soil_moisture"),
            "temperature": payload.get("temperature"),
            "humidity": payload.get("humidity"),
            "light_intensity": payload.get("light_intensity"),
            "nitrogen": payload.get("nitrogen"),
            "phosphorus": payload.get("phosphorus"),
            "potassium": payload.get("potassium"),
            "watering_needed": payload.get("watering_needed"),
            "health_status": payload.get("health_status"),
        }

        result = supabase.table("sensor_readings").insert(reading).execute()
        print(f"[MQTT] Saved reading to DB for plant: {plant_id}")

    except json.JSONDecodeError:
        print("[MQTT] Error: Invalid JSON payload")
    except Exception as e:
        print(f"[MQTT] Error saving to DB: {e}")


def on_disconnect(client, userdata, rc):
    print(f"[MQTT] Disconnected with code {rc}")


def start():
    try:
        import paho.mqtt.client as mqtt
    except ImportError:
        print("[MQTT] paho-mqtt not installed. Run: pip install paho-mqtt")
        return

    client = mqtt.Client()

    if MQTT_USERNAME and MQTT_PASSWORD:
        client.username_pw_set(MQTT_USERNAME, MQTT_PASSWORD)

    client.on_connect = on_connect
    client.on_message = on_message
    client.on_disconnect = on_disconnect

    print(f"[MQTT] Connecting to {MQTT_BROKER}:{MQTT_PORT}...")
    client.connect(MQTT_BROKER, MQTT_PORT, 60)
    client.loop_forever()


if __name__ == "__main__":
    start()
