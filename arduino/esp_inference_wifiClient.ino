#include <Arduino.h>
#include <Wire.h>
#include <BH1750.h>
#include "DHT.h"
#include <ArduTFLite.h>
#include "model.h"
#include "water_model.h"
#include <ArduinoMqttClient.h>
#include <WiFi.h>
#include <ThingsBoard.h>
#include <ArduinoJson.h>


// --- WiFi & ThingsBoard Config ---
constexpr char WIFI_SSID[] = "MacBook-IoT";
constexpr char WIFI_PASSWORD[] = "123456789";
constexpr char TOKEN[] = "RMIVgVqYmSuYuFdMu4e9"; 
constexpr char THINGSBOARD_SERVER[] = "192.168.2.1"; 
constexpr uint16_t THINGSBOARD_PORT = 1883U;
constexpr uint32_t MAX_MESSAGE_SIZE = 1024U;


WiFiClient wifiClient;
ArduinoMqttClient mqttClient(wifiClient);
ThingsBoard tb(mqttClient, MAX_MESSAGE_SIZE);

uint32_t previousDataSend;
constexpr int16_t telemetrySendInterval = 3000U;


// ---------------------------------------
constexpr int kTensorArenaSize = 40 * 1024; 
alignas(16) uint8_t tensor_arena[kTensorArenaSize];

float health_inputs[7] = {0};
float water_inputs[3] = {0};

float health_mean[7] = {
  25.02427, 23.96523, 54.88383, 613.5076, 30.42639, 30.10565, 30.28823
};

float health_std[7] = {
  8.78387, 3.37165, 8.69613, 229.9505, 11.45336, 11.32184, 11.65951
};
float water_mean[3] = {45.30334, 24.29059, 58.38547};
float water_std[3]  = {26.04671, 6.76081, 30.07911};

int health, water;
// ================= Labels =================

const char* health_labels[4] = { "Healthy","High Stress","Moderate Stress", "9e126d84-8942-409b-b8f1-061d0a090ad9"};
const char* water_labels[2] = {"No Water","Needs Water"};

// ***-------- Sensor Configs --------***
#define MODBUS Serial2
// ---------- BH1750 (I2C) ------
BH1750 lightMeter;
// ---------- SoilMoisture (Analog) ------
#define SMOIST 34
// ---------- DHT (One-Wire) ------
#define DHTPIN 23    
#define DHTTYPE DHT22
DHT dht(DHTPIN, DHTTYPE);
// ---------- NPK (RS485) ----------
#define RE 4
#define TXD2 16
#define RXD2 17
// --------- Relay (Digital) -------
#define BULB 13
#define PUMP 14
// ------------------------------------------------

// Modbus request: Read NPK
const byte code[] = {0x01, 0x03, 0x00, 0x1E, 0x00, 0x03, 0x65, 0xCD};
byte values[11];

// ---------- Soil Moisture ----------
float humidity, temperature, lux;
int soil_moisture;
int nitrogen;
int phosphorous;
int potassium;


void InitWiFi() {
  Serial.println("Connecting to WiFi...");
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nConnected to WiFi");
}

//  ----------------------------- DHT FUNCTIONS ------------------------------





void readTempHum(){
  float h = dht.readHumidity();
  float t = dht.readTemperature();
  
  if (isnan(h) || isnan(t)) {
    Serial.println(F("Failed to read from DHT sensor!"));
    return;
  }


  Serial.print(F("Humidity: "));
  Serial.print(h);
  Serial.print(F("%  Temperature: "));
  Serial.print(t);
  Serial.print(F("°C "));
 
  humidity = h;
  temperature = t;
  delay(500);
}

void readLightInt(){
  lux = lightMeter.readLightLevel();
  Serial.print("Light: ");
  Serial.print(lux);
  Serial.println(" lx");
  delay(500);

}

void readSoilM(){
  soil_moisture = analogRead(SMOIST);
  Serial.println("Soil Moisture Index: " + String(soil_moisture));
  delay(500);
}



void readNPK(){
  digitalWrite(RE, HIGH);     
  MODBUS.write(code, sizeof(code));
  MODBUS.flush();
  digitalWrite(RE, LOW);      
  delay(50);                  

  int index = 0;
  unsigned long start = millis();
  while (index < 11 && (millis() - start) < 1000) {
    if (MODBUS.available()) {
      values[index++] = MODBUS.read();
    } else {
      delay(2);
    }
  }
  nitrogen     = (values[3] << 8) | values[4];
  phosphorous  = (values[5] << 8) | values[6];
  potassium    = (values[7] << 8) | values[8];

  Serial.print("Nitrogen: "); Serial.print(nitrogen); Serial.println(" mg/kg");
  Serial.print("Phosphorous: "); Serial.print(phosphorous); Serial.println(" mg/kg");
  Serial.print("Potassium: "); Serial.print(potassium); Serial.println(" mg/kg");
  Serial.println();
}

void inferData(){
  
  Serial.println("Initializing Health Classification Model");
  modelInit(model_health, tensor_arena, kTensorArenaSize);

  for (int i = 0; i < 7; i++) {
    float scaled = (health_inputs[i] - health_mean[i]) / health_std[i];
    modelSetInput(scaled, i);
  }
  if (!modelRunInference()) {
    Serial.println("Inference failed");
  }
  float probs[3];
  for (int i = 0; i < 3; i++) {
    probs[i] = modelGetOutput(i);
  }
  int pred = 0;
  for (int i = 1; i < 3; i++) {
    if (probs[i] > probs[pred]) pred = i;
  }


  Serial.print("Predicted Health: ");
  Serial.print(health_labels[pred]);
  health = pred;

  Serial.println("Initializing Water Criteria Classification");
  modelInit(model_watering, tensor_arena, kTensorArenaSize);

  for (int i = 0; i < 3; i++) {
    float norm = (water_inputs[i] - water_mean[i]) / water_std[i];
    modelSetInput(norm, i);
  }

  modelRunInference();

  float prob = modelGetOutput(0);      // binary classification output
  pred = prob > 0.5;

  Serial.print("Predicted Watering: ");
  Serial.print(water_labels[pred]);
  water = pred;

}

void addInputs(){

  health_inputs[0] = soil_moisture;
  health_inputs[1] = temperature;
  health_inputs[2] = humidity;
  health_inputs[3] = lux*10;
  health_inputs[4] = nitrogen;
  health_inputs[5] = phosphorous;
  health_inputs[6] = potassium;

  water_inputs[0] = soil_moisture;
  water_inputs[1] = temperature;
  water_inputs[2] = humidity;
}
void setup() {
  Serial.begin(115200);

  delay(1000);
  
  Serial.println("Initializing NPK Sensor");
  MODBUS.begin(9600, SERIAL_8N1, RXD2, TXD2);
  pinMode(RE, OUTPUT);
  digitalWrite(RE, LOW); // default to receive
  Serial.println("NPK Sensor Successfully Configured");

  delay(100);

  Serial.println("Initializing DHT Sensor...");
  delay(500);
  dht.begin();
  Serial.println("DHT Sensor Initialized");

  delay(100);

  Serial.println("Initializing BH1750 Sensor...");
  delay(500);
  Wire.begin();
  lightMeter.begin();
  Serial.println("BH1750 Sensor Initialized");
  
  delay(100);

  pinMode(BULB, OUTPUT);
  pinMode(PUMP, OUTPUT);
  pinMode(SMOIST, INPUT);


  Serial.println("Setup Complete!");
  delay(100);
  tb.setBufferSize(512, 512);
  delay(1000);
  InitWiFi();
}

void loop() {
  

  if (WiFi.status() != WL_CONNECTED) {
    InitWiFi();
  }

  if (!tb.connected()) {
    Serial.print("Connecting to ThingsBoard...");
    if (!tb.connect(THINGSBOARD_SERVER, TOKEN, THINGSBOARD_PORT)) {
      Serial.println("Failed to connect");
      delay(3000);
      return;
    }
  }

  Serial.print("Collecting Data");
  for(int _=0;_<3;_++){
    Serial.print(".");
    delay(200);
  }
  Serial.println("Reading NPK Sensor");
  readNPK();
  readTempHum();
  readLightInt();
  readSoilM();

  addInputs();
  inferData();

  Serial.println("Constructing JSON payload...");

  // 1. Allocate a JSON document
  StaticJsonDocument<512> doc;

  // 2. Populate the JSON document with your data
  doc["plant_id"] = 1; // Replace with your actual UUID
  doc["soil_moisture"] = (soil_moisture / 4095.0) * 100.0;
  doc["temperature"] = temperature;
  doc["humidity"] = humidity;
  doc["light_intensity"] = lux;
  doc["nitrogen"] = nitrogen;
  doc["phosphorus"] = phosphorous;
  doc["potassium"] = potassium;
  doc["watering_needed"] = (water == 1) ? true : false;
  doc["health_status"] = health_labels[health];

  // 3. Calculate the memory size of the JSON payload
  size_t jsonSize = measureJson(doc);

  // Optional: You can still serialize it to Serial just to view it on your monitor
  Serial.println("Sending data to ThingsBoard:");
  serializeJson(doc, Serial); 
  Serial.println(); // Add a newline after the JSON print

  // 4. Send the JsonDocument directly, along with its calculated size
  tb.sendTelemetryJson(doc, jsonSize);

  tb.loop();

  delay(3000);
}