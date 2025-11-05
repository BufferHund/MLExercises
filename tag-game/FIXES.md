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

### 4. Docker Build Context 问题（Monorepo）

**问题**: Docker build context 设置在子目录（`./apps/api` 和 `./apps/web`），但 `pnpm-lock.yaml` 和 `pnpm-workspace.yaml` 在项目根目录，导致 Dockerfile 无法访问这些文件。

**修复**:
- 将 `docker-compose.yml` 中的 build context 从子目录改为根目录 (`.`)
- 更新 Dockerfile 路径为相对于根目录的路径（`apps/api/Dockerfile`）
- 修改 Dockerfiles 以复制 workspace 文件：
  - 复制 `package.json`, `pnpm-workspace.yaml`, `pnpm-lock.yaml`, `.npmrc`
  - 复制子项目的 `package.json`
  - 调整所有 COPY 路径以适应新的 context
- 移除 `docker-compose.yml` 中过时的 `version` 字段

### 5. Monorepo node_modules 路径问题

**问题**: 在 Dockerfile 中切换工作目录到子项目（`WORKDIR /app/apps/web`）后，找不到 `tsc` 等依赖，因为在 pnpm monorepo 中，依赖安装在根目录的 `node_modules`。

**错误信息**: `sh: tsc: not found`

**修复**:
- 使用 `pnpm --filter <project>` 从根目录构建子项目
- 不切换工作目录，保持在 `/app` 根目录
- 复制所有 workspace 的 `package.json` 文件（api、web、shared）
- 创建空的 `packages/shared` 包以完善 workspace 结构
- **重要**：从 deps 阶段复制整个 `apps` 和 `packages` 目录结构（包含 node_modules 符号链接），然后用实际源码覆盖

**关键命令变更**:
```dockerfile
# 之前（错误）
WORKDIR /app/apps/web
RUN npm run build

# 修复 1（仍有问题）
RUN pnpm --filter web build  # 子目录缺少 node_modules 链接

# 修复 2（正确）✅
COPY --from=deps /app/apps ./apps  # 复制包含 node_modules 链接的结构
COPY apps/web ./apps/web           # 用实际源码覆盖
RUN pnpm --filter web build        # 现在可以找到依赖了
```

### 6. TypeScript 编译错误

**问题**: 前端构建时遇到 TypeScript 类型错误。

**错误信息**:
```
error TS2339: Property 'env' does not exist on type 'ImportMeta'.
error TS6133: 'isRunner' is declared but its value is never read.
error TS6133: 'captureMode' is declared but its value is never read.
```

**修复**:
- 创建 `vite-env.d.ts` 定义 `import.meta.env` 类型
- 删除未使用的变量（`isRunner`, `captureMode`, `setCaptureMode`）

### 7. 后端 TypeScript 类型错误

**问题**: 后端构建时遇到类型推断和类型兼容性错误。

**错误信息**:
```
error TS2742: The inferred type of 'router' cannot be named without a reference...
error TS2322: Type 'string' is not assignable to type '"HUNTER" | "RUNNER"'.
```

**修复**:
- 为所有路由文件的 `router` 添加显式类型注解：`const router: Router = Router()`
- 为 `user.role` 添加类型断言：`as 'HUNTER' | 'RUNNER'`
- 在 tsconfig.json 中禁用 declaration 生成（生产环境不需要）

### 8. 运行时找不到依赖包（Docker）

**问题**: Docker 构建成功，但运行时报错找不到 `express` 等依赖包。

**错误信息**:
```
Error [ERR_MODULE_NOT_FOUND]: Cannot find package 'express' imported from /app/dist/index.js
```

**原因**: 在 production runner 阶段，将编译后的代码从 `/app/apps/api/dist` 复制到 `/app/dist`，破坏了 monorepo 的目录结构，导致 Node.js 无法正确解析模块路径。

**修复**:
- 在 runner 阶段保持 monorepo 的目录结构
- 复制到 `/app/apps/api/dist` 而不是 `/app/dist`
- 更新 CMD：从 `node dist/index.js` 改为 `node apps/api/dist/index.js`
- **重要**：还需要复制 `/app/apps/api/node_modules` 目录，因为 pnpm 在这个目录创建了指向根 node_modules 的符号链接
- 这样 Node.js 可以从 `/app/node_modules` 正确找到所有依赖

**Dockerfile 变更**:
```dockerfile
# 必须同时复制根 node_modules 和子项目的 node_modules
COPY --from=builder --chown=apiuser:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=apiuser:nodejs /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=builder --chown=apiuser:nodejs /app/apps/api/dist ./apps/api/dist
```

### 9. Prisma Schema 路径错误（docker-compose.yml）

**问题**: 虽然 Dockerfile 修复后构建成功，但启动容器时 Prisma migrate 命令找不到 schema 文件。

**错误信息**:
```
Error: Could not find Prisma Schema that is required for this command.
Checked following paths:
schema.prisma: file not found
prisma/schema.prisma: file not found
```

**原因**: `docker-compose.yml` 的 command 在 `/app` 目录下运行 `npx prisma migrate deploy`，但没有指定 schema 路径。Prisma 默认查找 `./prisma/schema.prisma`，而实际文件在 `/app/apps/api/prisma/schema.prisma`。

**修复**:
- 在 `docker-compose.yml` 的 command 中添加 `--schema` 参数
- 更新 node 命令路径以匹配 Dockerfile 中的 CMD

**命令变更**:
```yaml
# 之前（错误）
command: sh -c "npx prisma migrate deploy && node dist/index.js"

# 修复（正确）✅
command: sh -c "npx prisma migrate deploy --schema=apps/api/prisma/schema.prisma && node apps/api/dist/index.js"
```

### 10. 缺少 OpenSSL 库（Alpine Linux + Prisma）

**问题**: Prisma 引擎无法加载，提示找不到 OpenSSL 共享库。

**错误信息**:
```
Error loading shared library libssl.so.1.1: No such file or directory
(needed by /app/node_modules/.pnpm/@prisma+client@5.22.0_prisma@5.22.0/node_modules/.prisma/client/libquery_engine-linux-musl-arm64-openssl-1.1.x.so.node)
```

**原因**: Alpine Linux 默认不包含 OpenSSL 1.1.x 库，而 Prisma 的查询引擎需要这些库才能运行。

**修复**:
- 在 Dockerfile 的 production runner 阶段安装 `openssl` 包

**Dockerfile 变更**:
```dockerfile
# Production image
FROM base AS runner
WORKDIR /app

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl

ENV NODE_ENV=production
```

### 11. ES Module 兼容性问题（healthcheck 脚本）

**问题**: 健康检查脚本使用了 CommonJS 的 `require.main === module` 语法，但项目配置为 ES modules。

**错误信息**:
```
ReferenceError: require is not defined in ES module scope, you can use import instead
This file is being treated as an ES module because it has a '.js' file extension and '/app/apps/api/package.json' contains "type": "module".
```

**原因**: 在 `package.json` 中配置了 `"type": "module"`，编译后的 JavaScript 文件被视为 ES modules，不能使用 CommonJS 的 `require` 语法。

**修复**:
- 移除 `if (require.main === module)` 检查
- 直接调用 `main()` 函数（因为该脚本只在启动时被调用，不需要判断是否为主模块）

**代码变更**:
```typescript
// 之前（错误）
if (require.main === module) {
  main();
}

// 修复（正确）✅
main();
```

### 12. Prisma 引擎 OpenSSL 版本不匹配

**问题**: Prisma Client 在运行时找不到匹配的 Query Engine，因为构建时和运行时的 OpenSSL 版本不一致。

**错误信息**:
```
Prisma Client could not locate the Query Engine for runtime "linux-musl-arm64-openssl-3.0.x".

This happened because Prisma Client was generated for "linux-musl-arm64-openssl-1.1.x", but the actual deployment required "linux-musl-arm64-openssl-3.0.x".
```

**原因**:
- Alpine Linux 现在使用 OpenSSL 3.0.x
- Prisma Client 默认只生成针对当前构建环境的二进制文件
- 构建环境和运行环境的 OpenSSL 版本不同

**修复**:
- 在 Prisma schema 的 `generator` 配置中添加 `binaryTargets`
- 指定生成 `linux-musl-arm64-openssl-3.0.x` 版本的二进制文件

**schema.prisma 变更**:
```prisma
generator client {
  provider      = "prisma-client-js"
  binaryTargets = ["native", "linux-musl-arm64-openssl-3.0.x"]
}
```

这样 Prisma 会在生成 client 时同时构建本地版本和目标部署环境版本的二进制文件。

## 启动自检功能

为了确保服务在所有依赖就绪后才启动，我们添加了完整的启动自检流程：

### 1. 健康检查脚本 (`apps/api/src/healthcheck.ts`)

自动检查：
- ✅ 环境变量配置
- ✅ 数据库连接
- ✅ 数据库表结构

### 2. 启动脚本 (`apps/api/start.sh`)

启动流程编排：
1. **步骤 1/3**: 运行数据库迁移（`prisma migrate deploy`）
2. **步骤 2/3**: 运行健康检查
3. **步骤 3/3**: 启动应用服务器

如果任何步骤失败，服务将不会启动。

### 3. Docker 健康检查

`docker-compose.yml` 配置了 healthcheck：
- 每 10 秒检查一次 API 端点
- 启动后 30 秒开始检查（给予足够的启动时间）
- 3 次失败后标记为不健康

前端服务会等待后端健康检查通过后才启动。

### 4. 手动运行健康检查

在本地开发环境中：
```bash
cd apps/api
pnpm healthcheck
```

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
