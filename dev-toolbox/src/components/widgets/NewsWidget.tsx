import { useEffect, useState } from 'react';
import { Newspaper, Loader2 } from 'lucide-react';
import { useUserStore } from '../../stores/useUserStore';
import { getNewsFromGemini } from '../../services/geminiService';

export default function NewsWidget() {
  const { geminiConfig } = useUserStore();
  const [allNews, setAllNews] = useState<any[]>([]);
  const [displayNews, setDisplayNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  // 获取新闻数据（从缓存或API）
  useEffect(() => {
    const fetchNews = async () => {
      if (!geminiConfig.apiKey) {
        setLoading(false);
        return;
      }

      try {
        const data = await getNewsFromGemini(geminiConfig.apiKey);
        setAllNews(data);
        setDisplayNews(data.slice(0, 3)); // 初始显示前3条
      } catch (error) {
        console.error('Failed to fetch news:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [geminiConfig.apiKey]);

  // 轮播展示 - 每20秒切换一批
  useEffect(() => {
    if (allNews.length <= 3) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        const nextIndex = (prev + 3) % allNews.length;
        const endIndex = Math.min(nextIndex + 3, allNews.length);
        setDisplayNews(allNews.slice(nextIndex, endIndex));
        return nextIndex;
      });
    }, 20000); // 20秒切换

    return () => clearInterval(interval);
  }, [allNews]);

  if (loading) {
    return (
      <div className="glass rounded-xl p-4 shadow-glass flex items-center justify-center h-40">
        <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="glass rounded-xl p-4 shadow-glass h-40 flex flex-col">
      <div className="flex items-center gap-2 mb-3">
        <Newspaper className="w-4 h-4 text-red-400" />
        <h3 className="text-sm font-medium text-white">科技新闻</h3>
      </div>

      {displayNews.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-xs text-slate-400">暂无新闻</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto space-y-2.5">
          {displayNews.map((item, idx) => (
            <div
              key={`${currentIndex}-${idx}`}
              className="text-xs pb-2 border-b border-slate-700/50 last:border-0 animate-fade-in"
            >
              <p className="text-slate-200 line-clamp-2 mb-1 leading-relaxed">{item.title}</p>
              <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
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
