import { useState } from 'react';
import { Copy, CheckCircle2 } from 'lucide-react';

const templates = {
  summary: '请总结以下内容的要点：\n\n[在此粘贴需要总结的内容]\n\n要求：\n1. 提取3-5个核心要点\n2. 每个要点用简洁的语言表达\n3. 保持客观中立',
  translate: '请将以下文本翻译成[目标语言]：\n\n[在此粘贴需要翻译的内容]\n\n要求：\n1. 保持原意\n2. 符合目标语言表达习惯\n3. 保持专业术语准确性',
  code: '请根据以下需求生成代码：\n\n功能需求：\n[描述功能需求]\n\n技术栈：\n[指定语言和框架]\n\n要求：\n1. 代码简洁可读\n2. 包含必要注释\n3. 考虑边界情况',
  analysis: '请分析以下数据：\n\n[在此粘贴数据]\n\n分析要求：\n1. 数据概览\n2. 关键趋势\n3. 异常值\n4. 结论建议',
};

export default function PromptTemplate() {
  const [selected, setSelected] = useState('');
  const [copied, setCopied] = useState(false);

  const template = templates[selected as keyof typeof templates] || '';

  const copyToClipboard = async () => {
    if (template) {
      await navigator.clipboard.writeText(template);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-4">
      <select
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:border-white/30 transition-colors"
      >
        <option value="">选择模板</option>
        <option value="summary">文本总结</option>
        <option value="translate">翻译</option>
        <option value="code">代码生成</option>
        <option value="analysis">数据分析</option>
      </select>

      {template && (
        <>
          <textarea
            value={template}
            readOnly
            className="w-full h-64 px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white text-sm resize-none"
          />
          <button
            onClick={copyToClipboard}
            className="w-full px-6 py-3 bg-gradient-to-r from-cyan-500 to-teal-500 rounded-xl font-medium text-white hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? '已复制' : '复制'}
          </button>
        </>
      )}
    </div>
  );
}
