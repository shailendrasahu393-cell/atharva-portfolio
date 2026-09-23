# 🚀 Render Deployment Guide for Atharva's Portfolio

A complete step-by-step guide to deploy both your **FastAPI Backend** and **Vite React Frontend** on [Render.com](https://render.com) completely on their **Free Tier**.

---

## ⚡ Method 1: Automatic Blueprint (Recommended - 1 Click)

Render reads the `render.yaml` file in your repository and configures both services automatically.

1. Push your code to **GitHub**:
   ```bash
   git init
   git add .
   git commit -m "feat: deployment ready"
   git branch -M main
   git remote add origin https://github.com/gatharva264-eng/<your-repo-name>.git
   git push -u origin main
   ```
2. Go to **[dashboard.render.com](https://dashboard.render.com)**.
3. Click **New +** > **Blueprint**.
4. Connect your GitHub repository.
5. Render will automatically detect `render.yaml` and create:
   - `atharva-portfolio-api` (Python Web Service)
   - `atharva-portfolio-frontend` (Static Site)
6. Under **Environment Variables**, paste your Groq API key:
   - Key: `GROQ_API_KEY`
   - Value: `gsk_...`
7. Click **Apply**. Both services will build and deploy!

---

## 🛠️ Method 2: Manual Setup (If preferred)

### Step 1: Deploy Backend (Web Service)
1. Go to **Render Dashboard** > Click **New +** > **Web Service**.
2. Connect your GitHub repository.
3. Fill in these settings:
   - **Name**: `atharva-portfolio-api`
   - **Language / Runtime**: `Python 3`
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Instance Type**: `Free`
4. Expand **Environment Variables** and add:
   - `GROQ_API_KEY` = your Groq API key starting with `gsk_...`
   - `GROQ_MODEL` = `qwen/qwen3.8-27b`
   - `PYTHON_VERSION` = `3.11.9`
5. Click **Create Web Service**.
6. Once deployed, copy your backend live URL:
   - Example: `https://atharva-portfolio-api.onrender.com`

---

### Step 2: Deploy Frontend (Static Site)
1. In **Render Dashboard**, click **New +** > **Static Site**.
2. Connect the same repository.
3. Fill in these settings:
   - **Name**: `atharva-portfolio`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
4. In **Redirects / Rewrites** tab:
   - **Type**: `Rewrite`
   - **Source**: `/*`
   - **Destination**: `/index.html`
5. Expand **Environment Variables** and add:
   - `VITE_API_BASE_URL` = `https://atharva-portfolio-api.onrender.com/api` (use your actual backend URL from Step 1)
6. Click **Create Static Site**.

---

## 🔒 Security & Git Notice
The `.gitignore` files are already configured to **prevent** committing:
- Secret keys in `backend/.env`
- Heavy folders like `.venv` and `node_modules`

## 🩺 Verifying Deployment
- **Backend Health Check**: Open `https://atharva-portfolio-api.onrender.com/health` in your browser (should return `{"status":"ok"}`).
- **Frontend Live Check**: Open your frontend Render URL, click any quick card (Me, Projects, Skills, Fun, Contact), and test chatting!
