@echo off
cd /d "%~dp0"
if exist "%~dp0Antigravity-CN.exe" (
    "%~dp0Antigravity-CN.exe"
) else (
    powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\status.ps1"
)
pause
