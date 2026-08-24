# Antigravity-CN Windows 一键卸载与还原脚本
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "  🔄 Antigravity-CN 官方原版还原卸载器" -ForegroundColor Cyan
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

Write-Host "正在还原官方原版客户端..." -ForegroundColor Yellow
node "$RootDir\bin\antigravity-cn.js" uninstall

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "🎉 已成功还原至官方原版！请重启 Antigravity 应用生效。" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "❌ 还原过程中出现错误。" -ForegroundColor Red
}

Write-Host ""
Pause
