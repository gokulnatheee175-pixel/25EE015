@echo off
title AttendEase Backend Service
echo ===================================================
echo   AttendEase - Spring Boot Backend (Port 8080)
echo ===================================================
echo.
cd /d "%~dp0"
call mvnw.cmd spring-boot:run
pause
