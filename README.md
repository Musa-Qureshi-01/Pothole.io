#  Pothole Segmentation & Detection Platform

> **AI-Powered Civic Infrastructure Reporting System**
> 
> A comprehensive web application that enables citizens to report potholes, track repairs, and engage with a community of civic workers using advanced AI detection and intelligent assistance.
## [Preview](https://pothole-io.vercel.app/)
---

## Overview

## ✨ Overview
>>>>>>> 0af658f2d49595070303d6c393337b00419be0fb

**Pothole Segmentation** is a full-stack civic tech platform that combines:
- **AI Computer Vision** - YOLO v8 for automatic pothole detection
- **Smart Reporting** - Google Gemini API for intelligent analysis
- **24/7 AI Assistant** - Conversational chatbot for user guidance
- **Role-Based Access** - Three-tier user system (citizen/worker/admin)
- **Real-Time Dashboard** - Leaderboard, task management, and analytics
- **NeonDB Backend** - PostgreSQL with Data API
- **Clerk Authentication** - Production-ready auth service

**Perfect for:** City governments, municipal departments, and civic engagement platforms.

---

## Key Features

### For Citizens
- **Easy Reporting** - Submit pothole photos with AI-powered severity assessment
- **Track Status** - Follow your reported potholes from submission to repair
- **Leaderboard** - Earn points and rank in your city's contribution list
- **AI Assistant** - 24/7 chatbot for reporting help and app guidance
- **Profile** - View your submission stats and impact metrics

### For Workers
- **Task Management** - Receive and manage repair assignments
- **Progress Tracking** - Update status and upload proof photos
- **Priority Queue** - Focus on critical potholes first
- **Team Coordination** - See what others are working on

### For Administrators
- **Dashboard Analytics** - View trends, completion rates, and impact metrics
- **User Management** - Manage roles and permissions
- **Task Assignment** - Distribute work to field teams efficiently
- **Report Review** - Validate submissions and manage duplicates

---

## Technology Stack

### Frontend
- **React 19** - Modern UI framework with TypeScript
- **Tailwind CSS** - Utility-first styling
- **Vite** - Lightning-fast build tool
- **React Router** - Client-side navigation
- **Framer Motion** - Smooth animations and transitions
- **Clerk** - Production-ready authentication
- **Neon Data API** - PostgreSQL database integration
- **Axios** - HTTP client for API calls

### Backend
- **FastAPI** - Modern Python web framework
- **ONNX Runtime** - YOLOv8 model inference (14.7MB)
- **NeonDB** - PostgreSQL database
- **Google Gemini 1.5 Flash** - AI report generation & chatbot

### Infrastructure
- **NeonDB** - PostgreSQL database with Data API
- **Clerk** - Authentication service
- **Google Cloud** - Gemini API
- **Uvicorn** - ASGI server

---

## Implementation Status

| Feature | Status | Details |
|---------|--------|---------|
| Public Landing Page | Complete | Homepage accessible without login |
| Authentication | Complete | Email/password with session persistence |
| Role-Based Access | Complete | 3 roles: citizen, worker, admin |
| User Profiles | Complete | Real-time data from database |
| AI Chatbot | Complete | Gemini-powered 24/7 assistant |
| Report Generation | Complete | AI-powered analysis & summarization |
| Leaderboard | Complete | Real-time rankings & scoring |
| Dark Mode | Complete | System-wide theme support |

---

## Architecture

```
Pothole-Segmentation/
├── frontend/                 # React + Vite web app
│   ├── src/
│   │   ├── pages/           # Route pages
│   │   ├── components/      # Reusable components
│   │   ├── context/         # Auth & state management
│   │   ├── lib/             # Gemini API, Neon Data API client
│   │   └── types/           # TypeScript definitions
│   └── index.html
│
├── backend/                  # FastAPI + ONNX
│   ├── app/
│   │   ├── api/             # API endpoints
│   │   ├── core/            # AI model inference
│   │   └── main.py
│   ├── models/              # YOLO v8 (best.onnx)
│   └── neon_schema.sql      # NeonDB database schema
│
├── docs/                     # Detailed documentation
│   ├── MIGRATION_SUMMARY.md  # Supabase to NeonDB migration
│   ├── QUICKSTART.md        # Testing & deployment guide
│   ├── IMPLEMENTATION_COMPLETE.md
│   └── DATABASE_SCHEMA.md
│
├── env.example              # Environment variable template
└── README.md               # This file
```

---

## Quick Start

### Prerequisites
- Python 3.9+ and Node.js 18+
- NeonDB project with database initialized
- Clerk account and application
- Google Gemini API key

### Setup (3 minutes)

**1. Clone & Install**
```bash
git clone <repo>
cd Pothole-Segmentation

# Backend
cd backend
pip install -r requirements.txt

# Frontend
cd ../frontend
npm install
```

**2. Configure Environment**

Create `frontend/.env.local`:
```env
VITE_CLERK_PUBLISHABLE_KEY=
VITE_NEON_API_URL=
VITE_GEMINI_API_KEY=
VITE_API_URL=
```

Create `backend/.env`:
```env
DATABASE_URL=
CORS_ORIGINS=http://localhost:xxxx,http://localhost:xxxx
```

**3. Run Servers**

```bash
# Terminal 1: Backend
cd backend
python app/main.py
# Running on http://127.0.0.1:8000

# Terminal 2: Frontend
cd frontend
npm run dev
# Running on http://localhost:5174
```

**4. Test It**
- Visit `http://localhost:5174`
- Sign up with email/password
- Submit reports, chat with AI, view leaderboard
- Login with different roles to test access control

**[View Full Quick Start Guide](docs/QUICKSTART.md)**

---

## Database Schema

**5 Core Tables:**

| Table | Purpose | Records |
|-------|---------|---------|
| `users` | User profiles with roles | Citizen/Worker/Admin |
| `reports` | Pothole submissions | Location, severity, status |
| `leaderboard` | User rankings | Points, reputation |
| `chat_messages` | Conversation history | User-bot interactions |
| `tasks` | Worker assignments | Repair jobs, deadlines |

**Storage:**
- Image storage to be implemented (Cloudflare R2 recommended)

**[View Full Database Schema](docs/DATABASE_SCHEMA.md)**

---

## Usage Examples

### Sign Up & Create Account
```bash
1. Click "Sign Up"
2. Enter name, email, password
3. Auto-assigned as "citizen" role
4. Confirm via email (disabled by default to avoid rate limits)
```

### Submit a Pothole Report
```bash
1. Go to "Report" page
2. Upload photo or take screenshot
3. Add description and severity
4. AI generates summary and risk analysis
5. Report saved with location
6. Points awarded to leaderboard
```

### Chat with AI Assistant
```bash
1. Click chat button (bottom-right)
2. Ask about reporting, tracking, or app features
3. Conversation saved to database
4. History loads on next chat
```

### Role-Based Access
```bash
Citizen:     Can report, view leaderboard, chat with AI
Worker:      + Can accept and complete tasks
Admin:       + Can view dashboard, manage users, assign work
```

---

## Key Endpoints

### Frontend Routes
- `/` - Public homepage
- `/auth/login` - Login page
- `/auth/signup` - Registration
- `/prediction` - AI model testing
- `/report` - Submit reports
- `/leaderboard` - Rankings
- `/profile` - User dashboard
- `/admin` - Admin panel (admin only)
- `/worker` - Task dashboard (worker only)

### Backend API (FastAPI)
```
GET  /                    # Health check
GET  /docs                # API documentation
POST /api/predict         # Run AI model
POST /api/reports         # Create report
GET  /api/reports/{id}    # Get report details
GET  /api/leaderboard     # Get rankings
```

---

## Security

**Authentication**
- Clerk Authentication (email/password, social logins)
- JWT session tokens
- Auto-logout on token expiration

**Authorization**
- Role-based access control (RBAC)
- Database-backed role validation
- Protected routes with proper redirects

**Database Security**
- PostgreSQL with secure connections
- User can only access own data
- Admins can manage all data

**API Security**
- CORS configured
- Secure environment variables
- Clerk's built-in security features

---

## Performance

- **Vite** - Sub-second hot module replacement
- **ONNX Model** - 14.7MB lightweight inference
- **Neon Data API** - Fast PostgreSQL queries
- **Bundle** - Optimized production build (~500KB gzip)

---

## Deployment

### Frontend (Vercel/Netlify)
```bash
npm run build
# Deploy dist/ folder
```

### Backend (Railway/Render)
```bash
pip install -r requirements.txt
gunicorn app.main:app --workers 4
```

### Database (NeonDB)
- Fully managed PostgreSQL
- Auto-scaling, backups, point-in-time recovery
- Data API for serverless access

---

## Documentation

- **[Migration Summary](docs/MIGRATION_SUMMARY.md)** - Supabase to NeonDB migration guide
- **[Quick Start Guide](docs/QUICKSTART.md)** - How to test and deploy
- **[Database Schema](docs/DATABASE_SCHEMA.md)** - Tables, relationships
- **[Implementation Details](docs/IMPLEMENTATION_COMPLETE.md)** - Feature breakdown

---

## Contributing

Contributions are welcome! Areas for enhancement:

- [ ] Advanced map integration (Google Maps, Mapbox)
- [ ] Photo upload from camera roll
- [ ] Push notifications for report updates
- [ ] Offline mode with sync
- [ ] Analytics dashboard improvements
- [ ] Mobile app (React Native)
- [ ] Multi-language support

---

## License

This project is open source and available under the MIT License.

---

## Support

**Found an issue?**
1. Check [docs/MIGRATION_SUMMARY.md](docs/MIGRATION_SUMMARY.md) for migration details
2. Verify environment variables (Clerk key, Neon API URL)
3. Check browser console for errors
4. Review NeonDB dashboard for data issues

**Need help deploying?**
- Follow deployment sections in Quick Start guide
- Ensure all environment variables are set
- Test locally first before deploying

---

## Project Goals

This platform demonstrates:
- Full-stack AI/ML integration
- Real-time database with React
- Role-based security patterns
- Scalable cloud architecture
- Professional UI/UX practices
- Production-ready code quality

---
<h2>👤 Author</h2>

<div align="center">

<div style="
  max-width:650px;
  padding:40px 30px;
  border-radius:16px;
  background:linear-gradient(135deg,#0f172a,#1e293b);
  color:white;
  box-shadow:0 10px 30px rgba(0,0,0,0.25);
">

<h2 style="margin:0;">Musa Qureshi</h2>

<p style="margin:8px 0 16px 0; font-size:14px; opacity:0.9;">
Agentic AI Developer • ML Engineer • SaaS Builder
</p>

<p style="font-size:14px; opacity:0.8;">
Building AI agents, automation systems, and scalable web apps that solve real-world problems.
</p>

<br/>

<a href="https://www.linkedin.com/in/musa-qureshi">
  <img src="https://img.shields.io/badge/LinkedIn-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white"/>
</a>

<a href="https://x.com/musa_qureshi_01">
  <img src="https://img.shields.io/badge/X-000000?style=for-the-badge&logo=x&logoColor=white"/>
</a>

<a href="https://peerlist.io/musa-qureshi">
  <img src="https://img.shields.io/badge/Peerlist-00AA45?style=for-the-badge&logo=peerlist&logoColor=white"/>
</a>

</div>

</div>

---

<div align="center">

**Made with care for civic infrastructure**

</div>
