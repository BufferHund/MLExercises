import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { admin, games } from '../api/client';
import { useGameStore } from '../store/gameStore';
import type { Game, Item, Capture } from '../types';

export default function AdminPage() {
  const { gameId } = useParams<{ gameId: string }>();
  const [game, setGame] = useState<Game | null>(null);
  const [activeTab, setActiveTab] = useState<'items' | 'captures'>('items');
  const [items, setItems] = useState<(Item & { qrCode: string })[]>([]);
  const [pendingCaptures, setPendingCaptures] = useState<Capture[]>([]);
  const [loading, setLoading] = useState(false);

  const user = useGameStore((state) => state.user);

  useEffect(() => {
    if (!user?.isAdmin) {
      alert('需要管理员权限');
      window.history.back();
      return;
    }
    loadGame();
    loadItems();
    loadPendingCaptures();
  }, [gameId]);

  const loadGame = async () => {
    try {
      const gameData = await games.get(gameId!);
      setGame(gameData);
    } catch (err) {
      console.error('Load game error:', err);
    }
  };

  const loadItems = async () => {
    try {
      const data = await admin.getGameItems(gameId!);
      setItems(data.items);
    } catch (err) {
      console.error('Load items error:', err);
    }
  };

  const loadPendingCaptures = async () => {
    try {
      const data = await admin.getPendingCaptures(gameId!);
      setPendingCaptures(data);
    } catch (err) {
      console.error('Load pending captures error:', err);
    }
  };

  const handleCreateItem = async () => {
    const type = prompt('道具类型 (STEALTH/BOOST/RADAR/REFLECT):');
    if (!type || !['STEALTH', 'BOOST', 'RADAR', 'REFLECT'].includes(type)) {
      alert('无效的道具类型');
      return;
    }

    const name = prompt('道具名称:');
    if (!name) return;

    const description = prompt('道具描述 (可选):');
    const durationStr = prompt('持续时间（秒）:');
    const countStr = prompt('创建数量:');

    if (!durationStr || !countStr) return;

    const durationSec = parseInt(durationStr);
    const count = parseInt(countStr);

    if (isNaN(durationSec) || isNaN(count) || count < 1 || count > 100) {
      alert('无效的参数');
      return;
    }

    setLoading(true);
    try {
      await admin.createItems({
        gameId: gameId!,
        type,
        name,
        description: description || undefined,
        durationSec,
        count,
      });
      alert(`成功创建 ${count} 个道具`);
      loadItems();
    } catch (err: any) {
      alert(err.response?.data?.error || '创建失败');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCapture = async (captureId: string, approved: boolean) => {
    const note = prompt(approved ? '审核通过备注 (可选):' : '拒绝原因:');

    setLoading(true);
    try {
      await admin.verifyCapture(
        captureId,
        approved ? 'APPROVED' : 'REJECTED',
        note || undefined
      );
      alert(approved ? '审核通过' : '已拒绝');
      loadPendingCaptures();
    } catch (err: any) {
      alert(err.response?.data?.error || '审核失败');
    } finally {
      setLoading(false);
    }
  };

  const handlePrintQR = () => {
    // 在新窗口打开打印预览
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${game?.name} - 道具二维码</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 20px;
            }
            .item-card {
              page-break-after: always;
              text-align: center;
              padding: 40px;
              border: 2px solid #333;
              margin-bottom: 20px;
            }
            .item-card:last-child {
              page-break-after: auto;
            }
            .qr-code {
              max-width: 300px;
              margin: 20px auto;
            }
            h1 {
              margin: 10px 0;
              font-size: 24px;
            }
            .description {
              margin: 10px 0;
              color: #666;
            }
            .game-info {
              margin-top: 20px;
              font-size: 14px;
              color: #999;
            }
            @media print {
              body {
                padding: 0;
              }
              .item-card {
                border: none;
                margin: 0;
              }
            }
          </style>
        </head>
        <body>
          ${items
            .map(
              (item) => `
            <div class="item-card">
              <h1>${item.name}</h1>
              <img src="${item.qrCode}" alt="QR Code" class="qr-code" />
              <p class="description">${item.description || ''}</p>
              <p class="description">类型: ${item.type} | 时长: ${item.durationSec}秒</p>
              <div class="game-info">
                游戏: ${game?.name} (${game?.id})
              </div>
            </div>
          `
            )
            .join('')}
          <script>
            window.onload = () => {
              window.print();
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  if (!user?.isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* 顶部标题栏 */}
      <div className="bg-purple-600 text-white p-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold">管理员面板</h1>
          <p className="text-sm opacity-90 mt-1">
            {game?.name} ({game?.id})
          </p>
        </div>
      </div>

      {/* 标签页切换 */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto flex">
          <button
            onClick={() => setActiveTab('items')}
            className={`flex-1 py-3 font-semibold ${
              activeTab === 'items'
                ? 'bg-purple-100 text-purple-700 border-b-2 border-purple-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            道具管理 ({items.length})
          </button>
          <button
            onClick={() => setActiveTab('captures')}
            className={`flex-1 py-3 font-semibold ${
              activeTab === 'captures'
                ? 'bg-purple-100 text-purple-700 border-b-2 border-purple-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            捕捉审核 ({pendingCaptures.length})
          </button>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="max-w-4xl mx-auto p-4">
        {activeTab === 'items' ? (
          <div>
            {/* 操作按钮 */}
            <div className="mb-4 flex gap-2">
              <button
                onClick={handleCreateItem}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold px-4 py-2 rounded"
              >
                创建道具
              </button>
              <button
                onClick={handlePrintQR}
                disabled={items.length === 0}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold px-4 py-2 rounded"
              >
                打印所有二维码
              </button>
              <button
                onClick={loadItems}
                className="bg-gray-600 hover:bg-gray-700 text-white font-semibold px-4 py-2 rounded"
              >
                刷新
              </button>
            </div>

            {/* 道具列表 */}
            {items.length === 0 ? (
              <div className="bg-white rounded-lg p-8 text-center text-gray-500">
                <p>还没有道具</p>
                <p className="text-sm mt-2">点击"创建道具"开始</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {items.map((item) => (
                  <div key={item.id} className="bg-white rounded-lg p-4 border">
                    <div className="flex items-start gap-4">
                      <img
                        src={item.qrCode}
                        alt={item.name}
                        className="w-32 h-32 object-contain border"
                      />
                      <div className="flex-1">
                        <h3 className="font-bold text-lg">{item.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {item.description}
                        </p>
                        <div className="mt-2 space-y-1 text-xs text-gray-500">
                          <p>类型: {item.type}</p>
                          <p>时长: {item.durationSec}秒</p>
                          <p>状态: {item.isUsed ? '已使用' : '未使用'}</p>
                          <p className="font-mono text-xs">
                            代码: {item.code}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div>
            {/* 刷新按钮 */}
            <div className="mb-4">
              <button
                onClick={loadPendingCaptures}
                className="bg-gray-600 hover:bg-gray-700 text-white font-semibold px-4 py-2 rounded"
              >
                刷新
              </button>
            </div>

            {/* 待审核捕捉列表 */}
            {pendingCaptures.length === 0 ? (
              <div className="bg-white rounded-lg p-8 text-center text-gray-500">
                <p>没有待审核的捕捉记录</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingCaptures.map((capture) => (
                  <div
                    key={capture.id}
                    className="bg-white rounded-lg p-4 border"
                  >
                    <div className="flex gap-4">
                      {/* 照片 */}
                      <img
                        src={capture.photoUrl}
                        alt="Capture"
                        className="w-48 h-48 object-cover rounded border"
                      />

                      {/* 详情 */}
                      <div className="flex-1">
                        <h3 className="font-bold text-lg mb-2">捕捉记录</h3>
                        <div className="space-y-1 text-sm">
                          <p>
                            <span className="font-semibold">猎人:</span>{' '}
                            {capture.hunter?.nickname || '未知'}
                          </p>
                          <p>
                            <span className="font-semibold">逃亡者:</span>{' '}
                            {capture.runner?.nickname || '未知'}
                          </p>
                          <p>
                            <span className="font-semibold">位置:</span>{' '}
                            {capture.lat.toFixed(6)}, {capture.lng.toFixed(6)}
                          </p>
                          <p>
                            <span className="font-semibold">时间:</span>{' '}
                            {new Date(capture.createdAt).toLocaleString('zh-CN')}
                          </p>
                        </div>

                        {/* 操作按钮 */}
                        <div className="mt-4 flex gap-2">
                          <button
                            onClick={() => handleVerifyCapture(capture.id, true)}
                            disabled={loading}
                            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold px-4 py-2 rounded"
                          >
                            ✓ 通过
                          </button>
                          <button
                            onClick={() => handleVerifyCapture(capture.id, false)}
                            disabled={loading}
                            className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-semibold px-4 py-2 rounded"
                          >
                            ✗ 拒绝
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
