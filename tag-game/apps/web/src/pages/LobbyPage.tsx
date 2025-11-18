import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  CardContent,
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
import {
  ANIMATION_DURATION,
  chipStyles,
  listItemStyles,
  avatarStyles,
  getStaggeredDelay,
} from '../styles/shared';
import AnimatedCard from '../components/AnimatedCard';
import EnhancedButton from '../components/EnhancedButton';
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
          <AnimatedCard animation="grow" timeout={ANIMATION_DURATION.normal}>
            <CardContent sx={{ p: 4 }}>
              <Stack spacing={3}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="h4" fontWeight="bold">
                    {game?.name}
                  </Typography>
                  <Chip
                    label={game?.status === 'LOBBY' ? '等待中' : '进行中'}
                    color={game?.status === 'LOBBY' ? 'default' : 'success'}
                    sx={chipStyles.elevated}
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
          </AnimatedCard>

          {/* 玩家徽章二维码 */}
          {badge && (
            <AnimatedCard variant="gradient" animation="grow" timeout={ANIMATION_DURATION.slow}>
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
            </AnimatedCard>
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
          <AnimatedCard animation="grow" timeout={ANIMATION_DURATION.slowest}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  玩家列表 ({game?.participations?.length || 0})
                </Typography>
                <Divider sx={{ my: 3 }} />
                <List sx={{ p: 0 }}>
                  {game?.participations?.map((p, index) => (
                    <Fade in timeout={getStaggeredDelay(index, 1400, 100)} key={p.id}>
                      <ListItem sx={listItemStyles.elevated}>
                        <ListItemAvatar>
                          <Avatar sx={p.team === 'HUNTER' ? avatarStyles.hunter : avatarStyles.runner}>
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
          </AnimatedCard>

          {/* 主持人操作 */}
          {game?.status === 'LOBBY' && (
            <AnimatedCard animation="grow" timeout={1400}>
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    主持人操作
                  </Typography>
                  <Stack spacing={2} mt={3}>
                    <EnhancedButton
                      fullWidth
                      startIcon={<ShuffleIcon />}
                      onClick={handleAssignTeams}
                      sx={{ py: 2, fontSize: '1rem' }}
                    >
                      分配阵营
                    </EnhancedButton>
                    <EnhancedButton
                      variant="success"
                      fullWidth
                      startIcon={<PlayIcon />}
                      onClick={handleStart}
                      sx={{ py: 2, fontSize: '1rem' }}
                    >
                      开始游戏
                    </EnhancedButton>
                    {user?.isAdmin && (
                      <EnhancedButton
                        variant="error"
                        fullWidth
                        startIcon={<AdminIcon />}
                        onClick={() => navigate(`/admin/${gameId}`)}
                        sx={{ py: 2, fontSize: '1rem' }}
                      >
                        管理员面板
                      </EnhancedButton>
                    )}
                  </Stack>
                </CardContent>
            </AnimatedCard>
          )}

          {game?.status === 'RUNNING' && (
            <AnimatedCard animation="grow" timeout={1400}>
              <EnhancedButton
                fullWidth
                startIcon={<PlayIcon />}
                onClick={() => navigate(`/play/${gameId}`)}
                sx={{ py: 2.5, fontSize: '1.2rem' }}
              >
                进入游戏
              </EnhancedButton>
            </AnimatedCard>
          )}
        </Stack>
      </Container>
    </Box>
    </Fade>
  );
}
