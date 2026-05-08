@echo off
REM Coral Garden 依赖修复脚本 - Windows
REM 解决numpy ABI版本不兼容问题

echo ========================================
echo Coral Garden 依赖修复
echo ========================================
echo.

REM 卸载现有版本
echo [1/4] 卸载现有opencv和numpy...
pip uninstall -y opencv-python opencv-contrib-python numpy

echo.
echo [2/4] 安装兼容版本的numpy...
pip install "numpy>=1.24.0,<2.0.0"

echo.
echo [3/4] 安装兼容的opencv-python...
pip install "opencv-python>=4.8.0"

echo.
echo [4/4] 安装其他依赖...
pip install tqdm Pillow

echo.
echo ========================================
echo 验证安装...
echo ========================================
python -c "import cv2; import numpy; print(f'✅ OpenCV: {cv2.__version__}'); print(f'✅ NumPy: {numpy.__version__}')"

echo.
echo 如果看到版本号，说明安装成功！
echo.
pause
