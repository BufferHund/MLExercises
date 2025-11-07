import { useEffect, useState } from 'react';
import { Newspaper, Loader2 } from 'lucide-react';
import { useUserStore } from '../../stores/useUserStore';
import { getNewsFromGemini } from '../../services/geminiService';

export default function NewsWidget() {
  const { geminiConfig } = useUserStore();
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      if (!geminiConfig.apiKey) {
        setLoading(false);
        return;
      }

      try {
        const data = await getNewsFromGemini(geminiConfig.apiKey);
        setNews(data.slice(0, 3)); // 只显示3条
      } catch (error) {
        console.error('Failed to fetch news:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [geminiConfig.apiKey]);

  if (loading) {
    return (
      <div className="glass rounded-xl p-4 shadow-glass flex items-center justify-center h-32">
        <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="glass rounded-xl p-4 shadow-glass">
      <div className="flex items-center gap-2 mb-3">
        <Newspaper className="w-4 h-4 text-red-400" />
        <h3 className="text-sm font-medium text-white">科技新闻</h3>
      </div>

      {news.length === 0 ? (
        <p className="text-xs text-slate-400">暂无新闻</p>
      ) : (
        <div className="space-y-2">
          {news.map((item, idx) => (
            <div key={idx} className="text-xs">
              <p className="text-slate-200 line-clamp-2 mb-1">{item.title}</p>
              <div className="flex items-center gap-2 text-slate-500">
                <span>{item.source}</span>
                <span>•</span>
                <span>{item.time}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
