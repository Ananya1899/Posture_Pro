# 📐 Posture_Pro

A wearable and intelligent posture monitoring device that tracks spinal tilt using an **MPU6050** sensor and improves posture through **haptic vibration feedback**, with real-time angle monitoring over **WiFi** using the **ESP8266** microcontroller.

---

## 🚀 Project Overview

Modern lifestyles involve prolonged sitting and incorrect body posture, leading to spinal issues, fatigue, and long-term health risks.  
This project introduces a **soft, wearable, IoT-enabled posture correction patch** that:

- Learns the user's natural posture during a **10-second calibration**
- Continuously measures spine tilt using a **gyroscope & accelerometer**
- Provides vibration feedback based on posture deviation
- Sends **live posture angle data** over WiFi in JSON format for app/dashboard use

This allows users to **self-correct** without external reminders — making posture improvement intuitive and effortless.

---

## ✨ Features

| Feature | Description |
|--------|------------|
| 🧠 Smart Calibration | Automatically sets origin posture during startup |
| 📏 Angle-Based Feedback Zones | Vibrations change intensity based on tilt angle |
| 🌐 Built-In Web Server | Access live posture data via HTTP endpoint |
| 📶 WiFi Connectivity | Compatible with dashboards, mobile apps & IoT platforms |
| 🔄 Dual Vibration Motors | Ensures strong and balanced feedback |
| 🧵 Wearable Patch Design | Soft, comfortable, and skin-friendly |

---

## 🛠️ Hardware Used

- **ESP8266 NodeMCU / D1 Mini**
- **MPU6050** 6-axis gyro + accelerometer
- **2 Vibration Motors** (one with resistor, one direct)
- **USB/3.7V Li-ion battery**
- **Jumper wires / patch housing**

---

## 🔌 Circuit Connections

### MPU6050 → ESP8266

| MPU6050 | ESP8266 |
|---------|--------|
| VCC | 3.3V |
| GND | GND |
| SDA | D2 |
| SCL | D1 |
| AD0 | GND |

### Motors → ESP8266

| Motor | ESP8266 Pin | GND |
|-------|-------------|-----|
| Motor 1 (no resistor) | D5 | ✔️ |
| Motor 2 (with resistor) | D6 | ✔️ |

⚠️ All grounds must be common.

---

## 🎯 Posture Feedback Logic

| Tilt Angle (°) | Zone | Vibration Intensity |
|----------------|------|-------------------|
| ≤ 20° | Perfect posture | OFF |
| 20°–30° | Slight bend | LOW |
| 30°–40° | Noticeable bend | MEDIUM |
| 40°–45° | Poor posture | HIGH |
| 45°–50° | Very poor | STRONG |
| > 50° | Harmful posture | MAXIMUM alert |

---

## 🧪 How to Use

1. Power the patch and keep your back straight for **10 seconds**  
2. Calibration establishes your personal baseline posture  
3. Real-time monitoring begins automatically  
4. Vibrations alert you when posture deviates beyond safe angles  
5. Access live angle data via browser using ESP IP:


---

## 📌 Applications

- Students and office workers
- Physiotherapy and rehabilitation clinics
- Wearable assistive devices
- Workplace ergonomics
- Sports posture alignment

---

## 🏅 Highlights

✔️ IoT + Wearable + Embedded System  
✔️ Fully responsive haptic feedback  
✔️ Real-time spine angle visualization  
✔️ Portable and battery-friendly design  
✔️ Competition-ready innovation  

---

> *"Good posture is not a habit you force — it’s a habit you feel."*  












