@echo off
cd /d "%~dp0"
if exist "%~dp0Antigravity-CN.exe" (
    "%~dp0Antigravity-CN.exe" inject
) else (
    powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\live-inject.ps1"
)
pause
