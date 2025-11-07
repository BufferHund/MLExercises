import { X } from 'lucide-react';
import type { ToolId } from '../types/tools';
import { tools } from '../config/tools';
import JsonFormatter from './tools/JsonFormatter';
import Base64Tool from './tools/Base64Tool';
import UrlEncoder from './tools/UrlEncoder';
import TimestampConverter from './tools/TimestampConverter';
import ColorConverter from './tools/ColorConverter';
import RegexTester from './tools/RegexTester';
import TokenCounter from './tools/TokenCounter';
import PromptTemplate from './tools/PromptTemplate';
import MarkdownPreview from './tools/MarkdownPreview';
import CsvToJson from './tools/CsvToJson';
import UuidGenerator from './tools/UuidGenerator';
import HashCalculator from './tools/HashCalculator';
import CompressJpeg from './tools/CompressJpeg';
import CompressPng from './tools/CompressPng';
import ProgressiveJpeg from './tools/ProgressiveJpeg';
import ImageToBase64 from './tools/ImageToBase64';
import ExifViewer from './tools/ExifViewer';
import ExifRemover from './tools/ExifRemover';
import XmlFormatter from './tools/XmlFormatter';
import HtmlFormatter from './tools/HtmlFormatter';
import ComingSoon from './tools/ComingSoon';

interface ToolDetailProps {
  toolId: ToolId;
  onClose: () => void;
}

export default function ToolDetail({ toolId, onClose }: ToolDetailProps) {
  const tool = tools.find((t) => t.id === toolId);

  if (!tool) return null;

  const renderTool = () => {
    switch (toolId) {
      case 'json-formatter':
        return <JsonFormatter />;
      case 'base64':
        return <Base64Tool />;
      case 'url-encoder':
        return <UrlEncoder />;
      case 'timestamp':
        return <TimestampConverter />;
      case 'color-converter':
        return <ColorConverter />;
      case 'regex-tester':
        return <RegexTester />;
      case 'token-counter':
        return <TokenCounter />;
      case 'prompt-template':
        return <PromptTemplate />;
      case 'markdown-preview':
        return <MarkdownPreview />;
      case 'csv-to-json':
        return <CsvToJson />;
      case 'uuid-generator':
        return <UuidGenerator />;
      case 'hash-calculator':
        return <HashCalculator />;
      // Image tools
      case 'compress-jpeg':
        return <CompressJpeg />;
      case 'compress-png':
        return <CompressPng />;
      case 'progressive-jpeg':
        return <ProgressiveJpeg />;
      case 'image-to-base64':
        return <ImageToBase64 />;
      case 'exif-viewer':
        return <ExifViewer />;
      case 'exif-remover':
        return <ExifRemover />;
      // Format tools
      case 'json-format':
        return <JsonFormatter />;
      case 'json-compress':
        return <ComingSoon toolName="JSON压缩" description="压缩JSON代码，移除空格和换行" />;
      case 'xml-format':
        return <XmlFormatter />;
      case 'xml-compress':
        return <ComingSoon toolName="XML压缩" description="压缩XML代码" />;
      case 'json-to-xml':
        return <ComingSoon toolName="JSON转XML" description="将JSON转换为XML格式" />;
      case 'xml-to-json':
        return <ComingSoon toolName="XML转JSON" description="将XML转换为JSON格式" />;
      case 'html-format':
        return <HtmlFormatter />;
      case 'html-compress':
        return <ComingSoon toolName="HTML压缩" description="压缩HTML代码" />;
      case 'js-format':
        return <ComingSoon toolName="JS格式化" description="格式化JavaScript代码" />;
      case 'js-compress':
        return <ComingSoon toolName="JS压缩" description="压缩JavaScript代码" />;
      case 'css-format':
        return <ComingSoon toolName="CSS格式化" description="格式化CSS代码" />;
      case 'css-compress':
        return <ComingSoon toolName="CSS压缩" description="压缩CSS代码" />;
      case 'sql-format':
        return <ComingSoon toolName="SQL格式化" description="格式化SQL语句" />;
      case 'sql-compress':
        return <ComingSoon toolName="SQL压缩" description="压缩SQL语句" />;
      // Network tools
      case 'my-ip':
        return <ComingSoon toolName="IP查询" description="查询您的公网IP地址" />;
      case 'ping-test':
        return <ComingSoon toolName="Ping测试" description="测试网络连接" />;
      case 'dns-query':
        return <ComingSoon toolName="DNS查询" description="查询域名DNS记录" />;
      case 'traceroute':
        return <ComingSoon toolName="路由追踪" description="追踪网络路由" />;
      case 'whois':
        return <ComingSoon toolName="Whois查询" description="查询域名注册信息" />;
      case 'port-check':
        return <ComingSoon toolName="端口检测" description="检测端口是否开放" />;
      case 'url-encode':
        return <UrlEncoder />;
      case 'url-decode':
        return <UrlEncoder />;
      // Hash tools
      case 'md5':
        return <ComingSoon toolName="MD5加密" description="生成MD5哈希值" />;
      case 'sha1':
        return <ComingSoon toolName="SHA1加密" description="生成SHA1哈希值" />;
      case 'sha224':
        return <ComingSoon toolName="SHA224加密" description="生成SHA224哈希值" />;
      case 'sha256':
        return <HashCalculator />;
      case 'sha384':
        return <ComingSoon toolName="SHA384加密" description="生成SHA384哈希值" />;
      case 'sha512':
        return <ComingSoon toolName="SHA512加密" description="生成SHA512哈希值" />;
      case 'base64-encode':
        return <Base64Tool />;
      case 'base64-decode':
        return <Base64Tool />;
      case 'password-gen':
        return <ComingSoon toolName="随机密码" description="生成安全的随机密码" />;
      // Conversion tools
      case 'hex-to-dec':
        return <ComingSoon toolName="16转10进制" description="十六进制转十进制" />;
      case 'dec-to-hex':
        return <ComingSoon toolName="10转16进制" description="十进制转十六进制" />;
      case 'oct-to-dec':
        return <ComingSoon toolName="8转10进制" description="八进制转十进制" />;
      case 'dec-to-oct':
        return <ComingSoon toolName="10转8进制" description="十进制转八进制" />;
      case 'bin-to-dec':
        return <ComingSoon toolName="2转10进制" description="二进制转十进制" />;
      case 'dec-to-bin':
        return <ComingSoon toolName="10转2进制" description="十进制转二进制" />;
      case 'bin-to-hex':
        return <ComingSoon toolName="2转16进制" description="二进制转十六进制" />;
      case 'hex-to-bin':
        return <ComingSoon toolName="16转2进制" description="十六进制转二进制" />;
      case 'ascii-table':
        return <ComingSoon toolName="ASCII表" description="查看ASCII编码表" />;
      case 'hex-to-ascii':
        return <ComingSoon toolName="16进制转ASCII" description="十六进制转ASCII字符" />;
      case 'ascii-to-hex':
        return <ComingSoon toolName="ASCII转16进制" description="ASCII字符转十六进制" />;
      case 'hex-color-to-rgb':
        return <ColorConverter />;
      case 'rgb-to-hex-color':
        return <ColorConverter />;
      case 'fraction-to-decimal':
        return <ComingSoon toolName="分数转小数" description="分数转换为小数" />;
      case 'decimal-to-fraction':
        return <ComingSoon toolName="小数转分数" description="小数转换为分数" />;
      case 'percent-to-decimal':
        return <ComingSoon toolName="百分比转小数" description="百分比转小数" />;
      case 'decimal-to-percent':
        return <ComingSoon toolName="小数转百分比" description="小数转百分比" />;
      case 'roman-table':
        return <ComingSoon toolName="罗马数字表" description="罗马数字对照表" />;
      case 'roman-to-number':
        return <ComingSoon toolName="罗马转阿拉伯" description="罗马数字转阿拉伯数字" />;
      case 'number-to-roman':
        return <ComingSoon toolName="阿拉伯转罗马" description="阿拉伯数字转罗马数字" />;
      // String tools
      case 'text-editor':
        return <ComingSoon toolName="文本编辑器" description="简单的文本编辑器" />;
      case 'regex-test':
        return <RegexTester />;
      case 'regex-replace':
        return <ComingSoon toolName="正则替换" description="使用正则表达式替换文本" />;
      case 'word-count':
        return <ComingSoon toolName="单词统计" description="统计单词和字符数" />;
      case 'char-count':
        return <ComingSoon toolName="字符统计" description="统计字符数量" />;
      case 'case-convert':
        return <ComingSoon toolName="大小写转换" description="转换文本大小写" />;
      case 'string-reverse':
        return <ComingSoon toolName="字符串翻转" description="翻转字符串" />;
      default:
        return <ComingSoon toolName={tool?.name || '未知工具'} description="该工具即将上线" />;
    }
  };

  return (
    <div className="min-h-screen p-6 animate-slide-up">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 bg-gradient-to-br ${tool.color} rounded-2xl flex items-center justify-center shadow-soft`}>
              <tool.icon className="w-6 h-6 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{tool.name}</h1>
              <p className="text-white/60">{tool.description}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-105"
          >
            <X className="w-5 h-5 text-white/70" />
          </button>
        </div>

        {/* Tool Content */}
        <div className="glass rounded-3xl p-8 shadow-glass-lg">
          {renderTool()}
        </div>
      </div>
    </div>
  );
}
