#include <Wire.h>
#include <MPU6050.h>
#include <WiFi.h>
#include <WebServer.h>

MPU6050 mpu;
WebServer server(80);

const char* ssid = "Galaxy A15";
const char* pass = "herrymonta";

const int vibPin = 4;

float baseAngle = 0;
float virtualOrigin = 0;

void handleData() {
  int16_t ax, ay, az, gx, gy, gz;
  mpu.getMotion6(&ax, &ay, &az, &gx, &gy, &gz);

  float currentAngle = atan2(ay, az) * 180 / PI;
  float relativeAngle = currentAngle - virtualOrigin;

  String json = "{\"angle\":" + String(relativeAngle, 2) + "}";

  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.sendHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  server.sendHeader("Access-Control-Allow-Headers", "Content-Type");

  server.send(200, "application/json", json);
}

void handleOptions() {
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.sendHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  server.sendHeader("Access-Control-Allow-Headers", "Content-Type");
  server.send(204);
}

void setup() {
  Serial.begin(115200);
  Wire.begin();

  pinMode(vibPin, OUTPUT);
  digitalWrite(vibPin, LOW);

  // --- PWM FIX ---
  ledcAttachPin(vibPin, 0);     // Channel 0
  ledcSetup(0, 5000, 8);        // 5kHz, 8 bit

  mpu.initialize();
  if (!mpu.testConnection()) {
    Serial.println("MPU6050 Not Connected!");
    while (1);
  }

  WiFi.begin(ssid, pass);
  Serial.print("Connecting WiFi...");
  while (WiFi.status() != WL_CONNECTED) {
    delay(200);
    Serial.print(".");
  }
  Serial.println("\nConnected!");
  Serial.print("IP: ");
  Serial.println(WiFi.localIP());

  // Calibration
  float total = 0;
  for (int i = 0; i < 500; i++) {
    int16_t ax, ay, az, gx, gy, gz;
    mpu.getMotion6(&ax, &ay, &az, &gx, &gy, &gz);
    total += atan2(ay, az) * 180 / PI;
    delay(10);
  }

  baseAngle = total / 500.0;
  virtualOrigin = baseAngle;   // FIXED origin

  server.on("/data", HTTP_GET, handleData);
  server.on("/data", HTTP_OPTIONS, handleOptions);
  server.begin();

  Serial.println("Server started!");
}

void loop() {
  server.handleClient();

  int16_t ax, ay, az, gx, gy, gz;
  mpu.getMotion6(&ax, &ay, &az, &gx, &gy, &gz);

  float currentAngle = atan2(ay, az) * 180 / PI;
  float relativeAngle = currentAngle - virtualOrigin;
  float absAngle = abs(relativeAngle);

  int intensity = 0;
  if (absAngle <= 20) intensity = 0;
  else if (absAngle <= 30) intensity = 120;
  else if (absAngle <= 40) intensity = 160;
  else if (absAngle <= 45) intensity = 180;
  else if (absAngle <= 50) intensity = 200;
  else intensity = 255;

  ledcWrite(0, intensity);

  Serial.print("Angle: ");
  Serial.print(relativeAngle);
  Serial.print(" | Intensity: ");
  Serial.println(intensity);

  delay(200);
}
