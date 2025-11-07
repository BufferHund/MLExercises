import { Newspaper, ExternalLink } from 'lucide-react';

interface NewsItem {
  id: string;
  title: string;
  source: string;
  time: string;
  url: string;
}

// Mock 新闻数据
const mockNews: NewsItem[] = [
  {
    id: '1',
    title: 'OpenAI 发布 GPT-5 模型，性能提升显著',
    source: '科技日报',
    time: '2小时前',
    url: '#',
  },
  {
    id: '2',
    title: 'React 19 正式发布，引入编译器优化',
    source: 'React 官方',
    time: '5小时前',
    url: '#',
  },
  {
    id: '3',
    title: 'TypeScript 5.5 发布，新增性能改进',
    source: 'Microsoft',
    time: '8小时前',
    url: '#',
  },
  {
    id: '4',
    title: 'GitHub Copilot 推出企业版新功能',
    source: 'GitHub Blog',
    time: '1天前',
    url: '#',
  },
];

export default function NewsWidget() {
  return (
    <div className="glass rounded-2xl p-6 shadow-glass">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg flex items-center justify-center">
          <Newspaper className="w-4 h-4 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-white">科技新闻</h3>
      </div>

      {/* News List */}
      <div className="space-y-3">
        {mockNews.map((news) => (
          <a
            key={news.id}
            href={news.url}
            className="block p-3 bg-slate-800/30 hover:bg-slate-800/50 border border-slate-700/50 hover:border-slate-600 rounded-xl transition-all group"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors line-clamp-2 mb-1">
                  {news.title}
                </h4>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span>{news.source}</span>
                  <span>•</span>
                  <span>{news.time}</span>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition-colors flex-shrink-0" />
            </div>
          </a>
        ))}
      </div>

      {/* More Link */}
      <button className="mt-4 w-full py-2 text-sm text-slate-400 hover:text-white transition-colors">
        查看更多新闻 →
      </button>
    </div>
  );
}
