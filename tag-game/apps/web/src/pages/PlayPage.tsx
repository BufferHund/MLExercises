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
  Fade,
  Slide,
  Zoom,
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
import { hunterColor, runnerColor, gradients } from '../theme';
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
      <Slide in direction="down" timeout={600}>
        <AppBar
          position="static"
          elevation={4}
          sx={{
            background: isHunter ? gradients.hunter : gradients.runner,
            boxShadow: isHunter
              ? '0 4px 20px rgba(211, 47, 47, 0.3)'
              : '0 4px 20px rgba(25, 118, 210, 0.3)',
          }}
        >
          <Toolbar variant="dense" sx={{ py: 1 }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" noWrap fontWeight="bold">
                {game?.name}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.95 }}>
                {isHunter ? '🎯 猎人' : '🏃 逃亡者'}
              </Typography>
            </Box>
            <Stack direction="row" spacing={1} alignItems="center">
              <Chip
                label={`附近: ${nearby.length}`}
                size="small"
                sx={{
                  bgcolor: 'rgba(255,255,255,0.25)',
                  backdropFilter: 'blur(10px)',
                  color: 'white',
                  fontWeight: 600,
                }}
              />
              <Chip
                label={insideBounds ? '✅ 区域内' : '⚠️ 区域外'}
                size="small"
                sx={{
                  bgcolor: 'rgba(255,255,255,0.25)',
                  backdropFilter: 'blur(10px)',
                  color: 'white',
                  fontWeight: 600,
                }}
              />
            </Stack>
          </Toolbar>
        </AppBar>
      </Slide>

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
            gap: 2,
          }}
        >
          <Zoom in timeout={800}>
            <Fab
              color="secondary"
              onClick={handleScan}
              size="medium"
              sx={{
                boxShadow: '0 6px 20px rgba(156, 39, 176, 0.4)',
                '&:hover': {
                  transform: 'scale(1.1)',
                  boxShadow: '0 8px 28px rgba(156, 39, 176, 0.5)',
                },
              }}
            >
              <ScanIcon />
            </Fab>
          </Zoom>

          <Zoom in timeout={1000}>
            <Badge badgeContent={backpack.length} color="error">
              <Fab
                color="primary"
                onClick={() => setBackpackOpen(true)}
                size="medium"
                sx={{
                  background: gradients.primary,
                  boxShadow: '0 6px 20px rgba(103, 80, 164, 0.4)',
                  '&:hover': {
                    background: gradients.primary,
                    transform: 'scale(1.1)',
                    boxShadow: '0 8px 28px rgba(103, 80, 164, 0.5)',
                  },
                }}
              >
                <BackpackIcon />
              </Fab>
            </Badge>
          </Zoom>

          {isHunter && !user?.isEliminated && (
            <Zoom in timeout={1200}>
              <Fab
                color="error"
                onClick={handleCaptureClick}
                disabled={!insideBounds}
                size="large"
                sx={{
                  width: 72,
                  height: 72,
                  background: gradients.hunter,
                  boxShadow: '0 8px 28px rgba(211, 47, 47, 0.5)',
                  animation: 'pulse 2s ease-in-out infinite',
                  '&:hover': {
                    background: gradients.hunter,
                    transform: 'scale(1.15)',
                    boxShadow: '0 12px 36px rgba(211, 47, 47, 0.6)',
                  },
                  '&:disabled': {
                    opacity: 0.5,
                  },
                }}
              >
                <CameraIcon sx={{ fontSize: 36 }} />
              </Fab>
            </Zoom>
          )}
        </Box>
      </Box>

      {/* 背包抽屉 */}
      <Drawer
        anchor="bottom"
        open={backpackOpen}
        onClose={() => setBackpackOpen(false)}
        PaperProps={{
          sx: {
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            background: 'rgba(255, 255, 255, 0.85)',
            backdropFilter: 'blur(20px) saturate(180%)',
            boxShadow: '0 -8px 32px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.6)',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '100%',
              background: 'linear-gradient(135deg, rgba(103, 80, 164, 0.05) 0%, rgba(138, 35, 135, 0.05) 100%)',
              pointerEvents: 'none',
            },
          },
        }}
      >
        <Box sx={{ p: 3 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
            <Typography variant="h5" fontWeight="bold">
              背包 ({backpack.length})
            </Typography>
            <IconButton
              onClick={() => setBackpackOpen(false)}
              sx={{
                bgcolor: 'rgba(0, 0, 0, 0.04)',
                '&:hover': {
                  bgcolor: 'rgba(0, 0, 0, 0.08)',
                },
              }}
            >
              <CloseIcon />
            </IconButton>
          </Stack>

          {backpack.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <BackpackIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2, opacity: 0.5 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                背包空空如也
              </Typography>
              <Typography variant="body2" color="text.secondary">
                扫描道具二维码来获取道具
              </Typography>
            </Box>
          ) : (
            <List sx={{ p: 0 }}>
              {backpack.map((pickup, idx) => (
                <Fade in timeout={300 + idx * 100} key={pickup.id}>
                  <ListItem
                    sx={{
                      mb: 1.5,
                      p: 2.5,
                      borderRadius: 3,
                      background: 'rgba(255, 255, 255, 0.5)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(103, 80, 164, 0.15)',
                      transition: 'all 0.3s cubic-bezier(0.23, 1, 0.32, 1)',
                      '&:hover': {
                        background: 'rgba(255, 255, 255, 0.7)',
                        border: '1px solid rgba(103, 80, 164, 0.3)',
                        transform: 'translateX(4px) translateY(-2px)',
                        boxShadow: '0 8px 24px rgba(103, 80, 164, 0.15)',
                      },
                    }}
                    secondaryAction={
                      !pickup.used && (
                        <Button
                          variant="contained"
                          size="medium"
                          onClick={() => handleUseItem(pickup.id)}
                          sx={{
                            borderRadius: 2,
                            fontWeight: 'bold',
                            background: gradients.primary,
                            boxShadow: '0 4px 12px rgba(103, 80, 164, 0.3)',
                            '&:hover': {
                              background: gradients.primary,
                              boxShadow: '0 6px 16px rgba(103, 80, 164, 0.4)',
                            },
                          }}
                        >
                          使用
                        </Button>
                      )
                    }
                  >
                    <ListItemText
                      primary={
                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                          {pickup.item.name || pickup.item.type}
                        </Typography>
                      }
                      secondary={
                        <Box sx={{ mt: 0.5 }}>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            {pickup.item.description}
                          </Typography>
                          <Chip
                            label={pickup.used ? '已使用' : '未使用'}
                            size="small"
                            color={pickup.used ? 'default' : 'success'}
                            sx={{ mt: 1, fontWeight: 600 }}
                          />
                        </Box>
                      }
                    />
                  </ListItem>
                </Fade>
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
