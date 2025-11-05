# 快速启动指南

## 本地开发

### 1. 安装依赖

确保已安装 Node.js 18+ 和 pnpm。

```bash
# 安装 pnpm（如果未安装）
npm install -g pnpm

# 安装项目依赖
pnpm install
```

### 2. 初始化数据库

```bash
# 运行数据库迁移
cd apps/api
pnpm db:migrate

# 生成测试数据
pnpm db:seed

# 生成道具二维码（可选）
tsx scripts/generate-qr.ts
```

生成的二维码会保存在 `apps/api/qr/` 目录下，可以打印并放置在游戏区域。

### 3. 配置环境变量

```bash
# 复制环境变量示例
cp .env.example .env

# 编辑 .env 文件（可选）
# 默认配置已可用于开发
```

### 4. 启动开发服务器

在项目根目录：

```bash
pnpm dev
```

这会同时启动：
- 后端 API: http://localhost:3000
- 前端: http://localhost:5173

### 5. 访问应用

在浏览器打开 http://localhost:5173

## 游戏流程

### 准备阶段

1. **创建游戏**: 一名玩家创建游戏房间
2. **加入游戏**: 其他玩家使用游戏 ID 加入
3. **打印徽章**: 每个玩家在 Lobby 页面查看自己的二维码徽章并打印/截图
4. **分配阵营**: 主持人点击"分配阵营"按钮（1/3 猎人，2/3 逃亡者）
5. **开始游戏**: 主持人点击"开始游戏"

### 游戏进行

1. **猎人**:
   - 在地图上看到附近的逃亡者（模糊位置）
   - 扫描道具二维码获取特殊能力
   - 接近逃亡者（≤5米）后拍照抓捕
   - 照片需包含逃亡者的徽章二维码

2. **逃亡者**:
   - 躲避猎人
   - 扫描道具二维码（如隐身卡）
   - 目标：存活到游戏结束

3. **道具效果**:
   - **STEALTH**: 隐身 30 秒（猎人看不到你）
   - **BOOST**: 下次抓捕免疫
   - **RADAR**: 猎人抓捕额外 +2 分
   - **REFLECT**: 反射（未实现）

### 结束阶段

- 主持人可以手动结束游戏
- 查看排行榜和抓捕记录
- 返回首页创建新游戏

## Docker 部署

### 构建并启动

```bash
docker-compose up -d
```

访问 http://localhost

### 停止服务

```bash
docker-compose down
```

### 查看日志

```bash
docker-compose logs -f
```

## API 测试

### 匿名登录

```bash
curl -X POST http://localhost:3000/auth/anon \
  -H "Content-Type: application/json" \
  -d '{"nickname": "测试玩家"}'
```

### 创建游戏

```bash
curl -X POST http://localhost:3000/games \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"name": "测试游戏"}'
```

### 查询道具

```bash
curl http://localhost:3000/items/q/ITEM-CODE-HERE \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 常见问题

### 无法获取位置

- 确保浏览器允许位置权限
- HTTPS 环境下定位更准确
- 移动设备效果更好

### WebSocket 连接失败

- 检查防火墙设置
- 确保 3000 端口未被占用
- 查看浏览器控制台错误信息

### 道具二维码无法识别

- 确保光线充足
- 二维码清晰完整
- 可以手动输入道具代码

## 游戏建议

1. **区域设置**: 选择开阔、安全的区域（如校园、公园）
2. **玩家数量**: 建议 6-20 人
3. **游戏时长**: 15-30 分钟
4. **道具分布**: 在区域内隐蔽放置道具二维码
5. **安全第一**: 设置安全区，注意交通安全

## 技术支持

如有问题，请查看：
- 完整文档: README.md
- API 文档: 见代码注释
- 数据库结构: apps/api/prisma/schema.prisma
