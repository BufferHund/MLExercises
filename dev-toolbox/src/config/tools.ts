import {
  Image, FileCode, Network, Lock, Binary, Type, Code2, Globe, Key, Repeat, FileText,
  Link, Clock, Palette, Search, Hash, MessageSquare, Table, Shield, Wifi, Database,
  FileJson, FileType, Code, Minimize, Eye, EyeOff, Calculator, RefreshCw,
  ChevronRight, RotateCw
} from 'lucide-react';
import type { Tool, ToolCategory } from '../types/tools';

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
  // ========== 基础工具 (12个 - 免费) ==========
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

  // ========== 图片工具 (6个 - 付费) ==========
  { id: 'compress-jpeg', name: 'JPEG压缩', icon: Image, color: 'from-purple-500 to-pink-500', category: 'image', description: '压缩', isPremium: true },
  { id: 'compress-png', name: 'PNG压缩', icon: Image, color: 'from-pink-500 to-rose-500', category: 'image', description: '压缩', isPremium: true },
  { id: 'progressive-jpeg', name: '渐进式JPEG', icon: Image, color: 'from-violet-500 to-purple-500', category: 'image', description: '转换', isPremium: true },
  { id: 'image-to-base64', name: '图片转Base64', icon: Image, color: 'from-indigo-500 to-purple-500', category: 'image', description: '转换', isPremium: true },
  { id: 'exif-viewer', name: 'EXIF查看', icon: Eye, color: 'from-blue-500 to-cyan-500', category: 'image', description: '查看', isPremium: true },
  { id: 'exif-remover', name: 'EXIF删除', icon: EyeOff, color: 'from-red-500 to-pink-500', category: 'image', description: '删除', isPremium: true },

  // ========== 格式化&压缩 (14个) ==========
  { id: 'json-format', name: 'JSON格式化', icon: FileJson, color: 'from-blue-500 to-cyan-500', category: 'format', description: '格式化' },
  { id: 'json-compress', name: 'JSON压缩', icon: Minimize, color: 'from-cyan-500 to-teal-500', category: 'format', description: '压缩' },
  { id: 'xml-format', name: 'XML格式化', icon: FileCode, color: 'from-green-500 to-emerald-500', category: 'format', description: '格式化', isPremium: true },
  { id: 'xml-compress', name: 'XML压缩', icon: FileCode, color: 'from-emerald-500 to-teal-500', category: 'format', description: '压缩', isPremium: true },
  { id: 'json-to-xml', name: 'JSON转XML', icon: RefreshCw, color: 'from-blue-500 to-green-500', category: 'format', description: '转换', isPremium: true },
  { id: 'xml-to-json', name: 'XML转JSON', icon: RefreshCw, color: 'from-green-500 to-blue-500', category: 'format', description: '转换', isPremium: true },
  { id: 'html-format', name: 'HTML格式化', icon: Code, color: 'from-orange-500 to-red-500', category: 'format', description: '格式化', isPremium: true },
  { id: 'html-compress', name: 'HTML压缩', icon: Minimize, color: 'from-red-500 to-pink-500', category: 'format', description: '压缩', isPremium: true },
  { id: 'js-format', name: 'JS格式化', icon: FileType, color: 'from-yellow-500 to-orange-500', category: 'format', description: '格式化', isPremium: true },
  { id: 'js-compress', name: 'JS压缩', icon: Minimize, color: 'from-orange-500 to-red-500', category: 'format', description: '压缩', isPremium: true },
  { id: 'css-format', name: 'CSS格式化', icon: Palette, color: 'from-blue-500 to-indigo-500', category: 'format', description: '格式化', isPremium: true },
  { id: 'css-compress', name: 'CSS压缩', icon: Minimize, color: 'from-indigo-500 to-purple-500', category: 'format', description: '压缩', isPremium: true },
  { id: 'sql-format', name: 'SQL格式化', icon: Database, color: 'from-cyan-500 to-blue-500', category: 'format', description: '格式化', isPremium: true },
  { id: 'sql-compress', name: 'SQL压缩', icon: Minimize, color: 'from-blue-500 to-indigo-500', category: 'format', description: '压缩', isPremium: true },

  // ========== 网络测试 (8个) ==========
  { id: 'my-ip', name: 'IP查询', icon: Network, color: 'from-green-500 to-emerald-500', category: 'network', description: '查询IP' },
  { id: 'ping-test', name: 'Ping测试', icon: Wifi, color: 'from-teal-500 to-cyan-500', category: 'network', description: '检测', isPremium: true },
  { id: 'dns-query', name: 'DNS查询', icon: Globe, color: 'from-emerald-500 to-green-500', category: 'network', description: '查询', isPremium: true },
  { id: 'traceroute', name: '路由追踪', icon: ChevronRight, color: 'from-blue-500 to-cyan-500', category: 'network', description: '追踪', isPremium: true },
  { id: 'whois', name: 'Whois查询', icon: Search, color: 'from-purple-500 to-pink-500', category: 'network', description: '域名', isPremium: true },
  { id: 'port-check', name: '端口检测', icon: Shield, color: 'from-orange-500 to-red-500', category: 'network', description: '检测', isPremium: true },
  { id: 'url-encode', name: 'URL编码', icon: Link, color: 'from-green-500 to-emerald-500', category: 'network', description: '编码' },
  { id: 'url-decode', name: 'URL解码', icon: Link, color: 'from-emerald-500 to-teal-500', category: 'network', description: '解码' },

  // ========== 哈希&密码 (9个) ==========
  { id: 'md5', name: 'MD5加密', icon: Lock, color: 'from-orange-500 to-red-500', category: 'hash', description: '哈希' },
  { id: 'sha1', name: 'SHA1加密', icon: Lock, color: 'from-red-500 to-pink-500', category: 'hash', description: '哈希' },
  { id: 'sha224', name: 'SHA224加密', icon: Lock, color: 'from-pink-500 to-purple-500', category: 'hash', description: '哈希', isPremium: true },
  { id: 'sha256', name: 'SHA256加密', icon: Lock, color: 'from-purple-500 to-indigo-500', category: 'hash', description: '哈希' },
  { id: 'sha384', name: 'SHA384加密', icon: Lock, color: 'from-indigo-500 to-blue-500', category: 'hash', description: '哈希', isPremium: true },
  { id: 'sha512', name: 'SHA512加密', icon: Lock, color: 'from-blue-500 to-cyan-500', category: 'hash', description: '哈希', isPremium: true },
  { id: 'base64-encode', name: 'Base64编码', icon: Binary, color: 'from-cyan-500 to-teal-500', category: 'hash', description: '编码' },
  { id: 'base64-decode', name: 'Base64解码', icon: Binary, color: 'from-teal-500 to-green-500', category: 'hash', description: '解码' },
  { id: 'password-gen', name: '随机密码', icon: Key, color: 'from-amber-500 to-orange-500', category: 'hash', description: '生成', isPremium: true },

  // ========== 进制转换 (20个精选) ==========
  { id: 'hex-to-dec', name: '16转10进制', icon: Repeat, color: 'from-indigo-500 to-blue-500', category: 'conversion', description: '转换' },
  { id: 'dec-to-hex', name: '10转16进制', icon: Repeat, color: 'from-blue-500 to-cyan-500', category: 'conversion', description: '转换' },
  { id: 'oct-to-dec', name: '8转10进制', icon: Repeat, color: 'from-cyan-500 to-teal-500', category: 'conversion', description: '转换', isPremium: true },
  { id: 'dec-to-oct', name: '10转8进制', icon: Repeat, color: 'from-teal-500 to-green-500', category: 'conversion', description: '转换', isPremium: true },
  { id: 'bin-to-dec', name: '2转10进制', icon: Binary, color: 'from-violet-500 to-purple-500', category: 'conversion', description: '转换' },
  { id: 'dec-to-bin', name: '10转2进制', icon: Binary, color: 'from-purple-500 to-pink-500', category: 'conversion', description: '转换' },
  { id: 'bin-to-hex', name: '2转16进制', icon: Binary, color: 'from-pink-500 to-red-500', category: 'conversion', description: '转换', isPremium: true },
  { id: 'hex-to-bin', name: '16转2进制', icon: Binary, color: 'from-red-500 to-orange-500', category: 'conversion', description: '转换', isPremium: true },
  { id: 'ascii-table', name: 'ASCII表', icon: Table, color: 'from-amber-500 to-yellow-500', category: 'conversion', description: '查询' },
  { id: 'hex-to-ascii', name: '16进制转ASCII', icon: Type, color: 'from-yellow-500 to-green-500', category: 'conversion', description: '转换', isPremium: true },
  { id: 'ascii-to-hex', name: 'ASCII转16进制', icon: Type, color: 'from-green-500 to-emerald-500', category: 'conversion', description: '转换', isPremium: true },
  { id: 'hex-color-to-rgb', name: 'Hex转RGB', icon: Palette, color: 'from-pink-500 to-purple-500', category: 'conversion', description: '颜色' },
  { id: 'rgb-to-hex-color', name: 'RGB转Hex', icon: Palette, color: 'from-purple-500 to-indigo-500', category: 'conversion', description: '颜色' },
  { id: 'fraction-to-decimal', name: '分数转小数', icon: Calculator, color: 'from-blue-500 to-cyan-500', category: 'conversion', description: '转换', isPremium: true },
  { id: 'decimal-to-fraction', name: '小数转分数', icon: Calculator, color: 'from-cyan-500 to-teal-500', category: 'conversion', description: '转换', isPremium: true },
  { id: 'percent-to-decimal', name: '百分比转小数', icon: Calculator, color: 'from-teal-500 to-green-500', category: 'conversion', description: '转换', isPremium: true },
  { id: 'decimal-to-percent', name: '小数转百分比', icon: Calculator, color: 'from-green-500 to-emerald-500', category: 'conversion', description: '转换', isPremium: true },
  { id: 'roman-table', name: '罗马数字表', icon: Table, color: 'from-orange-500 to-red-500', category: 'conversion', description: '查询' },
  { id: 'roman-to-number', name: '罗马转阿拉伯', icon: Repeat, color: 'from-red-500 to-pink-500', category: 'conversion', description: '转换', isPremium: true },
  { id: 'number-to-roman', name: '阿拉伯转罗马', icon: Repeat, color: 'from-pink-500 to-purple-500', category: 'conversion', description: '转换', isPremium: true },

  // ========== 字符串操作 (7个) ==========
  { id: 'text-editor', name: '文本编辑器', icon: FileText, color: 'from-pink-500 to-rose-500', category: 'string', description: '编辑' },
  { id: 'regex-test', name: '正则测试', icon: Search, color: 'from-rose-500 to-red-500', category: 'string', description: '测试' },
  { id: 'regex-replace', name: '正则替换', icon: RefreshCw, color: 'from-red-500 to-orange-500', category: 'string', description: '替换', isPremium: true },
  { id: 'word-count', name: '单词统计', icon: Hash, color: 'from-purple-500 to-pink-500', category: 'string', description: '统计' },
  { id: 'char-count', name: '字符统计', icon: Hash, color: 'from-blue-500 to-indigo-500', category: 'string', description: '统计' },
  { id: 'case-convert', name: '大小写转换', icon: Type, color: 'from-indigo-500 to-purple-500', category: 'string', description: '转换' },
  { id: 'string-reverse', name: '字符串翻转', icon: RotateCw, color: 'from-cyan-500 to-blue-500', category: 'string', description: '翻转', isPremium: true },
];
