import { Trophy, Crown, ExternalLink } from 'lucide-react';
import { useUserStore } from '../../stores/useUserStore';

// Mock数据
const mockMatches = [
  { team1: '曼联', team2: '切尔西', score: '2-1', time: '今晚 20:00' },
  { team1: '利物浦', team2: '阿森纳', score: 'vs', time: '今晚 22:30' },
];

const footballLink = 'https://www.espn.com/soccer/';

export default function FootballWidget() {
  const { isPremium } = useUserStore();

  // 非会员显示锁定状态
  if (!isPremium) {
    return (
      <div className="glass rounded-xl p-4 shadow-glass h-40 flex flex-col relative overflow-hidden">
        {/* 会员标识背景 */}
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 backdrop-blur-sm" />

        <div className="relative z-10 flex flex-col h-full">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-yellow-500" />
              <h3 className="text-sm font-medium text-white">Football Premium</h3>
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
          <Trophy className="w-4 h-4 text-green-400" />
          <h3 className="text-sm font-medium text-white">Football Premium</h3>
        </div>
        <a
          href={footballLink}
          target="_blank"
          rel="noopener noreferrer"
          className="opacity-0 group-hover:opacity-100 transition-opacity"
          title="访问ESPN足球"
        >
          <ExternalLink className="w-3.5 h-3.5 text-slate-400 hover:text-green-400 transition-colors" />
        </a>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2">
        {mockMatches.map((match, idx) => (
          <div
            key={idx}
            className="p-2 bg-slate-800/30 rounded-lg hover:bg-slate-800/50 transition-colors"
          >
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-slate-200">{match.team1}</span>
              <span className="text-green-400 font-bold px-2">{match.score}</span>
              <span className="text-slate-200">{match.team2}</span>
            </div>
            <div className="text-[10px] text-slate-500 text-center">{match.time}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
