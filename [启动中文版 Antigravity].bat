@echo off
cd /d "%~dp0"
if exist "%~dp0Antigravity-CN.exe" (
    "%~dp0Antigravity-CN.exe" launch
) else (
    powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\inject.ps1"
)
