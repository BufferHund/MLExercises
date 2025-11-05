import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Rectangle } from 'react-leaflet';
import { Icon } from 'leaflet';
import { useSocket } from '../hooks/useSocket';
import { useGeolocation, isInsideBounds } from '../hooks/useGeolocation';
import { useGameStore } from '../store/gameStore';
import { games, items, captures } from '../api/client';
import type { Game, AreaBounds, Pickup } from '../types';

// 修复 Leaflet 图标
delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export default function PlayPage() {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const [game, setGame] = useState<Game | null>(null);
  const [backpack, setBackpack] = useState<Pickup[]>([]);
  const [scanMode, setScanMode] = useState(false);
  const [captureMode, setCaptureMode] = useState(false);

  const user = useGameStore((state) => state.user);
  const nearby = useGameStore((state) => state.nearby);
  const { position } = useGeolocation(true);
  const { updatePosition } = useSocket(gameId);

  useEffect(() => {
    loadGame();
    loadBackpack();
  }, [gameId]);

  useEffect(() => {
    if (position) {
      updatePosition(position.lat, position.lng, position.accuracy);
    }
  }, [position]);

  const loadGame = async () => {
    try {
      const gameData = await games.get(gameId!);
      setGame(gameData);
      if (gameData.status === 'ENDED') {
        navigate(`/result/${gameId}`);
      }
    } catch (err) {
      console.error('Load game error:', err);
    }
  };

  const loadBackpack = async () => {
    try {
      const pickups = await items.myBackpack(gameId!);
      setBackpack(pickups);
    } catch (err) {
      console.error('Load backpack error:', err);
    }
  };

  const handleScan = async () => {
    const code = prompt('输入道具代码（或扫描二维码）:');
    if (!code) return;

    try {
      await items.pickup(code, gameId!);
      alert('道具领取成功！');
      loadBackpack();
    } catch (err: any) {
      alert(err.response?.data?.error || '领取失败');
    }
  };

  const handleUseItem = async (pickupId: string) => {
    try {
      await items.use(pickupId);
      alert('道具使用成功！');
      loadBackpack();
    } catch (err: any) {
      alert(err.response?.data?.error || '使用失败');
    }
  };

  const handleCapture = async () => {
    if (!position) {
      alert('无法获取位置');
      return;
    }

    const runnerId = prompt('输入逃亡者 ID:');
    if (!runnerId) return;

    // 模拟拍照
    const confirmed = confirm('确认抓捕？（实际版本需拍照）');
    if (!confirmed) return;

    try {
      const formData = new FormData();
      formData.append('runnerId', runnerId);
      formData.append('gameId', gameId!);
      formData.append('lat', position.lat.toString());
      formData.append('lng', position.lng.toString());
      // 实际版本需添加 photo 文件

      const result = await captures.create(formData);
      alert(`抓捕成功！获得 ${result.points} 分`);
      loadGame();
    } catch (err: any) {
      alert(err.response?.data?.error || '抓捕失败');
    }
  };

  const bounds: AreaBounds | null = game?.areaBounds
    ? JSON.parse(game.areaBounds)
    : null;

  const insideBounds =
    position && bounds
      ? isInsideBounds(position.lat, position.lng, bounds)
      : false;

  const isHunter = user?.role === 'HUNTER';

  return (
    <div className="h-screen flex flex-col">
      {/* 顶部状态栏 */}
      <div
        className={`p-4 text-white ${
          isHunter ? 'bg-hunter' : 'bg-runner'
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold">{game?.name}</h1>
            <p className="text-sm opacity-90">
              {isHunter ? '🎯 猎人' : '🏃 逃亡者'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm">附近敌人: {nearby.length}</p>
            <p className="text-xs opacity-75">
              {insideBounds ? '✅ 区域内' : '⚠️ 区域外'}
            </p>
          </div>
        </div>
      </div>

      {/* 地图 */}
      <div className="flex-1 relative">
        {position ? (
          <MapContainer
            center={[position.lat, position.lng]}
            zoom={16}
            className="h-full w-full"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* 游戏区域 */}
            {bounds && (
              <Rectangle
                bounds={[
                  [bounds.south, bounds.west],
                  [bounds.north, bounds.east],
                ]}
                pathOptions={{ color: 'blue', weight: 2, fillOpacity: 0.1 }}
              />
            )}

            {/* 当前位置 */}
            <Marker position={[position.lat, position.lng]}>
              <Popup>你在这里</Popup>
            </Marker>

            {/* 附近玩家（模糊显示） */}
            {nearby.map((pos, idx) => (
              <Marker key={idx} position={[pos.lat, pos.lng]}>
                <Popup>
                  {pos.role === 'HUNTER' ? '猎人' : '逃亡者'} (约 {pos.lastSeenSec}秒前)
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        ) : (
          <div className="flex items-center justify-center h-full bg-gray-100">
            <p className="text-gray-600">正在获取位置...</p>
          </div>
        )}
      </div>

      {/* 底部操作栏 */}
      <div className="bg-white border-t p-4 space-y-2">
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={handleScan}
            className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 rounded"
          >
            扫码
          </button>
          <button
            onClick={() => setScanMode(!scanMode)}
            className="bg-purple-500 hover:bg-purple-600 text-white font-semibold py-2 rounded"
          >
            背包 ({backpack.length})
          </button>
          {isHunter && (
            <button
              onClick={handleCapture}
              disabled={!insideBounds}
              className="bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white font-semibold py-2 rounded"
            >
              抓捕
            </button>
          )}
        </div>

        {/* 背包展开 */}
        {scanMode && (
          <div className="border rounded p-3 bg-gray-50 max-h-40 overflow-y-auto">
            {backpack.length === 0 ? (
              <p className="text-gray-500 text-sm text-center">背包空空如也</p>
            ) : (
              <div className="space-y-2">
                {backpack.map((pickup) => (
                  <div
                    key={pickup.id}
                    className="flex items-center justify-between bg-white p-2 rounded"
                  >
                    <div>
                      <p className="font-medium text-sm">{pickup.item.type}</p>
                      <p className="text-xs text-gray-500">
                        {pickup.used ? '已使用' : '未使用'}
                      </p>
                    </div>
                    {!pickup.used && (
                      <button
                        onClick={() => handleUseItem(pickup.id)}
                        className="bg-blue-500 hover:bg-blue-600 text-white text-xs px-3 py-1 rounded"
                      >
                        使用
                      </button>
                    )}
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
