@echo off
title AttendEase Frontend Client
echo ===================================================
echo   AttendEase - Classroom Attendance Frontend
echo ===================================================
echo.
echo Launching AttendEase Frontend in default browser...
start "" "%~dp0index.html"
echo.
echo If you prefer a local HTTP server, run:
echo   cd /d "%~dp0" ^&^& python -m http.server 3000
echo.
pause
