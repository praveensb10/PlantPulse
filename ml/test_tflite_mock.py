from pathlib import Path
import json
import numpy as np
import tensorflow as tf

BASE_DIR = Path(__file__).resolve().parent
WATERING_TFLITE = BASE_DIR / "watering_model_float32.tflite"
HEALTH_TFLITE = BASE_DIR / "health_model_float32.tflite"
NOTEBOOK_METADATA_PATH = BASE_DIR / "notebook_tflite_metadata.json"
ESP32_METADATA_PATH = BASE_DIR / "esp32_model_metadata.json"


def load_metadata():
    if NOTEBOOK_METADATA_PATH.exists():
        return json.loads(NOTEBOOK_METADATA_PATH.read_text(encoding="utf-8"))
    if ESP32_METADATA_PATH.exists():
        return json.loads(ESP32_METADATA_PATH.read_text(encoding="utf-8"))
    return {}


def run_tflite(interpreter: tf.lite.Interpreter, x_float: np.ndarray):
    input_details = interpreter.get_input_details()[0]
    output_details = interpreter.get_output_details()[0]
    interpreter.set_tensor(input_details["index"], x_float.astype(np.float32))
    interpreter.invoke()
    return interpreter.get_tensor(output_details["index"]).astype(np.float32)


def main():
    metadata = load_metadata()

    watering_interpreter = tf.lite.Interpreter(model_path=str(WATERING_TFLITE))
    health_interpreter = tf.lite.Interpreter(model_path=str(HEALTH_TFLITE))
    watering_interpreter.allocate_tensors()
    health_interpreter.allocate_tensors()

    w_input_dim = int(watering_interpreter.get_input_details()[0]["shape"][1])
    h_input_dim = int(health_interpreter.get_input_details()[0]["shape"][1])

    watering_meta = metadata.get("watering", metadata.get("watering_model", {}))
    health_meta = metadata.get("health", metadata.get("health_model", {}))

    watering_features_meta = watering_meta.get(
        "input_features",
        watering_meta.get("features", ["SoilMoisture", "Temperature", "Humidity"]),
    )
    health_features_meta = health_meta.get(
        "input_features",
        health_meta.get(
            "features",
            [
                "SoilMoisture",
                "Temperature",
                "Humidity",
                "LightIntensity",
                "Nitrogen",
                "Phosphorus",
                "Potassium",
            ],
        ),
    )

    default_watering_order = ["SoilMoisture", "Temperature", "Humidity"]
    default_health_order = [
        "SoilMoisture",
        "Temperature",
        "Humidity",
        "LightIntensity",
        "Nitrogen",
        "Phosphorus",
        "Potassium",
    ]

    if len(watering_features_meta) == w_input_dim:
        watering_features = watering_features_meta
    else:
        watering_features = default_watering_order[:w_input_dim]

    if len(health_features_meta) == h_input_dim:
        health_features = health_features_meta
    else:
        health_features = default_health_order[:h_input_dim]

    # Mock samples (dictionary form, then mapped to model feature order)
    samples = [
        {
            "name": "Dry + Low nutrients",
            "values": {
                "SoilMoisture": 18.0,
                "Temperature": 31.0,
                "Humidity": 42.0,
                "LightIntensity": 72.0,
                "Nitrogen": 28.0,
                "Phosphorus": 8.0,
                "Potassium": 40.0,
            },
        },
        {
            "name": "Balanced conditions",
            "values": {
                "SoilMoisture": 58.0,
                "Temperature": 24.0,
                "Humidity": 65.0,
                "LightIntensity": 60.0,
                "Nitrogen": 85.0,
                "Phosphorus": 25.0,
                "Potassium": 120.0,
            },
        },
    ]

    health_output = health_meta.get("output", None)
    health_classes = health_meta.get("classes", None)

    print("\n=== TFLite Mock Inference ===")
    for sample in samples:
        values = sample["values"]
        w_in = np.array([[values[feat] for feat in watering_features]], dtype=np.float32)
        h_in = np.array([[values[feat] for feat in health_features]], dtype=np.float32)

        w_out = run_tflite(watering_interpreter, w_in).reshape(-1)
        h_out = run_tflite(health_interpreter, h_in).reshape(-1)

        water_prob = float(w_out[0])
        needs_water = 1 if water_prob >= 0.5 else 0

        health_idx = int(np.argmax(h_out))
        if isinstance(health_classes, list) and health_idx < len(health_classes):
            health_label = health_classes[health_idx]
        elif isinstance(health_output, dict):
            health_label = health_output.get(str(health_idx), f"Class {health_idx}")
        else:
            health_label = f"Class {health_idx}"

        print(f"\nSample: {sample['name']}")
        print(f"  Watering features: {watering_features}")
        print(f"  Watering input   : {w_in.flatten().tolist()}")
        print(f"  Health features  : {health_features}")
        print(f"  Health input     : {h_in.flatten().tolist()}")
        print(f"  Water prob    : {water_prob:.4f}")
        print(f"  Needs water   : {needs_water}")
        print(f"  Health logits : {np.round(h_out, 4).tolist()}")
        print(f"  Health class  : {health_label}")


if __name__ == "__main__":
    main()
