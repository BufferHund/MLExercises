# i18n Usage Guide

## 为新页面添加国际化支持

### 1. 在组件中导入 useTranslation

```typescript
import { useTranslation } from 'react-i18next';

export default function MyPage() {
  const { t } = useTranslation();
  // ...
}
```

### 2. 替换硬编码文本

**之前：**
```tsx
<Typography>欢迎</Typography>
<Button>提交</Button>
```

**之后：**
```tsx
<Typography>{t('welcome')}</Typography>
<Button>{t('common.submit')}</Button>
```

### 3. 使用插值变量

**在语言文件中：**
```json
{
  "greeting": "你好，{{name}}！",
  "itemCount": "共有 {{count}} 个道具"
}
```

**在组件中：**
```tsx
{t('greeting', { name: '张三' })}
{t('itemCount', { count: items.length })}
```

### 4. 添加语言切换器

在需要的地方添加：
```tsx
import LanguageSwitcher from '../components/LanguageSwitcher';

// 在组件中
<LanguageSwitcher />
```

### 5. 更新语言文件

在 `locales/zh-CN.json` 和 `locales/en-US.json` 中添加新的翻译键值对。

#### 推荐的组织结构：

```json
{
  "pageName": {
    "title": "页面标题",
    "subtitle": "副标题",
    "buttonAction": "操作按钮",
    "emptyState": "空状态提示"
  }
}
```

## 当前已翻译的区域

- ✅ app - 应用名称和品牌
- ✅ common - 通用UI元素
- ✅ role - 角色类型
- ✅ status - 状态
- ✅ join - 加入/创建游戏页面
- ✅ lobby - 游戏大厅（待实现）
- ✅ play - 游戏界面（待实现）
- ✅ capture - 捕捉机制（待实现）
- ✅ admin - 管理面板（待实现）
- ✅ item - 道具管理（待实现）
- ✅ error - 错误消息
- ✅ validation - 表单验证

## 支持的语言

- 🇨🇳 简体中文 (zh-CN)
- 🇺🇸 English (en-US)

## 添加新语言

1. 在 `locales/` 目录创建新的语言文件，如 `ja-JP.json`
2. 复制 `zh-CN.json` 内容并翻译所有值
3. 在 `config.ts` 中添加新语言资源：
   ```typescript
   import jaJP from './locales/ja-JP.json';

   const resources = {
     'zh-CN': { translation: zhCN },
     'en-US': { translation: enUS },
     'ja-JP': { translation: jaJP },
   };
   ```
4. 在 `LanguageSwitcher.tsx` 中添加语言选项：
   ```typescript
   { code: 'ja-JP', label: '日本語', flag: '🇯🇵' }
   ```

## 最佳实践

1. **保持翻译键名一致**：使用点分隔的命名空间（如 `page.section.element`）
2. **避免过度嵌套**：不要超过3层嵌套
3. **使用有意义的键名**：`button.submit` 而不是 `btn1`
4. **保持翻译文件同步**：添加新键时同时更新所有语言文件
5. **使用插值变量**：对于动态内容使用 `{{variable}}` 而不是字符串拼接
6. **测试所有语言**：确保切换语言后所有文本显示正确

## 常见问题

### Q: 如何处理复数形式？
A: 使用 i18next 的复数功能：
```json
{
  "item_one": "{{count}} 个道具",
  "item_other": "{{count}} 个道具"
}
```

### Q: 如何格式化日期？
A: 使用 JavaScript 原生的 Intl API：
```typescript
new Date().toLocaleString(i18n.language, {
  year: 'numeric',
  month: 'long',
  day: 'numeric'
});
```

### Q: 翻译键不存在会怎样？
A: i18next 会返回翻译键本身作为后备，并在控制台输出警告（开发模式）。
