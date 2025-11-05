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

### Docker

```bash
docker-compose up -d
```

### 环境变量

参考 `.env.example` 配置：
- `JWT_SECRET`: JWT 密钥
- `DATABASE_URL`: 数据库连接
- `UPLOAD_DIR`: 上传目录
- `MAX_UPLOAD_MB`: 最大上传大小

## License

MIT
