# 📚 Moobi Reader

一款现代化的电子书阅读器 Web 应用，支持 EPUB 和 PDF 格式，采用 iOS 风格设计。

![Moobi Reader](https://img.shields.io/badge/Version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/License-MIT-green.svg)

## ✨ 特性

### 📖 文件格式支持
- ✅ **EPUB** - 完整支持 EPUB 格式电子书
- ✅ **PDF** - 支持 PDF 文件阅读

### 🎨 设计特色
- 💎 **毛玻璃效果** (Glassmorphism) - 现代化的透明玻璃设计
- 🔵 **大量圆角** - 符合 iOS 设计规范的圆润外观
- 🌈 **动态渐变背景** - 流畅的动画效果
- 🎭 **多主题支持** - 深色、浅色、护眼三种主题

### ⚙️ 阅读功能
- 📝 字体大小调节 (12px - 28px)
- 📏 行间距调节
- ⌨️ 键盘快捷键支持
- 📊 阅读进度显示
- 🔖 页面导航

## 🚀 快速开始

### 在线使用

1. **下载项目**
   ```bash
   git clone <repository-url>
   cd moobi-reader
   ```

2. **打开应用**
   - 使用任何现代浏览器打开 `index.html`
   - 或使用本地服务器:
     ```bash
     # 使用 Python
     python -m http.server 8000

     # 使用 Node.js (需要安装 http-server)
     npx http-server -p 8000
     ```

3. **开始阅读**
   - 点击"选择文件"按钮
   - 选择 EPUB 或 PDF 文件
   - 享受阅读！

## 🎮 使用说明

### 上传文件
1. 在欢迎界面点击"选择文件"按钮
2. 选择 `.epub` 或 `.pdf` 格式的文件
3. 文件将自动加载并显示

### 导航控制
- **翻页**: 使用底部的左右箭头按钮
- **跳转**: 拖动进度条到指定位置
- **键盘快捷键**:
  - `←` / `→` - 上一页 / 下一页
  - `ESC` - 返回主界面或关闭设置

### 阅读设置
1. 点击右上角的设置按钮 (⚙️)
2. 调整以下选项:
   - **字体大小**: 拖动滑块调整
   - **主题**: 选择浅色、深色或护眼模式
   - **行间距**: 调整行与行之间的距离

## 📁 项目结构

```
moobi-reader/
├── index.html          # 主 HTML 文件
├── css/
│   └── style.css       # 样式文件 (包含 iOS 风格设计)
├── js/
│   └── app.js          # 主应用逻辑
├── assets/             # 资源文件夹 (图标、图片等)
└── README.md           # 项目说明文档
```

## 🛠️ 技术栈

- **前端框架**: 纯 HTML5 + CSS3 + JavaScript (ES6+)
- **EPUB 支持**: [epub.js](https://github.com/futurepress/epub.js/)
- **PDF 支持**: [PDF.js](https://mozilla.github.io/pdf.js/)
- **设计风格**: iOS-inspired Glassmorphism

## 🎨 设计亮点

### 毛玻璃效果 (Glassmorphism)
```css
backdrop-filter: blur(40px);
background: rgba(255, 255, 255, 0.1);
border: 1px solid rgba(255, 255, 255, 0.2);
```

### 圆角设计
- 小圆角: 12px
- 中圆角: 20px
- 大圆角: 28px
- 超大圆角: 36px

### 动画效果
- 页面切换动画
- 按钮悬停效果
- 背景渐变动画
- 图标浮动效果

## ⌨️ 键盘快捷键

| 快捷键 | 功能 |
|--------|------|
| `←` | 上一页 |
| `→` | 下一页 |
| `ESC` | 返回主界面 / 关闭设置 |

## 🌐 浏览器兼容性

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

## 📝 待实现功能

- [ ] 书签功能
- [ ] 笔记和高亮
- [ ] 全文搜索
- [ ] 图书管理库
- [ ] 阅读统计
- [ ] 云同步

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 👨‍💻 作者

Moobi Reader Team

---

**享受阅读，享受生活！** 📖✨
