# Moobi Reader - 现代化电子书阅读器

一个功能丰富、界面优雅的电子书阅读器，支持多种格式，提供沉浸式阅读体验。

## 功能特性

### 支持的格式
- **EPUB** - 标准电子书格式
- **PDF** - 原生和自定义渲染模式
- **TXT** - 纯文本文件
- **MOBI** - Kindle 格式（KF8）
- **DOCX** - Microsoft Word 文档

### 核心功能
- 📚 **书架管理** - 智能书架，记录阅读历史和进度
- 🔖 **书签系统** - 添加带笔记的彩色书签
- 🎨 **高亮标注** - 多色高亮文本
- 🔍 **全文搜索** - 快速查找内容
- ⚙️ **主题切换** - 深色、浅色、护眼、经典多种主题
- 📖 **布局模式** - 优雅、A4、全宽多种阅读布局
- 🖱️ **智能翻页** - 支持鼠标滚轮、键盘快捷键、触摸滑动
- 📱 **移动优化** - 响应式设计，完美支持移动设备
- 🎯 **悬浮工具栏** - 智能定位，可拖动，不遮挡内容
- 🌐 **沉浸模式** - 全屏阅读，自动隐藏控制栏

### 悬浮工具栏特性
- **智能定位** - 自动放置在屏幕边缘与书页内容之间的空白区域
- **长按拖动** - 长按 500ms 进入拖动模式，变为透明圆形
- **形变动画** - 从胶囊形到圆形的流畅过渡动画
- **边缘吸附** - 释放后自动吸附到最近的屏幕边缘
- **自适应布局** - 根据吸附边缘自动调整按钮方向

## 快速开始

### 开发环境

```bash
# 安装依赖
npm install

# 启动开发服务器（端口 1000）
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

应用将运行在：
- 本地：`http://localhost:1000`
- 网络：`http://服务器IP:1000`（允许外部访问）

### Docker 部署（推荐）

#### 使用 Docker Compose

```bash
# 启动应用
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止应用
docker-compose down
```

#### 使用 Docker 命令

```bash
# 构建镜像
docker build -t moobi-reader .

# 运行容器
docker run -d \
  --name moobi-reader \
  -p 1000:1000 \
  --restart unless-stopped \
  moobi-reader
```

更多 Docker 部署详情，请查看 [DOCKER.md](./DOCKER.md)

## 技术栈

- **框架**：React 19 + TypeScript
- **构建工具**：Vite
- **样式**：Tailwind CSS 4
- **动画**：Framer Motion
- **状态管理**：Zustand
- **图标**：Lucide React
- **文件处理**：
  - EPUB.js - EPUB/MOBI 渲染
  - PDF.js - PDF 渲染
  - Mammoth.js - DOCX 转换
  - JSZip - 压缩文件处理

## 项目结构

```
moobi-reader-react/
├── src/
│   ├── components/       # React 组件
│   │   ├── Bookshelf.tsx         # 书架组件
│   │   ├── ImmersiveReader.tsx   # 沉浸式阅读器
│   │   ├── EpubReader.tsx        # EPUB 阅读器
│   │   ├── PdfReader.tsx         # PDF 阅读器
│   │   ├── TextReader.tsx        # 文本阅读器
│   │   ├── MobiReader.tsx        # MOBI 阅读器
│   │   └── DocsReader.tsx        # DOCX 阅读器
│   ├── App.tsx           # 主应用组件
│   ├── main.tsx          # 应用入口
│   └── index.css         # 全局样式
├── public/               # 静态资源
├── Dockerfile            # Docker 配置
├── docker-compose.yml    # Docker Compose 配置
├── nginx.conf            # Nginx 配置
└── vite.config.ts        # Vite 配置
```

## 使用指南

### 添加书籍
1. 点击「添加书籍」按钮
2. 选择支持的格式文件（EPUB、PDF、TXT、MOBI、DOCX）
3. 自动打开阅读器

### 阅读控制
- **翻页**：
  - 鼠标滚轮
  - 键盘方向键 ←/→
  - PageUp/PageDown
  - 空格键（下一页）
  - 移动端左右滑动
- **显示控制栏**：移动鼠标到顶部/底部，或点击悬浮工具栏的菜单按钮
- **全屏模式**：F11 或点击全屏按钮
- **搜索**：Ctrl+F 或点击搜索按钮

### 悬浮工具栏
- **显示控制栏**：点击菜单图标
- **退出全屏**：点击最小化图标（全屏时显示）
- **拖动调整位置**：长按 500ms 后拖动到任意位置，释放后自动吸附

### 主题和布局
- **主题**：深色、浅色、护眼、经典
- **布局**：优雅模式（max-w-4xl）、A4 模式、全宽模式
- **字体大小**：100%、110%、120%（EPUB/TXT/MOBI/DOCX）
- **书页缩放**：100%、110%、120%（其他格式）

## 开发说明

### 环境要求
- Node.js 20+
- npm 9+

### 本地开发

```bash
# 克隆仓库
git clone <repository-url>
cd moobi-reader-react

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

### 代码检查

```bash
# 运行 ESLint
npm run lint
```

### 构建

```bash
# 生产构建
npm run build

# 构建产物在 dist/ 目录
```

## 配置

### 端口配置

编辑 `vite.config.ts`：

```typescript
server: {
  host: '0.0.0.0',
  port: 1000,
  strictPort: true,
}
```

### 主题定制

主题配置在 `src/components/ImmersiveReader.tsx` 的 `getThemeColors()` 函数中。

## 浏览器支持

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- 现代移动浏览器

## 已知问题

- MOBI 文件加载可能需要重试机制
- DOCX 复杂排版可能显示异常
- 某些 PDF 文件在自定义模式下渲染较慢

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可

MIT License

## 致谢

感谢以下开源项目：
- [EPUB.js](https://github.com/futurepress/epub.js/)
- [PDF.js](https://github.com/mozilla/pdf.js)
- [Mammoth.js](https://github.com/mwilliamson/mammoth.js)
- [React](https://react.dev/)
- [Vite](https://vite.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
