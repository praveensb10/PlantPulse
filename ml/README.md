# PlantPulse ML Assets and Inference Guide

This folder contains the ML inference artifacts used by PlantPulse for plant watering and health prediction.

## What is in this folder

- `watering_model_float32.tflite`  
  Binary classifier for watering decision (`No Water` vs `Needs Water`).
- `health_model_float32.tflite`  
  Multiclass classifier for plant health status.
- `esp32_model_metadata.json`  
  ESP32-oriented metadata for feature order, labels, thresholds, and model accuracy.
- `notebook_tflite_metadata.json`  
  Notebook-oriented metadata (feature stats, class list, and file mapping).
- `test_tflite_mock.py`  
  Local sanity script to run both TFLite models with mock sensor inputs.
- `esp32_nutrient_rules.h`  
  Header file with deterministic nutrient threshold checks (low/high NPK).
- `plant_model.ipynb`  
  Training/export notebook used to produce model artifacts.

## Model contracts

### 1) Watering model
- Task: Binary classification
- Output:
  - `0` → `No Water`
  - `1` → `Needs Water`
- Expected input feature order:
  1. `SoilMoisture`
  2. `Temperature`
  3. `Humidity`

### 2) Health model
- Task: Multiclass classification
- Output labels (`esp32_model_metadata.json`):
  - `0` → `Healthy`
  - `1` → `Moderate Stress`
  - `2` → `High Stress`
- Expected input feature order:
  1. `SoilMoisture`
  2. `Temperature`
  3. `Humidity`
  4. `LightIntensity`
  5. `Nitrogen`
  6. `Phosphorus`
  7. `Potassium`

## Model architecture and training approach

These models are lightweight by design so they can run on ESP32/TFLite runtime with low latency.

### Watering model architecture
- Type: small feed-forward neural network (binary classifier)
- Input: `3` sensor features (`SoilMoisture`, `Temperature`, `Humidity`)
- Core layers (from training pipeline):
  - Input layer
  - Normalization layer (adapted on training data)
  - Dense `24` (`ReLU`)
  - Dense `12` (`ReLU`)
  - Output Dense `1` (`Sigmoid`)
- Loss/optimization: binary cross-entropy with Adam optimizer
- Inference rule: probability `>= 0.5` means `Needs Water`

### Health model architecture
- Type: multiclass linear classifier exported to TFLite
- Input: `7` sensor/nutrient features
- Classes: `Healthy`, `Moderate Stress`, `High Stress`
- Training approach (from model export flow):
  - Features are standardized
  - Linear SVM is trained for 3-class prediction
  - Learned linear coefficients are converted into a single Dense logits layer for TFLite portability
- Inference rule: class is selected using `argmax(logits)`

### Why this architecture was chosen
- Small model footprint suitable for embedded use
- Fast inference on resource-constrained hardware
- Stable behavior with interpretable feature inputs
- Clear split between probabilistic ML outputs and deterministic NPK guardrails

## Metadata files and when to use them

### `esp32_model_metadata.json`
Use this as the primary runtime contract for firmware and backend integration. It includes:
- Model file names
- Input feature order
- Output label mapping
- Reported accuracy
- Nutrient thresholds (`nitrogen`, `phosphorus`, `potassium`)

### `notebook_tflite_metadata.json`
Use this mainly for notebook/debug context. It includes:
- Feature list
- Class list
- Input mean/std arrays
- TFLite model names

Note: This file still references historical `.keras` model names for provenance, even though `.keras` files are not stored in this cleaned folder.

## Quick local validation

From repository root:

```bash
cd ml
python3 test_tflite_mock.py
```

What it does:
- Loads both TFLite models
- Reads metadata from `notebook_tflite_metadata.json` first (fallback: `esp32_model_metadata.json`)
- Runs two mock samples
- Prints watering probability, watering decision, health logits, and health class label

## Check model input dimensions

```bash
cd ml
python3 - <<'PY'
import tensorflow as tf

w = tf.lite.Interpreter(model_path='watering_model_float32.tflite')
w.allocate_tensors()
print('watering input shape:', w.get_input_details()[0]['shape'])

h = tf.lite.Interpreter(model_path='health_model_float32.tflite')
h.allocate_tensors()
print('health input shape:', h.get_input_details()[0]['shape'])
PY
```

## ESP32 nutrient threshold rules

`esp32_nutrient_rules.h` provides deterministic checks:

- Nitrogen: low `< 40`, high `> 120`
- Phosphorus: low `< 10`, high `> 40`
- Potassium: low `< 50`, high `> 200`

This is intended to complement ML predictions with explicit nutrient guardrails.