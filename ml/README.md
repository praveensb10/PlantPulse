# TFLite Workflow Commands

## Current models used (in `final/plant_model.ipynb`)
- Framework: TensorFlow / Keras
- Model type: Classification
- Watering model: Binary classifier (`No Water` / `Needs Water`) using a Keras `Sequential` network
- Health model: Multiclass classifier (`Healthy` / `Moderate Stress` / `High Stress`) using a Keras `Sequential` network
- Export format: Float32 `.tflite` models for ESP32/runtime inference

## 1) Activate virtual environment
```bash
source .venv/bin/activate
```

## 2) Export both models to TFLite
This exports:
- `final/watering_model_float32.tflite`
- `final/health_model_float32.tflite`
- `final/notebook_tflite_metadata.json`

```bash
python3 final/export_tflite_for_esp32.py
```

## 3) Test both TFLite models with mock data
```bash
python3 final/test_tflite_mock.py
```

## 4) (Optional) Check expected input dimensions directly
```bash
python3 - <<'PY'
import tensorflow as tf
w=tf.lite.Interpreter(model_path='final/watering_model_float32.tflite'); w.allocate_tensors(); print('watering input shape:', w.get_input_details()[0]['shape'])
h=tf.lite.Interpreter(model_path='final/health_model_float32.tflite'); h.allocate_tensors(); print('health input shape:', h.get_input_details()[0]['shape'])
PY
```

## 5) ESP32 model-to-header conversion (if needed)
```bash
xxd -i final/watering_model_float32.tflite > final/watering_model_data.h
xxd -i final/health_model_float32.tflite > final/health_model_data.h
```

## Notes
- Watering TFLite input order is now:
  1. `SoilMoisture`
  2. `Temperature`
  3. `Humidity`
- Health TFLite input order is:
  1. `SoilMoisture`
  2. `Temperature`
  3. `Humidity`
  4. `LightIntensity`
  5. `Nitrogen`
  6. `Phosphorus`
  7. `Potassium`
