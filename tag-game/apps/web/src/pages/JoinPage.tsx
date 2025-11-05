import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, games } from '../api/client';
import { useGameStore } from '../store/gameStore';

export default function JoinPage() {
  const [nickname, setNickname] = useState('');
  const [gameId, setGameId] = useState('');
  const [createMode, setCreateMode] = useState(false);
  const [gameName, setGameName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const setUser = useGameStore((state) => state.setUser);

  const handleJoin = async () => {
    if (!nickname.trim()) {
      setError('请输入昵称');
      return;
    }

    if (!createMode && !gameId.trim()) {
      setError('请输入游戏 ID');
      return;
    }

    if (createMode && !gameName.trim()) {
      setError('请输入游戏名称');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 登录
      const { user } = await auth.anonLogin(nickname);
      setUser(user);

      let targetGameId = gameId;

      // 如果是创建模式
      if (createMode) {
        const game = await games.create(gameName, {
          north: 39.9092,
          south: 39.9000,
          east: 116.3974,
          west: 116.3874,
        });
        targetGameId = game.id;
      } else {
        // 加入游戏
        await games.join(gameId);
      }

      navigate(`/lobby/${targetGameId}`);
    } catch (err: any) {
      setError(err.response?.data?.error || '操作失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          🎯 INF 猎捕行动
        </h1>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              昵称
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="输入你的昵称"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              maxLength={20}
            />
          </div>

          <div className="flex gap-2 border-b border-gray-200">
            <button
              onClick={() => setCreateMode(false)}
              className={`flex-1 py-2 font-medium transition ${
                !createMode
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500'
              }`}
            >
              加入游戏
            </button>
            <button
              onClick={() => setCreateMode(true)}
              className={`flex-1 py-2 font-medium transition ${
                createMode
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500'
              }`}
            >
              创建游戏
            </button>
          </div>

          {!createMode ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                游戏 ID
              </label>
              <input
                type="text"
                value={gameId}
                onChange={(e) => setGameId(e.target.value)}
                placeholder="输入游戏 ID"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                游戏名称
              </label>
              <input
                type="text"
                value={gameName}
                onChange={(e) => setGameName(e.target.value)}
                placeholder="输入游戏名称"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                maxLength={50}
              />
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            onClick={handleJoin}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition shadow-lg hover:shadow-xl"
          >
            {loading ? '处理中...' : createMode ? '创建并加入' : '加入游戏'}
          </button>
        </div>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>实时位置捉人游戏</p>
          <p className="mt-1">猎人 vs 逃亡者</p>
        </div>
      </div>
    </div>
  );
}
