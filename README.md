# 🚀 Atharva Gupta — AI-Powered Interactive Portfolio

<div align="center">

[![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?logo=python&logoColor=white)](https://python.org)
[![Groq](https://img.shields.io/badge/Groq-AI%20Streaming-F55036?logo=groq&logoColor=white)](https://groq.com)
[![Render](https://img.shields.io/badge/Render-Deploy%20Ready-46E3B7?logo=render&logoColor=white)](https://render.com)

**An intelligent, conversational personal portfolio featuring an interactive first-person AI persona, interactive WebGL fluid dynamics, and a sleek modern aesthetic.**

---

*Crafted with ❤️ by **[Shailendra Sahu](https://github.com/shailendrasahu393-cell)** for my friend **Atharva Gupta** (Aspiring Full-Stack Developer).*

---

</div>

## 🌟 Overview

This portfolio redefines personal websites by shifting from static, boring resumes to a **living, interactive conversational experience**. 

Instead of searching through dense text, visitors and recruiters can talk directly with **Atharva**. The integrated AI speaks in **first person as Atharva himself**, effortlessly answering questions about his background, B.Tech at Allenhouse, core technical stack, and flagship projects in both **English and natural Hinglish/Hindi**!

---

## ✨ Key Features

### 1. 🤖 First-Person AI Conversational Interface
- **Speaks as Atharva**: Speaks directly in first-person (*"Hey! Main Atharva hoon...", "I built...", "Main Allenhouse me B.Tech CSE kar raha hoon..."*) rather than a third-person bot.
- **Bilingual Fluency**: Seamlessly switches between friendly modern Hinglish/Hindi and clear, professional English based on what the user types.
- **Concise & Direct**: Gives crisp, to-the-point answers in 2–4 sentences without unprompted resume dumps.
- **Streaming Response**: Real-time token streaming using Server-Sent Events (SSE) via Groq API.
- **Intelligent Offline Fallback**: Features a rich bilingual local fallback engine if the API is offline or latency is high.

### 2. 🎨 Interactive Message & Card Styling
- **Interactive Tech Badges**: Technologies (**React.js**, **Python**, **Firebase**, **C++**, **DSA**, **Git**, **Render**) are automatically highlighted as colorful interactive pill badges.
- **Feature & Workflows Cards**: Structured points are rendered into clean micro-cards with blue accent dots and hover scale elevations.
- **One-Tap Quick Actions**: Contextually attaches action buttons at the bottom of replies:
  - ✉️ **Email Atharva** (`mailto:gatharva264@gmail.com`)
  - 📞 **WhatsApp / Call** (`https://wa.me/919453036904`)
  - 🐙 **GitHub Repository** (`https://github.com/gatharva264-eng`)
  - 💼 **LinkedIn Profile** (`https://linkedin.com/in/atharvagupta-`)
  - 📸 **Instagram Profile** (`https://instagram.com/exe.athrvv` / `@exe.athrvv`)
- **Smart Follow-Up Chips**: Suggests clickable prompt pills based on conversation context so visitors can continue asking questions effortlessly.

### 3. 🌊 Apple-Inspired Aesthetics & WebGL Background
- **Interactive Fluid Simulation**: Fullscreen WebGL fluid background that dynamically reacts to mouse movements and touch gestures.
- **Clean Typography**: Powered by Google Inter font with high-contrast text and crisp visual hierarchy.
- **Frosted Glass Cards**: Modern glassmorphism with backdrop filters and delicate borders.

### 4. 🍲 Flagship Project: Surplus Food Recovery Network
- A full-stack web application designed to eliminate food waste by connecting surplus food donors (restaurants, caterers, banquet halls, individuals), NGOs, and delivery volunteers.
- **Tech Stack**: React.js, JavaScript, Python, Firebase (Authentication & Realtime Database).
- **Workflows**: Role-based dashboards for food donation posting, NGO coordination, and real-time pickup status tracking.
- **GitHub**: [github.com/gatharva264-eng](https://github.com/gatharva264-eng)

---

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite 8, Tailwind CSS v4, Framer Motion, WebGL Fluid, Lucide Icons |
| **Backend** | FastAPI, Python 3.11, Uvicorn, Gunicorn, SSE Starlette |
| **AI / LLM** | Groq Cloud API (`qwen/qwen3.8-27b`), Streaming SSE |
| **Deployment** | Render.com (1-Click Blueprint with `render.yaml`), Docker ready |

---

## 📁 Project Architecture

```
portfolio/
├── render.yaml                   # 1-Click Render Blueprint configuration
├── RENDER_DEPLOYMENT.md          # Comprehensive deployment guide
├── README.md                     # Project documentation & showcase
├── .gitignore                    # Root gitignore (protects secrets & node_modules)
│
├── backend/                      # FastAPI Python Service
│   ├── app/
│   │   ├── main.py               # FastAPI app, CORS, routes & SSE endpoint
│   │   └── services/
│   │       ├── ai_service.py     # Groq client & first-person prompt engine
│   │       └── profile_import_service.py # Profile merger service
│   ├── data/
│   │   ├── profile.json          # Main verified profile data
│   │   └── linkedin_profile.json # LinkedIn supplemental data
│   ├── Dockerfile                # Production Docker container
│   ├── Procfile                  # Web process definition
│   ├── requirements.txt          # Python dependencies (FastAPI, Groq, Gunicorn)
│   └── .env.example              # Environment variables template
│
└── frontend/                     # React 19 + Vite Frontend
    ├── public/
    │   └── assets/avatar.png     # Atharva's profile avatar
    ├── src/
    │   ├── components/
    │   │   ├── AIChatInterface.jsx # Full-screen AI chat modal & starter chips
    │   │   └── RichChatMessage.jsx # Rich interactive message card with tech pills
    │   ├── sections/
    │   │   └── Hero.jsx          # Hero header, question input & 5 topic cards
    │   ├── services/
    │   │   └── api.js            # Normalized API client & bilingual fallback stream
    │   ├── utils/
    │   │   └── fluidSimulation.js# WebGL fluid physics simulation
    │   ├── data/profile.js       # Local profile fallback data
    │   ├── App.jsx               # Root single-page application
    │   ├── index.css             # Tailwind v4 theme & glassmorphic styles
    │   └── main.jsx              # App entry point
    ├── netlify.toml              # Netlify SPA redirect rules
    ├── vercel.json               # Vercel SPA rewrite rules
    └── vite.config.js            # Vite build & reverse proxy configuration
```

---

## 💻 Local Development Setup

### Prerequisites
- Node.js 18+ & npm
- Python 3.11+
- Free Groq API Key from [console.groq.com](https://console.groq.com)

### 1. Clone & Setup Backend
```bash
cd backend
python -m venv .venv

# On Windows:
.venv\Scripts\activate
# On Linux/macOS:
# source .venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
# Edit .env and paste your GROQ_API_KEY=gsk_...

# Start FastAPI server:
uvicorn app.main:app --port 8000 --reload
```
API will run at `http://127.0.0.1:8000`.

### 2. Setup Frontend
```bash
# In a new terminal:
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser!

---

## 🚀 1-Click Deployment on Render

This repository includes a pre-configured `render.yaml` blueprint.

1. Push your repository to GitHub.
2. Go to **[dashboard.render.com](https://dashboard.render.com)**.
3. Click **New +** > **Blueprint** and connect your repository.
4. Render will automatically detect `render.yaml` and configure:
   - `atharva-portfolio-api` (Python Web Service)
   - `atharva-portfolio-frontend` (Static Site with SPA rewrite)
5. Enter your `GROQ_API_KEY` when prompted and click **Apply**!

*(For manual setup or alternative hosting, see the complete [RENDER_DEPLOYMENT.md](RENDER_DEPLOYMENT.md) guide).*

---

## 🤝 About Atharva Gupta

- **Role**: Aspiring Full-Stack Developer
- **College**: Pursuing B.Tech in Computer Science (2025–2028) at Allenhouse Institute of Technology
- **Email**: [gatharva264@gmail.com](mailto:gatharva264@gmail.com)
- **Phone / WhatsApp**: [+91 9453036904](tel:+919453036904)
- **GitHub**: [github.com/gatharva264-eng](https://github.com/gatharva264-eng)
- **LinkedIn**: [linkedin.com/in/atharvagupta-](https://linkedin.com/in/atharvagupta-)
- **Instagram**: [@exe.athrvv](https://instagram.com/exe.athrvv)

---

## 💖 Special Note

> *"I built this portfolio for my friend **Atharva Gupta** to showcase his skills, projects, and passion for software development in a modern, interactive way that stands out to recruiters and engineering leaders."*  
> — **[Shailendra Sahu](https://github.com/shailendrasahu393-cell)**
