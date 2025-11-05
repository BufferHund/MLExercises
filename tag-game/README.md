# INF Hunt Action - 线下捉人游戏

实时位置捉人游戏系统，支持阵营对抗、道具系统、二维码扫描和拍照验证。

## 功能特性

- 🎮 **阵营对抗**: 猎人 vs 逃亡者（1:2 比例）
- 📍 **实时定位**: WebSocket 实时位置同步
- 🎁 **道具系统**: 隐身、加速、雷达、反射
- 📷 **拍照抓捕**: 距离验证 + 二维码识别
- 🏆 **排行榜**: 实时积分统计
- 🗺️ **地图围栏**: 可定义游戏区域边界

## 技术栈

### 前端
- React 18 + TypeScript
- Vite
- Tailwind CSS
- React Router
- Leaflet (地图)
- ZXing (二维码)
- Socket.IO Client

### 后端
- Node.js + Express
- Prisma ORM
- SQLite (可切换 PostgreSQL)
- Socket.IO
- JWT 认证
- Zod 验证

## 快速开始

### 前置要求
- Node.js >= 18
- pnpm >= 8

### 安装依赖

```bash
pnpm install
```

### 数据库设置

```bash
# 运行数据库迁移
pnpm db:migrate

# 生成测试数据
pnpm db:seed
```

### 启动开发服务器

```bash
# 同时启动前后端
pnpm dev

# 或分别启动
pnpm --filter api dev
pnpm --filter web dev
```

前端: http://localhost:5173
后端: http://localhost:3000

## 项目结构

```
tag-game/
├── apps/
│   ├── api/          # 后端服务
│   │   ├── src/
│   │   │   ├── routes/      # API 路由
│   │   │   ├── services/    # 业务逻辑
│   │   │   ├── middleware/  # 中间件
│   │   │   ├── utils/       # 工具函数
│   │   │   └── ws/          # WebSocket
│   │   ├── prisma/          # 数据库 schema
│   │   └── package.json
│   └── web/          # 前端应用
│       ├── src/
│       │   ├── pages/       # 页面组件
│       │   ├── components/  # 通用组件
│       │   ├── hooks/       # 自定义 Hooks
│       │   ├── utils/       # 工具函数
│       │   └── api/         # API 客户端
│       └── package.json
└── packages/
    └── shared/       # 共享类型和工具
```

## API 文档

### 认证
- `POST /auth/anon` - 匿名登录（昵称）

### 游戏
- `POST /games` - 创建游戏房间
- `POST /games/:id/start` - 开始游戏
- `POST /games/:id/end` - 结束游戏
- `POST /games/:id/assign-teams` - 分配阵营

### 道具
- `GET /items/q/:code` - 查询道具
- `POST /pickups` - 领取道具
- `POST /items/use` - 使用道具

### 抓捕
- `POST /captures` - 提交抓捕（含照片）
- `GET /leaderboard` - 排行榜

### WebSocket 事件
- `pos:update` - 位置更新
- `pos:nearby` - 附近玩家
- `game:status` - 游戏状态变化
- `capture:new` - 新的抓捕

## 游戏规则

1. **阵营分配**: 1/3 猎人，2/3 逃亡者
2. **抓捕条件**:
   - 距离 ≤ 5 米
   - 拍摄包含目标徽章二维码的照片
   - 在游戏区域内
3. **道具效果**:
   - STEALTH: 隐身 30 秒（不广播位置）
   - BOOST: 下次抓捕免疫
   - RADAR: 抓捕额外 +2 分
   - REFLECT: 反弹抓捕（未实现）
4. **积分**: 成功抓捕 +10 分

## 部署

### Docker 部署（推荐）

**启动服务**:
```bash
# 构建并启动
docker-compose up -d --build

# 查看日志
docker-compose logs -f

# 查看服务状态
docker-compose ps
```

**停止服务**:
```bash
docker-compose down

# 完全清理（包括数据卷）
docker-compose down -v
```

**访问**:
- 前端: http://localhost
- 后端 API: http://localhost:3000
- 健康检查: 自动运行，30秒内完成后服务才可用

### 环境变量

参考 `.env.example` 配置：
- `JWT_SECRET`: JWT 密钥（默认: change-this-secret）
- `DATABASE_URL`: 数据库连接
- `UPLOAD_DIR`: 上传目录
- `MAX_UPLOAD_MB`: 最大上传大小

## 🏥 健康检查系统

项目内置完整的启动前健康检查：

### 自动检查项
1. ✅ **环境变量配置** - 验证必需的环境变量
2. ✅ **数据库连接** - 确保数据库可访问
3. ✅ **数据库表结构** - 验证所有必需的表都存在

### 手动运行
```bash
cd apps/api
pnpm healthcheck
```

### Docker 健康检查
- 每 10 秒检查 API 端点
- 启动后 30 秒开始检查
- 3 次失败后标记为不健康
- 前端服务会等待后端健康后才启动

## 🛠️ 故障排除

### 容器无法启动

**查看日志**:
```bash
docker-compose logs api
```

**常见问题**:
1. **OpenSSL 错误**: 已在 Dockerfile 中修复，重新构建即可
2. **Prisma 引擎错误**: 已配置正确的 binaryTargets
3. **表不存在**: 启动脚本会自动使用 `db push` 同步 schema

### 重新构建

```bash
# 完全清理并重建
docker-compose down -v
docker-compose up --build

# 强制重建特定服务
docker-compose build --no-cache api
docker-compose up -d api
```

### 查看容器内部

```bash
# 进入 API 容器
docker exec -it tag-game-api-1 sh

# 检查文件
ls -la /app/apps/api/

# 手动运行健康检查
node /app/apps/api/dist/healthcheck.js
```

## 📚 更多文档

- [修复历史](./FIXES.md) - 所有遇到的问题和解决方案
- [API 文档](#api-文档) - 完整的 API 端点说明
- [游戏规则](#游戏规则) - 详细的游戏玩法

## 🔧 常用命令

```bash
# 本地开发
pnpm install              # 安装依赖
pnpm dev                  # 启动开发服务器
pnpm --filter api build   # 构建后端
pnpm --filter web build   # 构建前端

# 数据库
cd apps/api
pnpm db:migrate          # 创建 migration
pnpm db:seed             # 填充测试数据
pnpm db:studio           # 打开 Prisma Studio
npx prisma generate      # 重新生成 Prisma Client

# Docker
docker-compose ps        # 查看状态
docker-compose logs -f   # 实时日志
docker-compose restart   # 重启服务
```

## 📋 已知问题

- SQLite 不支持原生 enum 类型（使用 String + 应用层验证）
- 生产环境建议使用 PostgreSQL
- 地理围栏在本地开发时可能不准确（需要 HTTPS 才能获取精确 GPS）

## 🔐 生产环境建议

1. **使用强 JWT 密钥**
```bash
openssl rand -base64 32
```

2. **切换到 PostgreSQL**
```env
DATABASE_URL="postgresql://user:password@localhost:5432/taggame"
```

3. **配置 HTTPS** - 使用 nginx + Let's Encrypt

4. **限制 CORS** - 修改 `apps/api/src/index.ts`

## License

MIT
