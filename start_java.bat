@echo off
echo Starting Truck Management (Java Backend + React Frontend)
echo.
echo [1/2] Starting Java Backend...
start "Java Backend" cmd /k "cd /d d:\Tm\truck_java && java -jar target\truck-backend-1.0.0.jar"
timeout /t 8 /nobreak >nul
echo [2/2] Starting React Frontend...
start "React Frontend" cmd /k "cd /d d:\Tm\truck_web\frontend && npm run dev"
timeout /t 4 /nobreak >nul
echo.
echo Java Backend:  http://localhost:8000
echo React Frontend: http://localhost:5173
echo H2 Console:    http://localhost:8000/h2-console
echo.
start http://localhost:5173
