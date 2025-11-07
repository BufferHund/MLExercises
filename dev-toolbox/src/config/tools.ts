import {
  Image,
  FileCode,
  Network,
  Lock,
  Binary,
  Type,
  Code2,
  Globe,
  Key,
  Repeat,
  FileText,
  Link,
  Clock,
  Palette,
  Search,
  Hash,
  MessageSquare,
  Table,
} from 'lucide-react';
import type { Tool, ToolCategory } from '../types/tools';

// 工具分类配置
export const toolCategories: Record<ToolCategory, { name: string; icon: any; color: string }> = {
  image: { name: '图片工具', icon: Image, color: 'from-purple-500 to-pink-500' },
  format: { name: '格式化&压缩', icon: FileCode, color: 'from-blue-500 to-cyan-500' },
  network: { name: '网络测试', icon: Network, color: 'from-green-500 to-emerald-500' },
  hash: { name: '哈希&密码', icon: Lock, color: 'from-orange-500 to-red-500' },
  conversion: { name: '进制转换', icon: Binary, color: 'from-indigo-500 to-purple-500' },
  string: { name: '字符串操作', icon: Type, color: 'from-pink-500 to-rose-500' },
  basic: { name: '基础工具', icon: Code2, color: 'from-cyan-500 to-blue-500' },
};

export const tools: Tool[] = [
  // 基础工具（原有的，免费）
  { id: 'json-formatter', name: 'JSON格式化', icon: Code2, color: 'from-blue-500 to-cyan-500', category: 'basic', description: '格式化' },
  { id: 'base64', name: 'Base64', icon: Binary, color: 'from-purple-500 to-pink-500', category: 'basic', description: '编解码' },
  { id: 'url-encoder', name: 'URL编码', icon: Link, color: 'from-green-500 to-emerald-500', category: 'basic', description: '编解码' },
  { id: 'timestamp', name: '时间戳', icon: Clock, color: 'from-orange-500 to-red-500', category: 'basic', description: '转换' },
  { id: 'color-converter', name: '颜色转换', icon: Palette, color: 'from-pink-500 to-rose-500', category: 'basic', description: '转换' },
  { id: 'regex-tester', name: '正则测试', icon: Search, color: 'from-indigo-500 to-blue-500', category: 'basic', description: '测试' },
  { id: 'token-counter', name: 'Token计数', icon: Hash, color: 'from-violet-500 to-purple-500', category: 'basic', description: '计数' },
  { id: 'prompt-template', name: '提示词模板', icon: MessageSquare, color: 'from-cyan-500 to-teal-500', category: 'basic', description: '模板' },
  { id: 'markdown-preview', name: 'Markdown预览', icon: FileText, color: 'from-emerald-500 to-green-500', category: 'basic', description: '预览' },
  { id: 'csv-to-json', name: 'CSV转JSON', icon: Table, color: 'from-amber-500 to-orange-500', category: 'basic', description: '转换' },
  { id: 'uuid-generator', name: 'UUID生成', icon: Key, color: 'from-rose-500 to-pink-500', category: 'basic', description: '生成' },
  { id: 'hash-calculator', name: 'SHA256', icon: Lock, color: 'from-slate-500 to-gray-500', category: 'basic', description: '计算' },

  // 图片工具（付费功能示例）
  { id: 'compress-jpeg', name: 'JPEG压缩', icon: Image, color: 'from-purple-500 to-pink-500', category: 'image', description: '压缩图片', isPremium: true },
  { id: 'compress-png', name: 'PNG压缩', icon: Image, color: 'from-pink-500 to-rose-500', category: 'image', description: '压缩图片', isPremium: true },
  { id: 'image-to-base64', name: '图片转Base64', icon: Image, color: 'from-indigo-500 to-purple-500', category: 'image', description: '转换', isPremium: true },

  // 格式化工具（示例）
  { id: 'xml-format', name: 'XML格式化', icon: FileCode, color: 'from-green-500 to-emerald-500', category: 'format', description: '格式化', isPremium: true },
  { id: 'html-format', name: 'HTML格式化', icon: FileCode, color: 'from-orange-500 to-red-500', category: 'format', description: '格式化', isPremium: true },
  { id: 'css-format', name: 'CSS格式化', icon: FileCode, color: 'from-blue-500 to-indigo-500', category: 'format', description: '格式化', isPremium: true },

  // 网络测试工具（示例）
  { id: 'my-ip', name: 'IP查询', icon: Network, color: 'from-green-500 to-emerald-500', category: 'network', description: '查询IP' },
  { id: 'ping-test', name: 'Ping测试', icon: Network, color: 'from-teal-500 to-cyan-500', category: 'network', description: '网络检测', isPremium: true },
  { id: 'dns-query', name: 'DNS查询', icon: Globe, color: 'from-emerald-500 to-green-500', category: 'network', description: '域名查询', isPremium: true },

  // 哈希&密码工具（示例）
  { id: 'md5', name: 'MD5加密', icon: Lock, color: 'from-orange-500 to-red-500', category: 'hash', description: '哈希' },
  { id: 'sha1', name: 'SHA1加密', icon: Lock, color: 'from-red-500 to-pink-500', category: 'hash', description: '哈希' },
  { id: 'password-gen', name: '随机密码', icon: Key, color: 'from-amber-500 to-orange-500', category: 'hash', description: '生成', isPremium: true },

  // 进制转换工具（示例）
  { id: 'hex-to-dec', name: '16转10进制', icon: Repeat, color: 'from-indigo-500 to-blue-500', category: 'conversion', description: '转换' },
  { id: 'dec-to-hex', name: '10转16进制', icon: Repeat, color: 'from-blue-500 to-cyan-500', category: 'conversion', description: '转换' },
  { id: 'bin-to-dec', name: '2转10进制', icon: Binary, color: 'from-violet-500 to-purple-500', category: 'conversion', description: '转换', isPremium: true },

  // 字符串操作工具（示例）
  { id: 'text-editor', name: '文本编辑', icon: FileText, color: 'from-pink-500 to-rose-500', category: 'string', description: '编辑' },
  { id: 'word-count', name: '单词统计', icon: Type, color: 'from-purple-500 to-pink-500', category: 'string', description: '统计', isPremium: true },
  { id: 'case-convert', name: '大小写转换', icon: Type, color: 'from-rose-500 to-red-500', category: 'string', description: '转换' },
];
