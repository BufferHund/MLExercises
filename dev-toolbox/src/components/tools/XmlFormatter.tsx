import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export default function XmlFormatter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const formatXml = (xml: string) => {
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xml, 'text/xml');

      const errorNode = xmlDoc.querySelector('parsererror');
      if (errorNode) {
        setError('XML格式错误');
        setOutput('');
        return;
      }

      const formatted = formatNode(xmlDoc, 0);
      setOutput(formatted);
      setError('');
    } catch (err) {
      setError('格式化失败: ' + (err as Error).message);
      setOutput('');
    }
  };

  const formatNode = (node: Node, level: number): string => {
    const indent = '  '.repeat(level);

    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent?.trim();
      return text ? text : '';
    }

    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as Element;
      const tagName = element.tagName;
      const attributes = Array.from(element.attributes)
        .map(attr => ` ${attr.name}="${attr.value}"`)
        .join('');

      const children = Array.from(element.childNodes);
      const hasElementChildren = children.some(child => child.nodeType === Node.ELEMENT_NODE);

      if (children.length === 0) {
        return `${indent}<${tagName}${attributes} />`;
      }

      if (children.length === 1 && children[0].nodeType === Node.TEXT_NODE) {
        const text = children[0].textContent?.trim();
        return `${indent}<${tagName}${attributes}>${text}</${tagName}>`;
      }

      const childrenFormatted = children
        .map(child => formatNode(child, level + 1))
        .filter(str => str)
        .join('\n');

      return hasElementChildren
        ? `${indent}<${tagName}${attributes}>\n${childrenFormatted}\n${indent}</${tagName}>`
        : `${indent}<${tagName}${attributes}>${childrenFormatted}</${tagName}>`;
    }

    return '';
  };

  const handleFormat = () => {
    if (!input.trim()) {
      setError('请输入XML内容');
      return;
    }
    formatXml(input);
  };

  const handleCopy = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      alert('复制失败');
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input */}
        <div className="space-y-3">
          <label className="block text-white font-medium">输入XML</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="粘贴XML代码..."
            className="w-full h-96 px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-300 text-sm font-mono resize-none focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Output */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-white font-medium">格式化结果</label>
            {output && (
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-sm transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    已复制
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    复制
                  </>
                )}
              </button>
            )}
          </div>
          <textarea
            value={output}
            readOnly
            placeholder="格式化后的XML将显示在这里..."
            className="w-full h-96 px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-300 text-sm font-mono resize-none focus:outline-none"
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-4">
        <button
          onClick={handleFormat}
          className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl font-medium text-white transition-colors"
        >
          格式化
        </button>
        <button
          onClick={() => {
            setInput('');
            setOutput('');
            setError('');
          }}
          className="px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl font-medium text-white transition-colors"
        >
          清空
        </button>
      </div>
    </div>
  );
}
