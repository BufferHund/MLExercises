import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Loader2, Brain, Search, Wand2, Image as ImageIcon, Settings as SettingsIcon } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useUserStore } from '../stores/useUserStore';
import UserSettings from './UserSettings';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  thinking?: string; // 深度思考过程
}

type AdvancedMode = 'normal' | 'deep-thinking' | 'cot' | 'deep-search' | 'image-gen';

export default function AISearch() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [advancedMode, setAdvancedMode] = useState<AdvancedMode>('normal');
  const [showSettings, setShowSettings] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const { isPremium, geminiConfig } = useUserStore();

  const scrollToBottom = () => {
    // 只在消息容器内滚动，不影响整个页面
    if (messagesContainerRef.current) {
      setTimeout(() => {
        if (messagesContainerRef.current) {
          messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
      }, 100);
    }
  };

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

  const callGeminiAPI = async (userMessage: string, mode: AdvancedMode) => {
    if (!geminiConfig.apiKey) {
      return '请先在设置中配置您的 Gemini API Key';
    }

    try {
      const apiKey = geminiConfig.apiKey;
      const model = geminiConfig.model;

      // 根据模式构建不同的提示词
      let systemPrompt = '';
      switch (mode) {
        case 'deep-thinking':
          systemPrompt = '请进行深度思考，详细分析问题的各个方面，给出全面的解答。在回答前，请先展示你的思考过程。';
          break;
        case 'cot':
          systemPrompt = '请使用思维链(Chain of Thought)方法，一步步推理和解答问题。';
          break;
        case 'deep-search':
          systemPrompt = '请进行深度搜索和分析，提供详细的背景信息和多角度的观点。';
          break;
        case 'image-gen':
          return '图片生成功能开发中，即将上线...';
        default:
          systemPrompt = '';
      }

      const fullPrompt = systemPrompt ? `${systemPrompt}\n\n用户问题: ${userMessage}` : userMessage;

      // 调用 Gemini API
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: fullPrompt,
                  },
                ],
              },
            ],
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        console.error('Gemini API Error:', error);
        return `API调用失败: ${error.error?.message || 'Unknown error'}`;
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '无法获取回复';

      return text;
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      return `调用失败: ${error instanceof Error ? error.message : '未知错误'}`;
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    // 检查高级功能权限
    if (!isPremium && advancedMode !== 'normal') {
      alert('高级功能仅限会员使用，请升级到高级会员或切换到普通模式');
      return;
    }

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const responseText = await callGeminiAPI(userMessage.content, advancedMode);

      const assistantMessage: Message = {
        role: 'assistant',
        content: responseText,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        role: 'assistant',
        content: '抱歉，处理您的请求时出现错误。请稍后再试。',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const advancedModes = [
    { id: 'normal' as AdvancedMode, name: '普通', icon: Sparkles, premium: false },
    { id: 'deep-thinking' as AdvancedMode, name: '深度思考', icon: Brain, premium: true },
    { id: 'cot' as AdvancedMode, name: 'COT思维链', icon: Wand2, premium: true },
    { id: 'deep-search' as AdvancedMode, name: '深度搜索', icon: Search, premium: true },
    { id: 'image-gen' as AdvancedMode, name: 'AI绘图', icon: ImageIcon, premium: true },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto mb-8">
      {/* AI Search Container */}
      <div className="glass rounded-3xl shadow-glass-lg overflow-hidden">
        {/* Messages Area */}
        {messages.length > 0 && (
          <div ref={messagesContainerRef} className="max-h-96 overflow-y-auto p-6 space-y-4 scroll-smooth">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-800/50 border border-slate-700 text-slate-200'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {msg.role === 'assistant' && (
                      <Sparkles className="w-4 h-4 text-blue-400 flex-shrink-0 mt-1" />
                    )}
                    <div className="text-sm flex-1 prose prose-invert prose-sm max-w-none">
                      {msg.role === 'assistant' ? (
                        <ReactMarkdown
                          components={{
                            p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                            code: ({ children, className }) => {
                              const isInline = !className;
                              return isInline ? (
                                <code className="bg-slate-700 px-1.5 py-0.5 rounded text-xs">{children}</code>
                              ) : (
                                <code className="block bg-slate-900 p-2 rounded text-xs overflow-x-auto">{children}</code>
                              );
                            },
                            ul: ({ children }) => <ul className="list-disc list-inside mb-2">{children}</ul>,
                            ol: ({ children }) => <ol className="list-decimal list-inside mb-2">{children}</ol>,
                            li: ({ children }) => <li className="mb-1">{children}</li>,
                            h1: ({ children }) => <h1 className="text-lg font-bold mb-2">{children}</h1>,
                            h2: ({ children }) => <h2 className="text-base font-bold mb-2">{children}</h2>,
                            h3: ({ children }) => <h3 className="text-sm font-bold mb-1">{children}</h3>,
                          }}
                        >
                          {msg.content}
                        </ReactMarkdown>
                      ) : (
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      )}
                    </div>
                  </div>
                  <span className="text-xs opacity-60 mt-1 block">
                    {msg.timestamp.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-slate-800/50 border border-slate-700 rounded-2xl px-4 py-3">
                  <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Advanced Mode Selector */}
        <div className="px-6 pt-6 pb-3 border-t border-white/5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-slate-400">功能模式</span>
            <button
              onClick={() => setShowSettings(true)}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-blue-400 transition-colors"
            >
              <SettingsIcon className="w-3 h-3" />
              设置
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {advancedModes.map((mode) => {
              const Icon = mode.icon;
              const isActive = advancedMode === mode.id;
              const isLocked = mode.premium && !isPremium;

              return (
                <button
                  key={mode.id}
                  onClick={() => !isLocked && setAdvancedMode(mode.id)}
                  disabled={isLocked}
                  className={`
                    flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                    ${isActive
                      ? 'bg-blue-600 text-white'
                      : isLocked
                      ? 'bg-slate-800/50 text-slate-500 border border-slate-700 cursor-not-allowed'
                      : 'bg-slate-800/50 text-slate-300 border border-slate-700 hover:border-slate-600'
                    }
                  `}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {mode.name}
                  {isLocked && <span className="ml-1">🔒</span>}
                </button>
              );
            })}
          </div>
          <div className="mt-2 text-xs text-slate-500">
            当前模型: {geminiConfig.model === 'gemini-2.5-pro' ? 'Gemini 2.5 Pro (高级)' : 'Gemini 2.5 Flash (基础)'}
            {!geminiConfig.apiKey && ' - ⚠️ 未配置API Key'}
          </div>
        </div>

        {/* Input Area */}
        <div className="p-6 border-t border-white/5">
          <div className="flex items-end gap-3">
            <div className="flex-1 relative">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-slate-400">Gemini AI 助手</span>
              </div>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="问我任何问题... (按 Enter 发送，Shift+Enter 换行)"
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 resize-none focus:outline-none focus:border-blue-500 transition-colors"
                rows={1}
                style={{ minHeight: '48px', maxHeight: '120px' }}
              />
            </div>
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading || !geminiConfig.apiKey}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:cursor-not-allowed rounded-xl text-white font-medium transition-colors flex items-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
              发送
            </button>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && <UserSettings onClose={() => setShowSettings(false)} />}
    </div>
  );
}
