# 📚 Moobi Reader - React 版本架构

## 🎯 技术栈

### 核心框架
- **React 18** - 最新的 React 版本，支持并发特性
- **TypeScript 5** - 类型安全，提升开发体验
- **Vite 6** - 极速的构建工具，HMR 毫秒级

### 状态管理
- **Zustand** - 轻量级状态管理（比 Redux 简单 90%）
  - 只有 ~1KB
  - 无需 Provider
  - 内置持久化
  - TypeScript 友好

### UI 框架
- **TailwindCSS** - 实用优先的 CSS 框架
  - 快速开发
  - 自动 tree-shaking
  - 响应式设计
- **Framer Motion** - 流畅的动画库
- **Lucide React** - 美观的图标库

### 文件处理
- **epubjs** - EPUB 阅读器核心
- **pdfjs-dist** - PDF 渲染引擎
- **jszip** - ZIP 文件处理

## 📁 项目结构

```
moobi-reader-react/
├── public/                  # 静态资源
├── src/
│   ├── components/          # React 组件
│   │   ├── common/          # 通用组件
│   │   │   ├── Button.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Toast.tsx
│   │   │   └── GlassPanel.tsx
│   │   ├── reader/          # 阅读器组件
│   │   │   ├── EpubReader.tsx
│   │   │   ├── PdfReader.tsx
│   │   │   ├── ReaderControls.tsx
│   │   │   └── ProgressBar.tsx
│   │   ├── panels/          # 侧边面板
│   │   │   ├── TocPanel.tsx
│   │   │   ├── BookmarksPanel.tsx
│   │   │   ├── SearchPanel.tsx
│   │   │   ├── SettingsPanel.tsx
│   │   │   └── StatsPanel.tsx
│   │   └── welcome/         # 欢迎页面
│   │       ├── WelcomeScreen.tsx
│   │       ├── FileUpload.tsx
│   │       ├── RecentFiles.tsx
│   │       └── FeatureCards.tsx
│   ├── stores/              # Zustand 状态管理
│   │   └── useBookStore.ts
│   ├── hooks/               # 自定义 Hooks
│   │   ├── useReader.ts
│   │   ├── useBookmarks.ts
│   │   ├── useSearch.ts
│   │   └── useKeyboard.ts
│   ├── types/               # TypeScript 类型
│   │   └── index.ts
│   ├── utils/               # 工具函数
│   │   ├── formatters.ts
│   │   ├── storage.ts
│   │   └── reader.ts
│   ├── pages/               # 页面组件
│   │   ├── Welcome.tsx
│   │   └── Reader.tsx
│   ├── App.tsx              # 主应用
│   ├── main.tsx             # 入口文件
│   └── index.css            # 全局样式
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

## 🏗️ 核心架构

### 1. 状态管理 (Zustand)

```typescript
// src/stores/useBookStore.ts
interface BookStore {
  // 状态
  bookshelf: Book[];
  currentBook: Book | null;
  bookmarks: Bookmark[];
  stats: ReadingStats;
  settings: Settings;

  // 操作方法
  addToBookshelf: (book: Book) => void;
  addBookmark: (bookmark: Bookmark) => void;
  updateSettings: (settings: Settings) => void;
}

// 使用
const { bookshelf, addToBookshelf } = useBookStore();
```

**优势：**
- ✅ 无需 Provider 包裹
- ✅ 自动持久化到 LocalStorage
- ✅ TypeScript 完美支持
- ✅ DevTools 支持

### 2. 组件化架构

#### 通用组件
```typescript
// src/components/common/GlassPanel.tsx
interface GlassPanelProps {
  children: React.ReactNode;
  className?: string;
  onClose?: () => void;
}

export const GlassPanel: React.FC<GlassPanelProps> = ({
  children,
  className,
  onClose
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 300 }}
      className={`glass fixed right-0 top-0 h-full ${className}`}
    >
      {children}
    </motion.div>
  );
};
```

#### 阅读器组件
```typescript
// src/components/reader/EpubReader.tsx
interface EpubReaderProps {
  file: File;
  onLoad: (book: Book) => void;
  onProgress: (progress: number) => void;
}

export const EpubReader: React.FC<EpubReaderProps> = ({
  file,
  onLoad,
  onProgress
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [rendition, setRendition] = useState(null);

  useEffect(() => {
    // 初始化 EPUB
    loadEpub(file, containerRef.current);
  }, [file]);

  return <div ref={containerRef} className="w-full h-full" />;
};
```

### 3. 自定义 Hooks

```typescript
// src/hooks/useReader.ts
export const useReader = () => {
  const { currentBook, settings } = useBookStore();
  const [currentPage, setCurrentPage] = useState(0);

  const nextPage = useCallback(() => {
    // 翻页逻辑
  }, [currentPage]);

  const prevPage = useCallback(() => {
    // 翻页逻辑
  }, [currentPage]);

  return {
    currentPage,
    nextPage,
    prevPage,
    settings,
  };
};

// 使用
const { currentPage, nextPage, prevPage } = useReader();
```

## 🎨 样式系统

### TailwindCSS 配置

```javascript
// tailwind.config.js
export default {
  theme: {
    extend: {
      colors: {
        primary: '#007AFF',
        secondary: '#5856D6',
      },
      backdropBlur: {
        '3xl': '40px',
      },
    },
  },
}
```

### 使用示例

```tsx
// 毛玻璃效果
<div className="glass backdrop-blur-3xl bg-white/10 rounded-3xl">
  {/* 内容 */}
</div>

// iOS 风格按钮
<button className="
  px-6 py-3 rounded-2xl
  bg-gradient-to-r from-primary to-secondary
  text-white font-semibold
  shadow-lg hover:shadow-xl
  transform hover:scale-105
  transition-all duration-300
">
  点击我
</button>
```

## 🔥 核心功能实现

### 1. 文件上传

```typescript
const handleFileUpload = async (file: File) => {
  const format = file.name.endsWith('.epub') ? 'epub' : 'pdf';

  const book: Book = {
    id: generateId(),
    title: file.name,
    author: 'Unknown',
    format,
    progress: 0,
    currentPage: 0,
    totalPages: 0,
    lastRead: new Date().toISOString(),
  };

  addToBookshelf(book);
  setCurrentBook(book);
};
```

### 2. 书签管理

```typescript
const handleAddBookmark = () => {
  const bookmark: Bookmark = {
    id: Date.now(),
    bookId: currentBook.id,
    bookTitle: currentBook.title,
    page: currentPage,
    totalPages: totalPages,
    timestamp: new Date().toISOString(),
    format: currentBook.format,
  };

  addBookmark(bookmark);
  toast.success('书签已添加');
};
```

### 3. 搜索功能

```typescript
const handleSearch = async (query: string) => {
  if (!epubBook) return;

  const results: SearchResult[] = [];

  for (const item of epubBook.spine.spineItems) {
    const doc = await item.load();
    const text = doc.textContent;

    // 搜索匹配
    const regex = new RegExp(query, 'gi');
    let match;

    while ((match = regex.exec(text)) !== null) {
      results.push({
        cfi: item.cfi,
        excerpt: text.substring(
          Math.max(0, match.index - 50),
          Math.min(text.length, match.index + query.length + 50)
        ),
        query,
      });
    }
  }

  setSearchResults(results);
};
```

## 🎯 路由管理（可选）

如果需要多页面：

```bash
npm install react-router-dom
```

```typescript
// App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/reader/:bookId" element={<Reader />} />
        <Route path="/library" element={<Library />} />
      </Routes>
    </BrowserRouter>
  );
}
```

## 📱 跨端扩展

### 移动端 (React Native)

```bash
# 创建 React Native 项目
npx react-native init MoobiReaderMobile --template react-native-template-typescript

# 共享代码
# - stores/ (完全复用)
# - types/ (完全复用)
# - hooks/ (大部分复用)
# - utils/ (完全复用)
```

### 桌面端 (Electron)

```bash
# 安装 Electron
npm install -D electron electron-builder

# 创建 electron/main.js
const { app, BrowserWindow } = require('electron');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    titleBarStyle: 'hiddenInset', // macOS 风格
  });

  win.loadURL('http://localhost:5173');
}

app.whenReady().then(createWindow);
```

### 桌面端 (Tauri - 更轻量)

```bash
# 安装 Tauri
npm install -D @tauri-apps/cli

# 初始化 Tauri
npx tauri init

# 打包
npm run tauri build
```

## 🚀 开发命令

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
```

## 🎨 样式组织

```
src/styles/
├── components/      # 组件样式
├── utilities/       # 工具类
└── themes/          # 主题变量
```

## 🧪 测试

```bash
# 安装测试工具
npm install -D vitest @testing-library/react @testing-library/jest-dom

# 运行测试
npm run test
```

```typescript
// src/components/__tests__/Button.test.tsx
import { render, screen } from '@testing-library/react';
import { Button } from '../Button';

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
});
```

## 📊 性能优化

### 1. 代码分割

```typescript
// 懒加载组件
const ReaderPage = lazy(() => import('./pages/Reader'));

<Suspense fallback={<Loading />}>
  <ReaderPage />
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
const BookCard = memo(({ book }: { book: Book }) => {
  return <div>{book.title}</div>;
});
```

## 🎯 优势对比

### 纯 HTML/CSS/JS vs React

| 特性 | 纯 Web | React |
|------|--------|-------|
| 开发速度 | 慢 | 快 3-5x |
| 维护性 | 低 | 高 |
| 类型安全 | 无 | 完整 |
| 组件复用 | 难 | 易 |
| 状态管理 | 手动 | 自动 |
| HMR | 无 | 有 |
| 性能优化 | 手动 | 自动 |
| 跨端能力 | 无 | 强 |
| 生态系统 | 小 | 巨大 |
| 打包优化 | 手动 | 自动 |

## 📚 推荐学习资源

1. **React 官方文档**: https://react.dev
2. **Zustand 文档**: https://github.com/pmndrs/zustand
3. **TailwindCSS**: https://tailwindcss.com
4. **TypeScript**: https://www.typescriptlang.org

## 🎉 下一步

1. 运行开发服务器： `npm run dev`
2. 访问： `http://localhost:5173`
3. 开始开发！

## 📝 注意事项

- ✅ 使用 TypeScript 获得类型安全
- ✅ 组件保持小而专注
- ✅ 使用自定义 Hooks 抽取逻辑
- ✅ 遵循 React 最佳实践
- ✅ 定期更新依赖
- ✅ 使用 ESLint 和 Prettier
