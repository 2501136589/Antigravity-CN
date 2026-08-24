@echo off
cd /d "%~dp0"
if exist "%~dp0Antigravity-CN.exe" (
    "%~dp0Antigravity-CN.exe" uninstall
) else (
    powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\uninstall.ps1"
)
pause
