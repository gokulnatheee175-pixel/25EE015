@echo off
@REM AttendEase Maven Wrapper Script for Windows

set MAVEN_HOME=C:\apache-maven-3.9.9
if exist "%MAVEN_HOME%\bin\mvn.cmd" (
    call "%MAVEN_HOME%\bin\mvn.cmd" %*
) else (
    where mvn >nul 2>nul
    if %ERRORLEVEL% equ 0 (
        call mvn %*
    ) else (
        echo [ERROR] Maven not found in PATH or at %MAVEN_HOME%
        exit /b 1
    )
)
