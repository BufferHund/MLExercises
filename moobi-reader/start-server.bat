@echo off
REM Moobi Reader - Windows 本地服务器启动脚本

echo 🚀 正在启动 Moobi Reader 本地服务器...
echo.

REM 检测 Python 3
where python >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo ✓ 使用 Python 启动服务器
    echo 📖 在浏览器中打开: http://localhost:8000
    echo.
    echo 按 Ctrl+C 停止服务器
    echo.
    python -m http.server 8000
    goto :end
)

REM 检测 Node.js
where node >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo ✓ 使用 Node.js 启动服务器
    echo 📖 在浏览器中打开: http://localhost:8000
    echo.
    echo 按 Ctrl+C 停止服务器
    echo.
    npx http-server -p 8000
    goto :end
)

echo ❌ 未找到 Python 或 Node.js
echo.
echo 请安装以下任一工具：
echo   - Python 3: https://www.python.org/downloads/
echo   - Node.js: https://nodejs.org/
echo.
echo 或者使用其他 HTTP 服务器工具
pause
exit /b 1

:end
