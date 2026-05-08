# Coral Garden 快速开始脚本 (Windows PowerShell)
# MATE ROV 2026 - Task 1.2

Write-Host "🪸 Coral Garden 摄影测量工具 - 快速开始" -ForegroundColor Cyan
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
Write-Host " 安装依赖..." -ForegroundColor Yellow
pip install -r requirements.txt

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ 依赖安装完成!" -ForegroundColor Green
} else {
    Write-Host "❌ 依赖安装失败" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host " 使用示例:" -ForegroundColor Cyan
Write-Host ""
Write-Host " 视频拆幀 + 质量筛选:" -ForegroundColor White
Write-Host "   python frame_extractor.py extract -i video.mp4 -o .\output --fps 5" -ForegroundColor Gray
Write-Host ""
Write-Host "📦 批量处理目录:" -ForegroundColor White
Write-Host "   python frame_extractor.py batch -i .\videos -o .\output --fps 5" -ForegroundColor Gray
Write-Host ""
Write-Host "🪸 珊瑚检测:" -ForegroundColor White
Write-Host "   python coral_recognition.py detect -i coral.jpg -o .\output" -ForegroundColor Gray
Write-Host ""
Write-Host "📊 覆盖度分析:" -ForegroundColor White
Write-Host "   python coral_recognition.py coverage -i coral.jpg -o .\output" -ForegroundColor Gray
Write-Host ""
Write-Host " 检测ArUco目标板:" -ForegroundColor White
Write-Host "   python coral_recognition.py aruco -i frame.jpg -o .\output --marker-size 5.0" -ForegroundColor Gray
Write-Host ""
Write-Host "📚 详细文档: README.md, CORAL_RECOGNITION_README.md" -ForegroundColor Cyan
Write-Host ""
Write-Host " 准备好了吗？开始吧！" -ForegroundColor Green
