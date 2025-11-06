# Developer Workspace

开发者工作空间 - 集成电子书阅读器和开发工具箱的多功能应用

## 功能特性

### 📚 电子书阅读器
- 支持 PDF、EPUB、TXT 等格式
- 沉浸式阅读体验
- 书架管理
- 阅读进度保存

### 🛠️ 开发者工具箱
采用 iPad dock 风格的界面设计，包含 12 个实用工具：

**Web 开发工具**
- JSON 格式化 - 格式化/压缩 JSON 数据
- Base64 编解码 - Base64 编码和解码
- URL 编解码 - URL 编码和解码
- 时间戳转换 - 时间戳与日期相互转换
- 颜色转换 - HEX/RGB 颜色格式转换
- 正则测试 - 正则表达式匹配测试

**AI 开发工具**
- Token 计数 - 粗略估算文本的 token 数量
- 提示词模板 - 常用 AI 提示词模板
- Markdown 预览 - Markdown 实时预览
- CSV to JSON - CSV 数据转 JSON 格式
- UUID 生成器 - 批量生成 UUID
- Hash 计算 - SHA-256 哈希计算

## 技术栈

- **React** - UI 框架
- **TypeScript** - 类型安全
- **Vite** - 构建工具
- **Tailwind CSS** - 样式
- **Zustand** - 状态管理
- **Lucide React** - 图标库
- **PDF.js** - PDF 渲染
- **ePub.js** - EPUB 渲染

## 开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

## 设计原则

- 简洁的界面设计
- iPad dock 风格的工具布局
- 毛玻璃效果的视觉语言
- 流畅的动画过渡
- 响应式布局

## 项目结构

```
src/
├── components/          # React 组件
│   ├── DevToolbox.tsx  # 工具箱主界面
│   ├── ToolWidget.tsx  # 工具小组件
│   ├── ToolDetail.tsx  # 工具详情视图
│   └── tools/          # 各个工具组件
├── config/             # 配置文件
├── stores/             # 状态管理
├── types/              # TypeScript 类型
└── App.tsx             # 主应用
```

## License

MIT
