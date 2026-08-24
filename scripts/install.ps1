# Antigravity-CN Windows 一键安装补丁脚本
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "  🚀 Antigravity-CN 中文汉化补丁 一键安装器" -ForegroundColor Cyan
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

Write-Host "正在安装中文汉化补丁..." -ForegroundColor Yellow
node "$RootDir\bin\antigravity-cn.js" install

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "🎉 汉化补丁安装成功！请重启 Antigravity 应用体验中文界面。" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "❌ 安装过程中出现错误，请检查权限或重试。" -ForegroundColor Red
}

Write-Host ""
Pause
