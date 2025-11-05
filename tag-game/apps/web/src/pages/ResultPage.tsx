import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { leaderboard, captures as capturesAPI } from '../api/client';
import type { Participation, Capture } from '../types';

export default function ResultPage() {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const [rankings, setRankings] = useState<Participation[]>([]);
  const [captureList, setCaptureList] = useState<Capture[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadResults();
  }, [gameId]);

  const loadResults = async () => {
    try {
      const [leaderboardData, capturesData] = await Promise.all([
        leaderboard.get(gameId!),
        capturesAPI.list(gameId!),
      ]);
      setRankings(leaderboardData);
      setCaptureList(capturesData);
    } catch (err) {
      console.error('Load results error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">加载中...</div>
      </div>
    );
  }

  const topThree = rankings.slice(0, 3);

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-2xl mx-auto space-y-4">
        {/* 标题 */}
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <h1 className="text-3xl font-bold text-gray-800">游戏结束</h1>
          <p className="text-gray-600 mt-2">查看最终排名</p>
        </div>

        {/* 前三名 */}
        {topThree.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">🏆 前三名</h2>
            <div className="space-y-3">
              {topThree.map((p, idx) => (
                <div
                  key={p.id}
                  className={`flex items-center gap-4 p-4 rounded-lg ${
                    idx === 0
                      ? 'bg-yellow-50 border-2 border-yellow-400'
                      : idx === 1
                      ? 'bg-gray-50 border-2 border-gray-300'
                      : 'bg-orange-50 border-2 border-orange-300'
                  }`}
                >
                  <div className="text-3xl">
                    {idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-lg">{p.user?.nickname}</p>
                    <p className="text-sm text-gray-600">
                      {p.team === 'HUNTER' ? '猎人' : '逃亡者'}
                      {p.user?.isEliminated && ' (已淘汰)'}
                    </p>
                  </div>
                  <div className="text-2xl font-bold text-blue-600">
                    {p.score}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 完整排行榜 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">完整排行榜</h2>
          <div className="space-y-2">
            {rankings.map((p, idx) => (
              <div
                key={p.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded"
              >
                <div className="flex items-center gap-3">
                  <span className="font-bold text-gray-600 w-6">#{idx + 1}</span>
                  <div>
                    <p className="font-medium">{p.user?.nickname}</p>
                    <p className="text-xs text-gray-500">
                      {p.team === 'HUNTER' ? '猎人' : '逃亡者'}
                    </p>
                  </div>
                </div>
                <div className="text-lg font-bold text-blue-600">{p.score}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 抓捕记录 */}
        {captureList.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">
              抓捕记录 ({captureList.length})
            </h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {captureList.map((capture) => (
                <div
                  key={capture.id}
                  className="p-3 border border-gray-200 rounded"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">
                      {capture.hunter?.nickname} 抓到了{' '}
                      {capture.runner?.nickname}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(capture.createdAt).toLocaleString('zh-CN')}
                    </span>
                  </div>
                  {capture.photoUrl && (
                    <img
                      src={capture.photoUrl}
                      alt="Capture"
                      className="w-full h-32 object-cover rounded"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 返回按钮 */}
        <button
          onClick={() => navigate('/join')}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition shadow-lg"
        >
          返回首页
        </button>
      </div>
    </div>
  );
}
