import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Rectangle } from 'react-leaflet';
import { Icon } from 'leaflet';
import {
  Box,
  Paper,
  Typography,
  Fab,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Button,
  Chip,
  Stack,
  IconButton,
  Badge,
  AppBar,
  Toolbar,
} from '@mui/material';
import {
  CameraAlt as CameraIcon,
  QrCodeScanner as ScanIcon,
  Backpack as BackpackIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useSocket } from '../hooks/useSocket';
import { useGeolocation, isInsideBounds } from '../hooks/useGeolocation';
import { useGameStore } from '../store/gameStore';
import { games, items, captures } from '../api/client';
import CaptureDialog from '../components/CaptureDialog';
import { hunterColor, runnerColor } from '../theme';
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
  const [backpackOpen, setBackpackOpen] = useState(false);
  const [showCaptureDialog, setShowCaptureDialog] = useState(false);

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

  const handleCaptureClick = () => {
    if (!position) {
      alert('无法获取位置');
      return;
    }
    if (user?.isEliminated) {
      alert('你已被淘汰，无法抓捕他人');
      return;
    }
    setShowCaptureDialog(true);
  };

  const handleCapture = async (runnerId: string, photo: File) => {
    if (!position) {
      alert('无法获取位置');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('runnerId', runnerId);
      formData.append('gameId', gameId!);
      formData.append('lat', position.lat.toString());
      formData.append('lng', position.lng.toString());
      formData.append('photo', photo);

      await captures.create(formData);
      setShowCaptureDialog(false);
      alert('抓捕照片已提交，等待管理员审核');
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
  const nearbyRunners = nearby.filter((pos) => pos.role === 'RUNNER');

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* 顶部状态栏 */}
      <AppBar
        position="static"
        sx={{
          bgcolor: isHunter ? hunterColor : runnerColor,
        }}
      >
        <Toolbar variant="dense">
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" noWrap>
              {game?.name}
            </Typography>
            <Typography variant="caption">
              {isHunter ? '🎯 猎人' : '🏃 逃亡者'}
            </Typography>
          </Box>
          <Stack direction="row" spacing={1} alignItems="center">
            <Chip
              label={`附近: ${nearby.length}`}
              size="small"
              sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
            />
            <Chip
              label={insideBounds ? '✅ 区域内' : '⚠️ 区域外'}
              size="small"
              sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
            />
          </Stack>
        </Toolbar>
      </AppBar>

      {/* 地图 */}
      <Box sx={{ flex: 1, position: 'relative' }}>
        {position ? (
          <MapContainer
            center={[position.lat, position.lng]}
            zoom={16}
            style={{ height: '100%', width: '100%' }}
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

            {/* 附近玩家 */}
            {nearby.map((pos, idx) => (
              <Marker key={idx} position={[pos.lat, pos.lng]}>
                <Popup>
                  {pos.role === 'HUNTER' ? '猎人' : '逃亡者'} (约 {pos.lastSeenSec}秒前)
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        ) : (
          <Box
            sx={{
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'background.default',
            }}
          >
            <Typography color="text.secondary">正在获取位置...</Typography>
          </Box>
        )}

        {/* 浮动操作按钮 */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 16,
            right: 16,
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
          }}
        >
          <Fab
            color="secondary"
            onClick={handleScan}
            size="medium"
          >
            <ScanIcon />
          </Fab>

          <Badge badgeContent={backpack.length} color="error">
            <Fab
              color="primary"
              onClick={() => setBackpackOpen(true)}
              size="medium"
            >
              <BackpackIcon />
            </Fab>
          </Badge>

          {isHunter && !user?.isEliminated && (
            <Fab
              color="error"
              onClick={handleCaptureClick}
              disabled={!insideBounds}
              size="large"
              sx={{ width: 64, height: 64 }}
            >
              <CameraIcon sx={{ fontSize: 32 }} />
            </Fab>
          )}
        </Box>
      </Box>

      {/* 背包抽屉 */}
      <Drawer
        anchor="bottom"
        open={backpackOpen}
        onClose={() => setBackpackOpen(false)}
      >
        <Box sx={{ p: 2 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
            <Typography variant="h6">背包 ({backpack.length})</Typography>
            <IconButton onClick={() => setBackpackOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Stack>

          {backpack.length === 0 ? (
            <Typography color="text.secondary" textAlign="center" py={4}>
              背包空空如也
            </Typography>
          ) : (
            <List>
              {backpack.map((pickup) => (
                <ListItem
                  key={pickup.id}
                  secondaryAction={
                    !pickup.used && (
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => handleUseItem(pickup.id)}
                      >
                        使用
                      </Button>
                    )
                  }
                >
                  <ListItemText
                    primary={pickup.item.name || pickup.item.type}
                    secondary={
                      <>
                        {pickup.item.description}
                        <br />
                        {pickup.used ? '已使用' : '未使用'}
                      </>
                    }
                  />
                </ListItem>
              ))}
            </List>
          )}
        </Box>
      </Drawer>

      {/* 抓捕对话框 */}
      {showCaptureDialog && (
        <CaptureDialog
          nearbyRunners={nearbyRunners}
          onCapture={handleCapture}
          onCancel={() => setShowCaptureDialog(false)}
        />
      )}
    </Box>
  );
}
