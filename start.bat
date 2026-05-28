@echo off
echo Starting Truck Management Web App...
echo.
echo [1/2] Starting Backend (FastAPI)...
start "Backend" cmd /k "cd /d d:\Tm\truck_web\backend && python main.py"
timeout /t 2 /nobreak >nul
echo [2/2] Starting Frontend (React)...
start "Frontend" cmd /k "cd /d d:\Tm\truck_web\frontend && npm run dev"
timeout /t 3 /nobreak >nul
echo.
echo App is starting...
echo Backend:  http://localhost:8000
echo Frontend: http://localhost:5173
echo.
start http://localhost:5173
