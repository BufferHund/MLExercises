#!/bin/bash

# Moobi Reader - 本地服务器启动脚本

echo "🚀 正在启动 Moobi Reader 本地服务器..."
echo ""

# 检测可用的服务器
if command -v python3 &> /dev/null; then
    echo "✓ 使用 Python 3 启动服务器"
    echo "📖 在浏览器中打开: http://localhost:8000"
    echo ""
    echo "按 Ctrl+C 停止服务器"
    echo ""
    python3 -m http.server 8000
elif command -v python &> /dev/null; then
    echo "✓ 使用 Python 2 启动服务器"
    echo "📖 在浏览器中打开: http://localhost:8000"
    echo ""
    echo "按 Ctrl+C 停止服务器"
    echo ""
    python -m SimpleHTTPServer 8000
elif command -v node &> /dev/null; then
    echo "✓ 使用 Node.js 启动服务器"
    echo "📖 在浏览器中打开: http://localhost:8000"
    echo ""
    echo "按 Ctrl+C 停止服务器"
    echo ""
    npx http-server -p 8000
else
    echo "❌ 未找到 Python 或 Node.js"
    echo ""
    echo "请安装以下任一工具："
    echo "  - Python 3: https://www.python.org/downloads/"
    echo "  - Node.js: https://nodejs.org/"
    echo ""
    echo "或者使用其他 HTTP 服务器工具"
    exit 1
fi
