# 📚 Moobi Reader - React 版本

> 使用现代化跨端框架重构的专业电子书阅读器

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 启动开发服务器

```bash
npm run dev
```

### 3. 打开浏览器

访问 `http://localhost:5173`

## 🎯 技术栈

### 前端框架
- **React 18** - 最新的 React
- **TypeScript 5** - 类型安全
- **Vite 6** - 极速构建工具

### 状态管理
- **Zustand** - 轻量级全局状态管理
  - 比 Redux 简单 90%
  - 只有 ~1KB
  - 自动持久化

### UI 框架
- **TailwindCSS** - 实用优先的 CSS
- **Framer Motion** - 流畅动画
- **Lucide React** - 现代图标库

### 核心库
- **epubjs** - EPUB 阅读器
- **pdfjs-dist** - PDF 渲染
- **jszip** - ZIP 文件处理

## 📁 项目结构

```
src/
├── components/       # React 组件
│   ├── common/       # 通用组件（按钮、面板等）
│   ├── reader/       # 阅读器组件
│   ├── panels/       # 侧边面板
│   └── welcome/      # 欢迎页面
├── stores/           # Zustand 状态管理
├── hooks/            # 自定义 Hooks
├── types/            # TypeScript 类型定义
├── utils/            # 工具函数
├── pages/            # 页面组件
├── App.tsx           # 主应用
└── main.tsx          # 入口文件
```

## ✨ 核心优势

### 与纯 HTML 版本对比

| 特性 | HTML 版本 | React 版本 |
|------|----------|-----------|
| 开发速度 | ⚪⚪⚫⚫⚫ | ⚪⚪⚪⚪⚪ |
| 维护性 | ⚪⚪⚫⚫⚫ | ⚪⚪⚪⚪⚪ |
| 类型安全 | ❌ | ✅ TypeScript |
| 组件复用 | 难 | 易 |
| 状态管理 | 手动 | 自动（Zustand）|
| 热更新 | ❌ | ✅ HMR |
| 代码分割 | 手动 | 自动 |
| 跨端能力 | 仅 Web | Web + Mobile + Desktop |
| 测试 | 困难 | 简单 |
| 性能优化 | 手动 | 自动 |

### React 版本的优势

#### 1. 🎨 更好的开发体验
```typescript
// ✅ TypeScript 类型安全
const book: Book = {
  id: '123',
  title: '示例书籍',
  // 自动补全 + 类型检查
};

// ✅ 组件化开发
<BookCard book={book} onSelect={handleSelect} />

// ✅ 自定义 Hooks
const { currentPage, nextPage } = useReader();
```

#### 2. 🔄 强大的状态管理
```typescript
// Zustand - 简单高效
const { bookshelf, addToBookshelf } = useBookStore();

// 自动持久化到 LocalStorage
// 无需手动 JSON.parse/stringify
```

#### 3. 🎯 更好的性能
```typescript
// 虚拟列表 - 渲染海量数据
<VirtualList items={books} />

// 懒加载 - 按需加载组件
const Reader = lazy(() => import('./Reader'));

// Memo - 避免不必要的重渲染
const BookCard = memo(({ book }) => ...);
```

#### 4. 📱 跨平台能力

**Web (当前)**
```bash
npm run build  # 打包为静态网站
```

**移动端 (React Native)**
```bash
# 复用 90% 代码
npx react-native init MoobiMobile
# 共享 stores/, hooks/, types/, utils/
```

**桌面端 (Electron)**
```bash
npm install -D electron
# 打包为桌面应用
npm run build:electron
```

**桌面端 (Tauri - 更轻量)**
```bash
npm install -D @tauri-apps/cli
# 比 Electron 小 90%
npm run tauri build
```

## 🛠️ 开发命令

```bash
# 开发模式 (带 HMR)
npm run dev

# 构建生产版本
npm run build

# 预览生产版本
npm run preview

# 类型检查
npm run type-check

# Lint
npm run lint

# 格式化代码
npm run format
```

## 📚 核心功能示例

### 1. 状态管理 (Zustand)

```typescript
// stores/useBookStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useBookStore = create(
  persist(
    (set) => ({
      bookshelf: [],
      addBook: (book) => set((state) => ({
        bookshelf: [...state.bookshelf, book]
      })),
    }),
    { name: 'moobi-storage' }
  )
);

// 使用
function MyComponent() {
  const { bookshelf, addBook } = useBookStore();
  return <div>{bookshelf.length} books</div>;
}
```

### 2. 自定义 Hooks

```typescript
// hooks/useReader.ts
export const useReader = (bookId: string) => {
  const [currentPage, setCurrentPage] = useState(0);

  const nextPage = useCallback(() => {
    setCurrentPage(p => p + 1);
  }, []);

  return { currentPage, nextPage };
};

// 使用
function Reader() {
  const { currentPage, nextPage } = useReader('book-123');
  return <button onClick={nextPage}>Next</button>;
}
```

### 3. 组件化

```typescript
// components/common/Button.tsx
interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'primary'
}) => {
  return (
    <button
      onClick={onClick}
      className={`
        px-6 py-3 rounded-2xl font-semibold
        transition-all duration-300
        ${variant === 'primary'
          ? 'bg-gradient-to-r from-primary to-secondary'
          : 'bg-white/10'
        }
      `}
    >
      {children}
    </button>
  );
};
```

## 🎨 样式系统

### TailwindCSS

```jsx
// 毛玻璃效果
<div className="glass backdrop-blur-3xl bg-white/10 rounded-3xl">
  {/* 内容 */}
</div>

// 渐变按钮
<button className="bg-gradient-to-r from-primary to-secondary">
  点击
</button>

// 动画
<div className="animate-slide-up hover:scale-105 transition-all">
  {/* 内容 */}
</div>
```

### Framer Motion

```jsx
import { motion } from 'framer-motion';

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -20 }}
>
  {/* 内容 */}
</motion.div>
```

## 📱 跨端扩展路径

### Web → Mobile

```bash
# 1. 创建 React Native 项目
npx react-native init MoobiMobile --template react-native-template-typescript

# 2. 复制共享代码
cp -r src/stores ../MoobiMobile/src/
cp -r src/hooks ../MoobiMobile/src/
cp -r src/types ../MoobiMobile/src/
cp -r src/utils ../MoobiMobile/src/

# 3. 重写 UI 层（使用 React Native 组件）
# - View 替代 div
# - Text 替代 span
# - TouchableOpacity 替代 button

# 4. 运行
npx react-native run-ios
npx react-native run-android
```

### Web → Desktop (Electron)

```bash
# 1. 安装 Electron
npm install -D electron electron-builder

# 2. 创建 electron/main.js
const { app, BrowserWindow } = require('electron');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    titleBarStyle: 'hiddenInset', // macOS 风格
  });

  win.loadFile('dist/index.html');
}

app.whenReady().then(createWindow);

# 3. 打包
npm run build
electron-builder
```

### Web → Desktop (Tauri)

```bash
# 1. 安装 Tauri（更轻量，基于 Rust）
npm install -D @tauri-apps/cli

# 2. 初始化
npx tauri init

# 3. 打包（生成的文件比 Electron 小 10-20MB）
npm run tauri build

# macOS 上生成 .dmg
# Windows 上生成 .exe
# Linux 上生成 .deb/.appimage
```

## 🧪 测试

```bash
# 安装测试工具
npm install -D vitest @testing-library/react @testing-library/jest-dom

# 运行测试
npm run test
```

```typescript
// __tests__/BookCard.test.tsx
import { render, screen } from '@testing-library/react';
import { BookCard } from './BookCard';

describe('BookCard', () => {
  it('renders book title', () => {
    const book = { id: '1', title: 'Test Book' };
    render(<BookCard book={book} />);
    expect(screen.getByText('Test Book')).toBeInTheDocument();
  });
});
```

## 📊 性能优化

### 1. 代码分割
```typescript
import { lazy, Suspense } from 'react';

const Reader = lazy(() => import('./pages/Reader'));

<Suspense fallback={<Loading />}>
  <Reader />
</Suspense>
```

### 2. 虚拟列表
```bash
npm install react-window
```

```typescript
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={600}
  itemCount={bookshelf.length}
  itemSize={80}
>
  {({ index, style }) => (
    <BookItem book={bookshelf[index]} style={style} />
  )}
</FixedSizeList>
```

### 3. Memo 优化
```typescript
const BookCard = memo(({ book }) => {
  return <div>{book.title}</div>;
});
```

## 📖 学习资源

- [React 官方文档](https://react.dev)
- [TypeScript 官方文档](https://www.typescriptlang.org)
- [Zustand 文档](https://github.com/pmndrs/zustand)
- [TailwindCSS 文档](https://tailwindcss.com)
- [Vite 文档](https://vitejs.dev)

## 🎯 开发规范

### TypeScript
- ✅ 使用类型定义
- ✅ 避免 any
- ✅ 使用接口和类型别名

### React
- ✅ 函数组件 + Hooks
- ✅ 组件保持小而专注
- ✅ 使用 memo 优化性能
- ✅ 自定义 Hooks 抽取逻辑

### 样式
- ✅ 使用 TailwindCSS
- ✅ 遵循设计系统
- ✅ 响应式设计

## 🚀 部署

### Vercel (推荐)
```bash
npm install -g vercel
vercel
```

### Netlify
```bash
npm run build
netlify deploy --dir=dist --prod
```

### GitHub Pages
```bash
npm run build
# 部署 dist/ 目录
```

## 📝 下一步

1. ✅ 阅读 `REACT_ARCHITECTURE.md` 了解详细架构
2. ✅ 参考 `src/App.tsx` 了解基本用法
3. ✅ 实现完整的阅读器组件
4. ✅ 添加更多功能
5. ✅ 跨平台扩展

## 💡 为什么选择 React？

1. **生态系统最大** - 最多的库和工具
2. **社区最活跃** - 遇到问题容易找到答案
3. **跨平台能力强** - React Native 成熟度高
4. **性能优秀** - 虚拟 DOM + Fiber 架构
5. **开发体验好** - TypeScript + HMR + DevTools
6. **企业级应用** - Facebook、Netflix、Airbnb 都在用
7. **学习资源多** - 教程、课程、书籍丰富
8. **招聘需求大** - 职业发展前景好

## 🎉 总结

React 版本相比纯 HTML 版本的优势：

✅ **开发效率提升 3-5 倍**
✅ **代码可维护性提升 10 倍**
✅ **类型安全 - 减少 90% 的低级错误**
✅ **组件复用 - DRY 原则**
✅ **自动化优化 - 不用手动管理**
✅ **跨平台能力 - 一份代码多端运行**
✅ **现代化工具链 - HMR、DevTools、Linting**
✅ **生态系统 - 海量现成轮子**

**开始你的 React 之旅吧！** 🚀
