#!/bin/sh
set -e

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║          INF 猎捕行动 - 后端服务启动脚本                      ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# 1. 运行数据库迁移
echo "📦 步骤 1/3: 运行数据库迁移..."
npx prisma migrate deploy --schema=apps/api/prisma/schema.prisma
if [ $? -eq 0 ]; then
    echo "   ✅ 数据库迁移完成"
else
    echo "   ❌ 数据库迁移失败"
    exit 1
fi
echo ""

# 2. 运行健康检查
echo "🔍 步骤 2/3: 运行健康检查..."
node /app/apps/api/dist/healthcheck.js
if [ $? -eq 0 ]; then
    echo ""
else
    echo ""
    echo "   ❌ 健康检查失败，服务启动终止"
    exit 1
fi

# 3. 启动应用
echo "🚀 步骤 3/3: 启动应用服务器..."
echo ""
cd /app
exec node apps/api/dist/index.js
