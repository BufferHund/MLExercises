import { useEffect, useState } from 'react';
import { Quote, Loader2 } from 'lucide-react';
import { useUserStore } from '../../stores/useUserStore';
import { getQuoteFromGemini } from '../../services/geminiService';

export default function QuoteWidget() {
  const { geminiConfig } = useUserStore();
  const [quote, setQuote] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuote = async () => {
      if (!geminiConfig.apiKey) {
        setLoading(false);
        return;
      }

      try {
        const data = await getQuoteFromGemini(geminiConfig.apiKey);
        setQuote(data);
      } catch (error) {
        console.error('Failed to fetch quote:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuote();
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
        <Quote className="w-4 h-4 text-purple-400" />
        <h3 className="text-sm font-medium text-white">每日一句</h3>
      </div>

      {quote ? (
        <div>
          <p className="text-sm text-slate-200 italic mb-2">"{quote.text}"</p>
          <p className="text-xs text-slate-400 text-right">— {quote.author}</p>
        </div>
      ) : (
        <p className="text-xs text-slate-400">暂无内容</p>
      )}
    </div>
  );
}
