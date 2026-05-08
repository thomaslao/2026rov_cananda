# Coral Garden GUI 快速启动脚本 (Windows PowerShell)
# MATE ROV 2026 - Task 1.2

Write-Host "🪸 Coral Garden 图像识别系统 - GUI启动" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# 检查Python
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✅ Python 已安装: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ 未找到Python，请先安装Python 3.10+" -ForegroundColor Red
    exit 1
}

Write-Host ""

# 安装依赖
Write-Host " 安装GUI依赖..." -ForegroundColor Yellow
pip install customtkinter Pillow

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ 依赖安装完成!" -ForegroundColor Green
} else {
    Write-Host "❌ 依赖安装失败" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host " 启动GUI程序..." -ForegroundColor Cyan
Write-Host ""

# 启动GUI
python coral_gui.py
