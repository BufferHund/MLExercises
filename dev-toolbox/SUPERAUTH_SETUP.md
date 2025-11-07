# SuperAuth 集成说明

## 功能概述

开发者工具箱已成功集成SuperAuth统一身份认证平台，支持两种认证模式：

### 1. 直接登录模式（Direct API Mode）
- ✅ 使用应用内置的登录/注册表单
- ✅ 直接调用Gateway API进行认证
- ✅ 适用场景：Docker内部网络、开发测试、单应用部署

### 2. 统一认证模式（Portal Redirect Mode）
- ✅ 跳转到统一认证Portal进行SSO登录
- ✅ 支持多应用统一身份管理
- ✅ 适用场景：多应用生态、企业级SSO部署

## 快速开始

### 使用直接登录模式（推荐用于开发测试）

1. **启动Gateway API服务**（端口4000）
   ```bash
   # 确保SuperAuth Gateway API在运行
   # 默认地址: http://localhost:4000
   ```

2. **使用应用内置登录表单**
   - 打开应用，点击"登录"
   - 选择"直接登录"模式（默认选中）
   - 输入用户名和密码
   - 或点击"立即注册"创建新账号

3. **测试账号**（如果Gateway API有演示数据）
   ```
   免费用户: testuser / 123456
   付费用户: premiumuser / 123456
   ```

### 使用统一认证模式（需要Portal服务）

1. **部署SuperAuth Portal服务**
   - 确保Portal服务已部署并运行

2. **配置环境变量**
   ```bash
   # 复制环境变量模板
   cp .env.example .env

   # 编辑 .env 文件，填入实际的Portal地址
   VITE_PORTAL_URL=https://auth.yourdomain.com
   ```

3. **重启开发服务器**
   ```bash
   npm run dev
   ```

4. **使用Portal登录**
   - 打开应用，点击"登录"
   - 选择"统一认证"模式
   - 点击"跳转到认证平台"
   - 在Portal完成登录后自动跳转回应用

## 环境变量配置

创建 `.env` 文件并配置以下变量：

```bash
# Gateway API 地址
VITE_GATEWAY_URL=http://localhost:4000

# Portal 地址（用于SSO）
VITE_PORTAL_URL=http://localhost

# 当前应用地址（用于回调）
VITE_APP_URL=http://localhost:3100
```

## API端点说明

Gateway API提供以下端点：

- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/logout` - 用户登出
- `GET /api/auth/verify` - 验证Token
- `GET /api/auth/me` - 获取当前用户信息
- `POST /api/virtual-identity` - 创建虚拟身份

## 会员权益

- **免费用户**: Gemini 2.5 Flash模型
- **付费用户**: Gemini 2.5 Pro模型 + 高级功能（COT思维链、深度搜索、AI绘图）
- **Premium小组件**: Football Premium、LiteBook Premium、桌游Games Premium

## 认证流程

### 直接登录流程
```
用户输入 → Gateway API → 返回JWT Token → Cookie存储 → 登录成功
```

### Portal登录流程
```
跳转Portal → Portal登录 → 回调应用 → 验证Token → 登录成功
```

## 故障排查

### Portal无法访问
- **问题**: 点击"跳转到认证平台"后显示无法访问
- **原因**: Portal服务未部署或URL配置错误
- **解决**: 使用"直接登录"模式，或部署Portal服务并配置正确的URL

### Gateway API连接失败
- **问题**: 直接登录提示连接失败
- **原因**: Gateway API未启动或端口配置错误
- **解决**: 启动Gateway API服务（默认端口4000）

### Cookie未保存
- **问题**: 登录后刷新页面又退出了
- **原因**: Cookie配置问题或跨域设置错误
- **解决**: 确保Gateway API响应头包含正确的CORS和Cookie设置

## 技术实现

- **状态管理**: Zustand + persist middleware
- **认证方式**: Cookie-based JWT
- **会话时长**: 24小时（Redis存储）
- **虚拟身份**: 支持匿名用户临时身份
- **密码加密**: bcrypt哈希

## 文件结构

```
src/
├── config/
│   └── superauth.ts          # SuperAuth配置
├── services/
│   └── superAuthService.ts   # API服务层
├── stores/
│   └── useUserStore.ts       # 用户状态管理
└── components/
    ├── LoginModal.tsx        # 登录对话框
    └── RegisterModal.tsx     # 注册对话框
```

## 下一步

1. **开发环境**: 使用"直接登录"模式测试功能
2. **生产环境**: 部署Portal服务，启用"统一认证"模式
3. **多应用集成**: 所有应用使用同一个Portal实现SSO

---

**注意**: 默认使用"直接登录"模式，用户可在登录/注册对话框中自由切换认证模式。
