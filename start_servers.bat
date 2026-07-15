@echo off
echo Starting Backend Server...
start "DevBoard-Backend" /B /D "backend" uvicorn main:app --reload --host 0.0.0.0 --port 8000
echo Backend started on port 8000

echo Starting Frontend Server...
start "DevBoard-Frontend" /B /D "frontend" npm run dev
echo Frontend starting on port 3000

echo.
echo Both servers are starting up!
echo Backend: http://localhost:8000
echo Frontend: http://localhost:3000
echo.
echo Check backend health: http://localhost:8000/health
