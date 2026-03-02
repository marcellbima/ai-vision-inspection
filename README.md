# 🔍 AI Vision Inspection System

> Realtime PCB defect detection using deep learning with GO/NG indicator

![Python](https://img.shields.io/badge/Python-3.10-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.111-green)
![React](https://img.shields.io/badge/React-18-cyan)
![PyTorch](https://img.shields.io/badge/PyTorch-2.3-red)
![Docker](https://img.shields.io/badge/Docker-Compose-blue)
![CI/CD](https://img.shields.io/badge/CI%2FCD-GitHub_Actions-black)
![Domain](https://img.shields.io/badge/Production-app.mtechlabs.cloud-brightgreen)

**Live Demo:** https://app.mtechlabs.cloud

---

## 📋 Overview

AI Vision Inspection System is a production-ready web application for automated PCB (Printed Circuit Board) defect detection. Using MobileNetV2 deep learning model, the system analyzes video streams in real-time and displays GO ✅ / NG ❌ indicators for quality control operators.

---

## 🏗️ Architecture
```
Browser (Webcam/Video)
        ↓ WebSocket (wss://)
Cloudflare Tunnel (HTTPS)
        ↓
Ubuntu Server (Proxmox VM)
        ↓
Docker Compose
├── AI Service     → MobileNetV2 + OpenCV (port 8001)
├── Backend API    → FastAPI + PostgreSQL (port 8000)  
├── Frontend       → React + Vite + Tailwind (port 80)
├── Database       → PostgreSQL 15
└── Nginx          → Reverse Proxy + WebSocket
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| AI/ML | PyTorch 2.3, OpenCV, MobileNetV2 |
| Backend | FastAPI, SQLAlchemy, PostgreSQL, JWT |
| Frontend | React 18, Vite, Tailwind CSS v4 |
| DevOps | Docker, Docker Compose, GitHub Actions |
| Infrastructure | Proxmox, Ubuntu Server 24.04 |
| Networking | Cloudflare Tunnel, Custom Domain |

---

## ✨ Features

- 🎥 **Realtime Video Inspection** — Webcam & video file support
- 🤖 **AI Defect Detection** — MobileNetV2 transfer learning
- 🟢🔴 **GO/NG Indicator** — Instant visual feedback via WebSocket
- 📊 **Inspection Counter** — Track GO/NG statistics per session
- 🔐 **JWT Authentication** — Role-based access (Admin, Supervisor, Operator)
- 📜 **History Tracking** — Full audit trail
- 🚀 **CI/CD Pipeline** — Auto-deploy on push via GitHub Actions
- 🌐 **Custom Domain** — HTTPS via Cloudflare Tunnel

---

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 20+

### Setup
```bash
# Clone repository
git clone https://github.com/marcellbima/ai-vision-inspection.git
cd ai-vision-inspection

# Setup environment
cp .env.example .env
nano .env  # Fill in DB_PASSWORD and SECRET_KEY

# Run
docker compose up -d

# Create admin user
curl -X POST http://localhost/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","username":"admin","password":"password","role":"admin"}'
```

Open: `http://localhost`

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login & get JWT |
| GET | `/api/auth/me` | Current user |
| POST | `/api/inspections/predict` | Image inspection |
| GET | `/api/inspections/history` | Inspection history |
| WS | `/ws/inspect` | Realtime video inspection |

API Docs: `https://app.mtechlabs.cloud/api/docs`

---

## 🤖 AI Model

- **Architecture:** MobileNetV2 (Transfer Learning)
- **Dataset:** PCB Defect Detection (Kaggle)
- **Classes:** `defect` / `no_defect`
- **Input:** 128x128 RGB images
- **Defect Types:** Short, Open Circuit, Missing Hole, Mouse Bite, Spur, Spurious Copper

---

## ⚙️ CI/CD Pipeline
```
Push to main branch
        ↓
GitHub Actions (self-hosted runner)
        ↓
docker compose build + up
        ↓
Health check /api/health
        ↓
Production live ✅
```

---

## 🔐 Security

- JWT tokens with expiry
- Bcrypt password hashing
- Role-based access control (RBAC)
- UFW firewall (ports 22, 80, 443 only)
- Fail2ban SSH protection
- Cloudflare DDoS protection
- No credentials in repository

---

## 👤 Author

**Marcell Bima**
- GitHub: [@marcellbima](https://github.com/marcellbima)
- Production: [app.mtechlabs.cloud](https://app.mtechlabs.cloud)
