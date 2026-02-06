# Pothole Segmentation & Reporting System

An advanced AI-powered urban infrastructure management tool that detects potholes using computer vision and facilitates automated reporting to municipal authorities.

![App Screenshot](../frontend/src/assets/logo.png)

## 🚀 Features

-   **Deep Learning Detection**: Real-time pothole segmentation using ONNX Runtime.
-   **Civic Reporting**: Automated report generation with geolocation and severity assessment.
-   **Smart Dashboard**: Analytics, leaderboard, and user contribution tracking.
-   **Indianized Context**: Tailored for Indian road infrastructure monitoring.
-   **Progressive Web App**: Fast, offline-capable, and optimized for mobile devices.
-   **Glassmorphic UI**: Modern, fluid, and animated interface.

## 🛠 Tech Stack

| Component | Technology |
| :--- | :--- |
| **Frontend** | React, Vite, TypeScript, Tailwind CSS, Framer Motion |
| **Backend** | UDP/FastAPI (for model serving), Supabase (Auth/DB) |
| **AI/ML** | ONNX Runtime, Custom Trained YOLO/UNet Model |
| **Database** | Supabase (PostgreSQL) |
| **Integration** | Google Gemini API (Report Summarization), Web3Forms |

## 🏁 Quick Start

### Prerequisites
-   Node.js v18+
-   Python 3.9+
-   Supabase Account

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/pothole-segmentation.git
cd pothole-segmentation
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv
# Windows
.\venv\Scripts\activate
# Linux/Mac
source venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --reload
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

## 📁 Project Structure

```
/
├── backend/            # Python FastAPI Model Server
│   ├── model/         # ONNX Models and Weights
│   └── app/           # API Endpoints
├── frontend/           # React Application
│   ├── src/
│   │   ├── components/ # Reusable UI Components
│   │   ├── context/    # State Management (Auth, Predictions)
│   │   ├── pages/      # Route Components
│   │   └── lib/        # Utilities (Gemini, Supabase)
├── docs/               # Documentation
└── README.md           # This file
```

## 🤝 Contributing

See [CONTRIBUTING.md](docs/CONTRIBUTING.md) for guidelines.

## 📄 License

MIT License.
