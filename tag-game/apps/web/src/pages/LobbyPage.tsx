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
  Fade,
  Slide,
  Grow,
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
import { hunterColor, runnerColor, gradients } from '../theme';
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
    <Fade in timeout={600}>
      <Box
        sx={{
          minHeight: '100vh',
          background: `linear-gradient(to bottom, rgba(103, 80, 164, 0.03) 0%, transparent 100%)`,
          py: 3
        }}
      >
        <Container maxWidth="md">
          <Stack spacing={3}>
          {/* 游戏信息卡片 */}
          <Grow in timeout={600}>
            <Card
              elevation={4}
              sx={{
                borderRadius: 4,
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0.95) 100%)',
                transition: 'all 0.3s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 12px 40px rgba(0, 0, 0, 0.12)',
                },
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Stack spacing={3}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="h4" fontWeight="bold">
                      {game?.name}
                    </Typography>
                    <Chip
                      label={game?.status === 'LOBBY' ? '等待中' : '进行中'}
                      color={game?.status === 'LOBBY' ? 'default' : 'success'}
                      sx={{
                        fontWeight: 600,
                        px: 1,
                      }}
                    />
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom fontWeight={500}>
                      游戏代码
                    </Typography>
                    <Typography
                      variant="h5"
                      fontFamily="monospace"
                      fontWeight="bold"
                      sx={{
                        background: gradients.primary,
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                      }}
                    >
                      {gameId}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grow>

          {/* 玩家徽章二维码 */}
          {badge && (
            <Grow in timeout={800}>
              <Card
                elevation={4}
                sx={{
                  borderRadius: 4,
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 1) 0%, rgba(247, 247, 255, 1) 100%)',
                  transition: 'all 0.3s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 40px rgba(103, 80, 164, 0.15)',
                  },
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <QrCodeIcon sx={{ mr: 1, color: 'primary.main' }} />
                    你的玩家徽章
                  </Typography>
                  <Stack alignItems="center" spacing={3} mt={3}>
                    <Paper
                      elevation={8}
                      sx={{
                        p: 3,
                        bgcolor: 'white',
                        borderRadius: 4,
                        boxShadow: '0 8px 32px rgba(103, 80, 164, 0.2)',
                      }}
                    >
                      <img
                        src={badge.qrDataUrl}
                        alt="Player Badge QR"
                        style={{ width: 200, height: 200, display: 'block' }}
                      />
                    </Paper>
                    <Typography variant="body1" color="text.secondary" fontWeight={500}>
                      佩戴此二维码参与游戏
                    </Typography>
                    <Chip
                      label={badge.badgeCode}
                      sx={{
                        fontFamily: 'monospace',
                        fontWeight: 600,
                        fontSize: '0.875rem',
                        px: 2,
                      }}
                    />
                  </Stack>
                </CardContent>
              </Card>
            </Grow>
          )}

          {/* 阵营信息 */}
          {myParticipation && (
            <Grow in timeout={1000}>
              <Card
                elevation={8}
                sx={{
                  background: isHunter ? gradients.hunter : gradients.runner,
                  color: 'white',
                  borderRadius: 4,
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.3s',
                  '&:hover': {
                    transform: 'translateY(-4px) scale(1.02)',
                    boxShadow: isHunter
                      ? '0 16px 48px rgba(211, 47, 47, 0.4)'
                      : '0 16px 48px rgba(25, 118, 210, 0.4)',
                  },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: -50,
                    right: -50,
                    width: 200,
                    height: 200,
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.1)',
                    animation: 'pulse 3s ease-in-out infinite',
                  },
                }}
              >
                <CardContent sx={{ p: 4, position: 'relative', zIndex: 1 }}>
                  <Typography variant="h4" fontWeight="bold" gutterBottom>
                    {isHunter ? '🎯 你是猎人' : '🏃 你是逃亡者'}
                  </Typography>
                  <Typography variant="h6" sx={{ opacity: 0.95 }}>
                    {isHunter
                      ? '目标：抓捕所有逃亡者'
                      : '目标：躲避猎人，坚持到最后'}
                  </Typography>
                </CardContent>
              </Card>
            </Grow>
          )}

          {/* 玩家列表 */}
          <Grow in timeout={1200}>
            <Card
              elevation={4}
              sx={{
                borderRadius: 4,
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0.95) 100%)',
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  玩家列表 ({game?.participations?.length || 0})
                </Typography>
                <Divider sx={{ my: 3 }} />
                <List sx={{ p: 0 }}>
                  {game?.participations?.map((p, index) => (
                    <Fade in timeout={1400 + index * 100} key={p.id}>
                      <ListItem
                        sx={{
                          borderRadius: 3,
                          mb: 1.5,
                          bgcolor: 'rgba(0, 0, 0, 0.02)',
                          transition: 'all 0.2s',
                          '&:hover': {
                            bgcolor: 'rgba(103, 80, 164, 0.08)',
                            transform: 'translateX(8px)',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                          },
                          p: 2,
                        }}
                      >
                        <ListItemAvatar>
                          <Avatar
                            sx={{
                              bgcolor: p.team === 'HUNTER' ? hunterColor : runnerColor,
                              width: 48,
                              height: 48,
                              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                            }}
                          >
                            <PersonIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Typography variant="subtitle1" fontWeight={600}>
                              {p.user?.nickname}
                            </Typography>
                          }
                          secondary={
                            <Typography variant="body2" color="text.secondary">
                              #{index + 1}
                            </Typography>
                          }
                        />
                        <Chip
                          label={p.team === 'HUNTER' ? '猎人' : '逃亡者'}
                          size="medium"
                          sx={{
                            bgcolor: p.team === 'HUNTER' ? hunterColor : runnerColor,
                            color: 'white',
                            fontWeight: 600,
                            px: 2,
                          }}
                        />
                      </ListItem>
                    </Fade>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grow>

          {/* 主持人操作 */}
          {game?.status === 'LOBBY' && (
            <Grow in timeout={1400}>
              <Card
                elevation={4}
                sx={{
                  borderRadius: 4,
                  background: 'linear-gradient(135deg, rgba(103, 80, 164, 0.05) 0%, rgba(255, 255, 255, 1) 100%)',
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    主持人操作
                  </Typography>
                  <Stack spacing={2} mt={3}>
                    <Button
                      variant="contained"
                      size="large"
                      fullWidth
                      startIcon={<ShuffleIcon />}
                      onClick={handleAssignTeams}
                      sx={{
                        py: 2,
                        fontSize: '1rem',
                        fontWeight: 'bold',
                        borderRadius: 3,
                        background: gradients.primary,
                        boxShadow: '0 6px 20px rgba(103, 80, 164, 0.3)',
                        '&:hover': {
                          background: gradients.primary,
                          boxShadow: '0 8px 28px rgba(103, 80, 164, 0.4)',
                        },
                      }}
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
                      sx={{
                        py: 2,
                        fontSize: '1rem',
                        fontWeight: 'bold',
                        borderRadius: 3,
                        boxShadow: '0 6px 20px rgba(46, 125, 50, 0.3)',
                        '&:hover': {
                          boxShadow: '0 8px 28px rgba(46, 125, 50, 0.4)',
                        },
                      }}
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
                        sx={{
                          py: 2,
                          fontSize: '1rem',
                          fontWeight: 'bold',
                          borderRadius: 3,
                          boxShadow: '0 6px 20px rgba(237, 108, 2, 0.3)',
                          '&:hover': {
                            boxShadow: '0 8px 28px rgba(237, 108, 2, 0.4)',
                          },
                        }}
                      >
                        管理员面板
                      </Button>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            </Grow>
          )}

          {game?.status === 'RUNNING' && (
            <Grow in timeout={1400}>
              <Button
                variant="contained"
                size="large"
                fullWidth
                color="primary"
                startIcon={<PlayIcon />}
                onClick={() => navigate(`/play/${gameId}`)}
                sx={{
                  py: 2.5,
                  fontSize: '1.2rem',
                  fontWeight: 'bold',
                  borderRadius: 4,
                  background: gradients.primary,
                  boxShadow: '0 8px 28px rgba(103, 80, 164, 0.4)',
                  '&:hover': {
                    background: gradients.primary,
                    boxShadow: '0 12px 36px rgba(103, 80, 164, 0.5)',
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                进入游戏
              </Button>
            </Grow>
          )}
        </Stack>
      </Container>
    </Box>
    </Fade>
  );
}
