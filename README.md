# Truck Management System

Full-stack web app — FastAPI backend + React frontend.

## Run Locally

**Option 1 — Double-click `start.bat`**

**Option 2 — Manual:**
```bash
# Terminal 1 - Backend
cd backend
pip install -r requirements.txt
python main.py

# Terminal 2 - Frontend
cd frontend
npm install
npm run dev
```
Open: http://localhost:5173

---

## Deploy to Render + Vercel (Free)

### Step 1 — Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/truck-management.git
git push -u origin main
```

### Step 2 — Deploy Backend to Render
1. Go to https://render.com → New → Web Service
2. Connect your GitHub repo
3. Settings:
   - **Root Directory:** `backend`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Click Deploy
5. Copy your backend URL e.g. `https://truck-api.onrender.com`

### Step 3 — Deploy Frontend to Vercel
1. Go to https://vercel.com → New Project → Import your repo
2. Settings:
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
3. Add Environment Variable:
   - `VITE_API_URL` = `https://truck-api.onrender.com`
4. Click Deploy

Done! Your app is live.

---

## Deploy to Railway (Easiest)
1. Go to https://railway.app
2. New Project → Deploy from GitHub
3. Add two services: one for `backend`, one for `frontend`
4. Set `VITE_API_URL` in frontend environment variables

---

## Tech Stack
- **Backend:** FastAPI + SQLite + openpyxl
- **Frontend:** React + Vite + Tailwind CSS + Recharts
- **API:** REST JSON
