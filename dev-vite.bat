@echo off
cd /d "%~dp0"

echo Starting Nazr frontend development server (Vite)...
echo.
echo Backend API: http://localhost:9161
echo Frontend will be available at: http://localhost:5173
echo.
echo Press Ctrl+C to stop
echo.

npm run dev

