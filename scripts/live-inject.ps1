# Antigravity-CN Windows 实时热注入运行脚本
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "  ⚡ Antigravity-CN 实时免重启热注入器" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$RootDir = Split-Path -Parent $ScriptDir
Set-Location $RootDir

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "❌ 错误: 未检测到 Node.js 环境，请先安装 Node.js (https://nodejs.org/)" -ForegroundColor Red
    Pause
    Exit 1
}

Write-Host "正在热注入中文语言包到当前运行中的 Antigravity 窗口..." -ForegroundColor Yellow
node "$RootDir\bin\antigravity-cn.js" inject

Write-Host ""
Pause
