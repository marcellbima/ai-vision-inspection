# 🔍 AI Vision Inspection System

An automated visual inspection system using deep learning to detect product defects in manufacturing environments.

![Python](https://img.shields.io/badge/Python-3.10-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.111-green)
![React](https://img.shields.io/badge/React-18-cyan)
![PyTorch](https://img.shields.io/badge/PyTorch-2.3-red)
![Docker](https://img.shields.io/badge/Docker-Compose-blue)
![CI/CD](https://img.shields.io/badge/CI/CD-GitHub_Actions-black)

---

## 📋 Overview

AI Vision Inspection System is a production-ready web application that uses computer vision and deep learning (ResNet18 + PyTorch) to automatically detect defects in product images. Built for Quality Control operators in manufacturing environments.

---

## 🏗️ Architecture
```
Proxmox VM (Ubuntu Server)
└── Docker Compose
    ├── AI Service     → PyTorch + OpenCV (port 8001)
    ├── Backend API    → FastAPI + PostgreSQL (port 8000)
    ├── Frontend       → React + Vite + Tailwind (port 80)
    ├── Database       → PostgreSQL 15
    └── Nginx          → Reverse Proxy (port 80/443)
```

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| AI/ML | PyTorch 2.3, OpenCV 4.9, ResNet18 |
| Backend | FastAPI, SQLAlchemy, PostgreSQL, JWT |
| Frontend | React 18, Vite, Tailwind CSS, Axios |
| DevOps | Docker, Docker Compose, GitHub Actions |
| Security | UFW, Fail2ban, JWT, RBAC, HTTPS |
| Infrastructure | Proxmox, Ubuntu Server 24.04 |

---

## ✨ Features

- 🤖 **AI Defect Detection** — ResNet18 CNN with transfer learning
- 🔐 **JWT Authentication** — Role-based access (Admin, Supervisor, Operator)
- 📊 **Inspection Dashboard** — Upload images and get real-time results
- 📜 **History Tracking** — Full audit trail of all inspections
- 🚀 **CI/CD Pipeline** — Auto-deploy on push via GitHub Actions
- 🛡️ **Production Security** — UFW firewall, Fail2ban, encrypted passwords

---

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Python 3.10+
- Node.js 20+

### Setup
```bash
# Clone repository
git clone https://github.com/marcellbima/ai-vision-inspection.git
cd ai-vision-inspection

# Setup environment
cp .env.example .env
# Edit .env with your values

# Run all services
docker compose up -d

# Check status
docker compose ps
```

API available at: `http://localhost/api/health`
Frontend at: `http://localhost`

---

## 📁 Project Structure
```
ai-vision-inspection/
├── ai-service/          # PyTorch inference service
│   ├── main.py
│   ├── utils/
│   │   ├── predictor.py
│   │   └── preprocessor.py
│   └── scripts/
│       ├── train.py
│       └── evaluate.py
├── backend/             # FastAPI backend
│   └── app/
│       ├── api/         # Auth, Users, Inspections
│       ├── core/        # Config, Security
│       ├── db/          # Models, Database
│       └── schemas/     # Pydantic schemas
├── frontend/            # React dashboard
│   └── src/
│       ├── pages/       # Login, Dashboard, History
│       ├── hooks/       # useAuth
│       └── services/    # API client
├── nginx/               # Reverse proxy config
├── .github/workflows/   # CI/CD pipeline
├── docker-compose.yml
└── .env.example
```

---

## 🔐 Security

- All secrets stored in environment variables
- No credentials committed to repository
- JWT tokens with expiry
- Role-based access control (RBAC)
- UFW firewall — only ports 22, 80, 443 open
- Fail2ban — SSH brute force protection
- Bcrypt password hashing

---

## 🤖 AI Model

- **Architecture:** ResNet18 (Transfer Learning)
- **Task:** Binary classification (defect / no_defect)
- **Input:** 224x224 RGB images
- **Output:** Class label + confidence score
- **Training:** ImageNet pretrained weights, fine-tuned on industrial dataset

### Training
```bash
# Prepare dataset structure
data/processed/
├── train/
│   ├── defect/
│   └── no_defect/
└── val/
    ├── defect/
    └── no_defect/

# Run training
docker compose run ai-service python scripts/train.py

# Evaluate
docker compose run ai-service python scripts/evaluate.py
```

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login & get JWT |
| GET | `/api/auth/me` | Current user |
| POST | `/api/inspections/predict` | Upload & predict |
| GET | `/api/inspections/history` | Inspection history |
| GET | `/api/users/` | List users (admin) |

API Docs: `http://localhost/api/docs`

---

## ⚙️ CI/CD Pipeline
```
Push to main
     ↓
GitHub Actions (self-hosted runner)
     ↓
git pull → docker compose build → docker compose up
     ↓
Production live
```

---

## 📄 License

MIT License — feel free to use for learning and portfolio purposes.

---

## 👤 Author

**Marcell Bima**
- GitHub: [@marcellbima](https://github.com/marcellbima)
