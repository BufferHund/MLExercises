import { BookOpen, Crown, ExternalLink } from 'lucide-react';
import { useUserStore } from '../../stores/useUserStore';

// Mock数据
const mockBooks = [
  { title: '深度学习', author: 'Ian Goodfellow', progress: 65 },
  { title: '算法导论', author: 'Thomas Cormen', progress: 42 },
  { title: '设计模式', author: 'Gang of Four', progress: 88 },
];

const litebookLink = 'https://www.goodreads.com/';

export default function LiteBookWidget() {
  const { isPremium } = useUserStore();

  // 非会员显示锁定状态
  if (!isPremium) {
    return (
      <div className="glass rounded-xl p-4 shadow-glass h-40 flex flex-col relative overflow-hidden">
        {/* 会员标识背景 */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 backdrop-blur-sm" />

        <div className="relative z-10 flex flex-col h-full">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-medium text-white">LiteBook Premium</h3>
            </div>
            <Crown className="w-5 h-5 text-yellow-500" />
          </div>

          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Crown className="w-12 h-12 text-yellow-500 mx-auto mb-2 opacity-50" />
              <p className="text-xs text-slate-400">会员专属功能</p>
              <p className="text-xs text-slate-500 mt-1">升级会员解锁</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass rounded-xl p-4 shadow-glass h-40 flex flex-col group">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-blue-400" />
          <h3 className="text-sm font-medium text-white">LiteBook Premium</h3>
        </div>
        <a
          href={litebookLink}
          target="_blank"
          rel="noopener noreferrer"
          className="opacity-0 group-hover:opacity-100 transition-opacity"
          title="访问Goodreads"
        >
          <ExternalLink className="w-3.5 h-3.5 text-slate-400 hover:text-blue-400 transition-colors" />
        </a>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2">
        {mockBooks.map((book, idx) => (
          <div key={idx} className="space-y-1">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-200 truncate">{book.title}</p>
                <p className="text-[10px] text-slate-500">{book.author}</p>
              </div>
              <span className="text-xs text-blue-400 ml-2">{book.progress}%</span>
            </div>
            <div className="w-full bg-slate-700/50 rounded-full h-1">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-1 rounded-full transition-all"
                style={{ width: `${book.progress}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
