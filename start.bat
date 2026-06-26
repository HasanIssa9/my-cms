@echo off
echo Starting My CMS...
echo.

start "CMS Backend" cmd /k "cd /d "%~dp0backend" && node server.js"
timeout /t 2 /nobreak >nul
start "CMS Frontend" cmd /k "cd /d "%~dp0frontend" && npx vite"

echo.
echo Both servers starting in separate windows!
echo.
echo   Admin Panel : http://localhost:5173/admin
echo   Public Site : http://localhost:3001
echo   Login       : admin / admin123
echo.
pause
