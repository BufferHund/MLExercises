# 修复说明

## 已修复的问题

### 1. 缺少 pnpm-lock.yaml

**问题**: Docker 构建失败，因为 Dockerfile 使用 `--frozen-lockfile` 但没有 lockfile。

**修复**:
- 运行 `pnpm install` 生成了 `pnpm-lock.yaml`
- 添加 `.npmrc` 配置文件

### 2. SQLite 不支持 Enum

**问题**: Prisma schema 使用了 enum 类型，但 SQLite 数据库不支持 enum。

**修复**:
- 将所有 enum 类型改为 String 类型
- 更新了以下文件：
  - `apps/api/prisma/schema.prisma` - 删除 enum 定义，使用 String
  - `apps/api/prisma/seed.ts` - 使用字符串字面量
  - `apps/api/src/routes/games.ts` - `GameStatus.LOBBY` → `"LOBBY"`
  - `apps/api/src/routes/captures.ts` - `ItemType.RADAR` → `"RADAR"`
  - `apps/api/src/ws/game-socket.ts` - `ItemType.STEALTH` → `"STEALTH"`
  - `apps/api/src/utils/game.ts` - `Role` 类型改为 `string`

### 3. Peer Dependency 警告

**问题**: `@zxing/browser` 需要 `@zxing/library@^0.21.0`，但安装的是 `0.20.0`

**修复**:
- 更新 `apps/web/package.json` 中的 `@zxing/library` 从 `^0.20.0` 到 `^0.21.0`

## 现在可以运行了！

所有修复已提交并推送到分支 `claude/offline-tag-game-011CUqK7oabPWpLso6rbQrY9`。

### 在你的 Mac 上重新运行：

```bash
cd /Users/zack/Documents/GitHub/MLExercises/tag-game

# 拉取最新修复
git pull

# 清理旧的构建
docker-compose down -v

# 重新构建并启动
docker-compose up -d --build
```

### 或者本地开发模式：

```bash
# 安装依赖
pnpm install

# 初始化数据库
cd apps/api
pnpm db:migrate
pnpm db:seed

# 启动开发服务器
cd ../..
pnpm dev
```

前端: http://localhost:5173
后端: http://localhost:3000

## 数据库类型说明

虽然 SQLite 不支持原生 enum，但我们在应用层仍然保持类型安全：

- **Role**: `"HUNTER"` | `"RUNNER"`
- **GameStatus**: `"LOBBY"` | `"RUNNING"` | `"ENDED"`
- **ItemType**: `"STEALTH"` | `"BOOST"` | `"RADAR"` | `"REFLECT"`

如果将来需要切换到 PostgreSQL，只需：
1. 更改 `DATABASE_URL` 环境变量
2. 将 Prisma schema 中的 `provider` 从 `sqlite` 改为 `postgresql`
3. 恢复 enum 定义
4. 运行 `pnpm db:migrate`
