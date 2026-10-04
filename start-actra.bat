@echo off
title ACTRA - AI Life Action Agent
echo Starting Actra backend...
start "ACTRA Backend" cmd /k "cd /d %~dp0backend && npm install && npm run dev"
timeout /t 3 /nobreak >nul
echo Starting Actra frontend...
start "ACTRA Frontend" cmd /k "cd /d %~dp0frontend && npm install && npm run dev"
echo.
echo Actra is starting.
echo Frontend: http://localhost:5173
echo Backend:  http://localhost:3001
pause
