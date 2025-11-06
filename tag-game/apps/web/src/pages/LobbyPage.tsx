import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Card,
  CardContent,
  Button,
  Typography,
  Stack,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  CircularProgress,
  Alert,
  Divider,
  Paper,
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Shuffle as ShuffleIcon,
  QrCode as QrCodeIcon,
  AdminPanelSettings as AdminIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { games, users } from '../api/client';
import { useGameStore } from '../store/gameStore';
import { hunterColor, runnerColor } from '../theme';
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
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress size={48} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2,
        }}
      >
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  const myParticipation = game?.participations?.find((p) => p.userId === user?.id);
  const isHunter = myParticipation?.team === 'HUNTER';

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 3 }}>
      <Container maxWidth="md">
        <Stack spacing={3}>
          {/* 游戏信息卡片 */}
          <Card elevation={2}>
            <CardContent>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="h4" fontWeight="bold">
                    {game?.name}
                  </Typography>
                  <Chip
                    label={game?.status === 'LOBBY' ? '等待中' : '进行中'}
                    color={game?.status === 'LOBBY' ? 'default' : 'success'}
                  />
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    游戏代码
                  </Typography>
                  <Typography
                    variant="h5"
                    fontFamily="monospace"
                    fontWeight="bold"
                    color="primary"
                  >
                    {gameId}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>

          {/* 玩家徽章二维码 */}
          {badge && (
            <Card elevation={2}>
              <CardContent>
                <Typography variant="h6" fontWeight="medium" gutterBottom>
                  <QrCodeIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                  你的玩家徽章
                </Typography>
                <Stack alignItems="center" spacing={2} mt={2}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      bgcolor: 'background.default',
                      borderRadius: 2,
                    }}
                  >
                    <img
                      src={badge.qrDataUrl}
                      alt="Player Badge QR"
                      style={{ width: 200, height: 200, display: 'block' }}
                    />
                  </Paper>
                  <Typography variant="body2" color="text.secondary">
                    佩戴此二维码参与游戏
                  </Typography>
                  <Typography
                    variant="caption"
                    fontFamily="monospace"
                    color="text.secondary"
                  >
                    {badge.badgeCode}
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          )}

          {/* 阵营信息 */}
          {myParticipation && (
            <Card
              elevation={2}
              sx={{
                bgcolor: isHunter ? hunterColor : runnerColor,
                color: 'white',
              }}
            >
              <CardContent>
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                  {isHunter ? '🎯 你是猎人' : '🏃 你是逃亡者'}
                </Typography>
                <Typography variant="body1">
                  {isHunter
                    ? '目标：抓捕所有逃亡者'
                    : '目标：躲避猎人，坚持到最后'}
                </Typography>
              </CardContent>
            </Card>
          )}

          {/* 玩家列表 */}
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" fontWeight="medium" gutterBottom>
                玩家列表 ({game?.participations?.length || 0})
              </Typography>
              <Divider sx={{ my: 2 }} />
              <List>
                {game?.participations?.map((p, index) => (
                  <ListItem
                    key={p.id}
                    sx={{
                      borderRadius: 2,
                      mb: 1,
                      bgcolor: 'background.default',
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar
                        sx={{
                          bgcolor: p.team === 'HUNTER' ? hunterColor : runnerColor,
                        }}
                      >
                        <PersonIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={p.user?.nickname}
                      secondary={`#${index + 1}`}
                    />
                    <Chip
                      label={p.team === 'HUNTER' ? '猎人' : '逃亡者'}
                      size="small"
                      sx={{
                        bgcolor: p.team === 'HUNTER' ? hunterColor : runnerColor,
                        color: 'white',
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>

          {/* 主持人操作 */}
          {game?.status === 'LOBBY' && (
            <Card elevation={2}>
              <CardContent>
                <Typography variant="h6" fontWeight="medium" gutterBottom>
                  主持人操作
                </Typography>
                <Stack spacing={2} mt={2}>
                  <Button
                    variant="contained"
                    size="large"
                    fullWidth
                    startIcon={<ShuffleIcon />}
                    onClick={handleAssignTeams}
                    sx={{ py: 1.5 }}
                  >
                    分配阵营
                  </Button>
                  <Button
                    variant="contained"
                    size="large"
                    fullWidth
                    color="success"
                    startIcon={<PlayIcon />}
                    onClick={handleStart}
                    sx={{ py: 1.5 }}
                  >
                    开始游戏
                  </Button>
                  {user?.isAdmin && (
                    <Button
                      variant="contained"
                      size="large"
                      fullWidth
                      color="warning"
                      startIcon={<AdminIcon />}
                      onClick={() => navigate(`/admin/${gameId}`)}
                      sx={{ py: 1.5 }}
                    >
                      管理员面板
                    </Button>
                  )}
                </Stack>
              </CardContent>
            </Card>
          )}

          {game?.status === 'RUNNING' && (
            <Button
              variant="contained"
              size="large"
              fullWidth
              color="primary"
              startIcon={<PlayIcon />}
              onClick={() => navigate(`/play/${gameId}`)}
              sx={{ py: 2, fontSize: '1.1rem', fontWeight: 'bold' }}
            >
              进入游戏
            </Button>
          )}
        </Stack>
      </Container>
    </Box>
  );
}
