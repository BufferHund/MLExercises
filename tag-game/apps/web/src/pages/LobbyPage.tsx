import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { games, users } from '../api/client';
import { useGameStore } from '../store/gameStore';
import type { Game } from '../types';

export default function LobbyPage() {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const [game, setGame] = useState<Game | null>(null);
  const [badge, setBadge] = useState<{ qrDataUrl: string; badgeCode: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const user = useGameStore((state) => state.user);

  useEffect(() => {
    loadData();
  }, [gameId]);

  const loadData = async () => {
    try {
      const [gameData, badgeData] = await Promise.all([
        games.get(gameId!),
        users.badge(),
      ]);
      setGame(gameData);
      setBadge(badgeData);
    } catch (err: any) {
      setError(err.response?.data?.error || '加载失败');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignTeams = async () => {
    try {
      await games.assignTeams(gameId!);
      await loadData();
      alert('阵营分配完成！');
    } catch (err: any) {
      alert(err.response?.data?.error || '分配失败');
    }
  };

  const handleStart = async () => {
    try {
      await games.start(gameId!);
      navigate(`/play/${gameId}`);
    } catch (err: any) {
      alert(err.response?.data?.error || '启动失败');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">加载中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  const myParticipation = game?.participations?.find((p) => p.userId === user?.id);
  const isHunter = myParticipation?.team === 'HUNTER';

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-2xl mx-auto space-y-4">
        {/* 游戏信息 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold mb-2">{game?.name}</h1>
          <p className="text-gray-600">游戏 ID: {gameId}</p>
          <p className="text-sm text-gray-500 mt-2">
            状态: {game?.status === 'LOBBY' ? '等待中' : '进行中'}
          </p>
        </div>

        {/* 玩家徽章二维码 */}
        {badge && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">你的玩家徽章</h2>
            <div className="flex flex-col items-center">
              <img
                src={badge.qrDataUrl}
                alt="Player Badge QR"
                className="w-48 h-48 border-2 border-gray-300 rounded"
              />
              <p className="mt-2 text-sm text-gray-600">
                佩戴此二维码参与游戏
              </p>
              <p className="text-xs text-gray-400 mt-1">{badge.badgeCode}</p>
            </div>
          </div>
        )}

        {/* 阵营信息 */}
        {myParticipation && (
          <div
            className={`rounded-lg shadow p-6 text-white ${
              isHunter ? 'bg-hunter' : 'bg-runner'
            }`}
          >
            <h2 className="text-xl font-bold">
              {isHunter ? '🎯 你是猎人' : '🏃 你是逃亡者'}
            </h2>
            <p className="mt-2">
              {isHunter
                ? '目标：抓捕所有逃亡者'
                : '目标：躲避猎人，坚持到最后'}
            </p>
          </div>
        )}

        {/* 玩家列表 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">
            玩家列表 ({game?.participations?.length || 0})
          </h2>
          <div className="space-y-2">
            {game?.participations?.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded"
              >
                <span className="font-medium">{p.user?.nickname}</span>
                <span
                  className={`px-3 py-1 rounded text-sm ${
                    p.team === 'HUNTER'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  {p.team === 'HUNTER' ? '猎人' : '逃亡者'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 主持人操作 */}
        {game?.status === 'LOBBY' && (
          <div className="bg-white rounded-lg shadow p-6 space-y-3">
            <h2 className="text-lg font-semibold mb-4">主持人操作</h2>
            <button
              onClick={handleAssignTeams}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg transition"
            >
              分配阵营
            </button>
            <button
              onClick={handleStart}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition"
            >
              开始游戏
            </button>
            {user?.isAdmin && (
              <button
                onClick={() => navigate(`/admin/${gameId}`)}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-3 rounded-lg transition"
              >
                🛠️ 管理员面板
              </button>
            )}
          </div>
        )}

        {game?.status === 'RUNNING' && (
          <button
            onClick={() => navigate(`/play/${gameId}`)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition shadow-lg"
          >
            进入游戏
          </button>
        )}
      </div>
    </div>
  );
}
