@echo off
cd /d "%~dp0"
if exist "%~dp0Antigravity-CN.exe" (
    "%~dp0Antigravity-CN.exe" install
) else (
    powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\install.ps1"
)
pause
