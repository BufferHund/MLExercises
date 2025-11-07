import { Gamepad2, Crown, ExternalLink, Star } from 'lucide-react';
import { useUserStore } from '../../stores/useUserStore';

// Mock数据
const mockGames = [
  { name: '卡坦岛', players: '3-4人', rating: 4.5 },
  { name: '狼人杀', players: '6-12人', rating: 4.2 },
  { name: '阿瓦隆', players: '5-10人', rating: 4.7 },
];

const gamesLink = 'https://boardgamegeek.com/';

export default function GamesWidget() {
  const { isPremium } = useUserStore();

  // 非会员显示锁定状态
  if (!isPremium) {
    return (
      <div className="glass rounded-xl p-4 shadow-glass h-40 flex flex-col relative overflow-hidden">
        {/* 会员标识背景 */}
        <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 to-purple-500/10 backdrop-blur-sm" />

        <div className="relative z-10 flex flex-col h-full">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Gamepad2 className="w-4 h-4 text-pink-400" />
              <h3 className="text-sm font-medium text-white">桌游Games Premium</h3>
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
          <Gamepad2 className="w-4 h-4 text-pink-400" />
          <h3 className="text-sm font-medium text-white">桌游Games Premium</h3>
        </div>
        <a
          href={gamesLink}
          target="_blank"
          rel="noopener noreferrer"
          className="opacity-0 group-hover:opacity-100 transition-opacity"
          title="访问BoardGameGeek"
        >
          <ExternalLink className="w-3.5 h-3.5 text-slate-400 hover:text-pink-400 transition-colors" />
        </a>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2">
        {mockGames.map((game, idx) => (
          <div
            key={idx}
            className="p-2 bg-slate-800/30 rounded-lg hover:bg-slate-800/50 transition-colors"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-slate-200 font-medium">{game.name}</span>
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                <span className="text-xs text-slate-300">{game.rating}</span>
              </div>
            </div>
            <div className="text-[10px] text-slate-500">{game.players}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
