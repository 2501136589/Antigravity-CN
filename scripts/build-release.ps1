# ==============================================================================
# Antigravity-CN: 官方便携发布包自动打包脚本 (Portable Release Packager)
# ==============================================================================

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$rootDir = Split-Path -Parent $scriptDir
$releaseDir = Join-Path $rootDir "release"
$zipPath = Join-Path $releaseDir "Antigravity-CN-v1.0.0-Portable.zip"
$stageDir = Join-Path $env:TEMP "Antigravity-CN-Portable-Stage"

if (Test-Path -LiteralPath $stageDir) { Remove-Item -LiteralPath $stageDir -Recurse -Force }
New-Item -ItemType Directory -Path $stageDir -Force | Out-Null
New-Item -ItemType Directory -Path $releaseDir -Force | Out-Null

# 1. 拷贝核心入口（4 个批处理 + 原生 EXE）
Copy-Item -LiteralPath (Join-Path $rootDir "[1] 一键安装汉化.bat") -Destination (Join-Path $stageDir "[1] 一键安装汉化.bat")
Copy-Item -LiteralPath (Join-Path $rootDir "[2] 实时热注入(免重启).bat") -Destination (Join-Path $stageDir "[2] 实时热注入(免重启).bat")
Copy-Item -LiteralPath (Join-Path $rootDir "[3] 一键还原官方原版.bat") -Destination (Join-Path $stageDir "[3] 一键还原官方原版.bat")
Copy-Item -LiteralPath (Join-Path $rootDir "[4] 状态检测与管理菜单.bat") -Destination (Join-Path $stageDir "[4] 状态检测与管理菜单.bat")
Copy-Item -LiteralPath (Join-Path $rootDir "Antigravity-CN.exe") -Destination (Join-Path $stageDir "Antigravity-CN.exe")

# 2. 拷贝文档与核心运行时
Copy-Item -LiteralPath (Join-Path $rootDir "README.md") -Destination (Join-Path $stageDir "README.md")
Copy-Item -LiteralPath (Join-Path $rootDir "LICENSE") -Destination (Join-Path $stageDir "LICENSE")
Copy-Item -LiteralPath (Join-Path $rootDir "package.json") -Destination (Join-Path $stageDir "package.json")
Copy-Item -LiteralPath (Join-Path $rootDir "bin") -Destination (Join-Path $stageDir "bin") -Recurse
Copy-Item -LiteralPath (Join-Path $rootDir "src") -Destination (Join-Path $stageDir "src") -Recurse
Copy-Item -LiteralPath (Join-Path $rootDir "scripts") -Destination (Join-Path $stageDir "scripts") -Recurse

if (Test-Path -LiteralPath $zipPath) { Remove-Item -LiteralPath $zipPath -Force }

# 3. 使用 .NET Zip 归档引擎生成标准 UTF-8 兼容 Zip
$csc = "C:\Windows\Microsoft.NET\Framework64\v4.0.30319\csc.exe"
if (-not (Test-Path $csc)) { $csc = "C:\Windows\Microsoft.NET\Framework\v4.0.30319\csc.exe" }
$zipCs = Join-Path $env:TEMP "ZipHelper.cs"
@'
using System;
using System.IO;
using System.IO.Compression;
class ZipHelper { static void Main(string[] a) { if (File.Exists(a[1])) File.Delete(a[1]); ZipFile.CreateFromDirectory(a[0], a[1], CompressionLevel.Optimal, false); } }
'@ | Out-File -FilePath $zipCs -Encoding utf8
$zipExe = Join-Path $env:TEMP "ZipHelper.exe"
& $csc /target:exe /out:$zipExe /r:System.IO.Compression.FileSystem.dll /nologo $zipCs
& $zipExe $stageDir $zipPath

Remove-Item -LiteralPath $stageDir -Recurse -Force
Remove-Item -LiteralPath $zipCs -Force
Remove-Item -LiteralPath $zipExe -Force

Write-Host "✅ 便携发布包打包完成: $zipPath" -ForegroundColor Green
Get-Item -LiteralPath $zipPath | Select-Object Name, Length, LastWriteTime
