import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Tab,
  Tabs,
  Alert,
  CircularProgress,
  Stack,
  Paper,
  Switch,
  FormControlLabel,
  Fade,
  Zoom,
} from '@mui/material';
import {
  SportsEsports as GameIcon,
  PersonAdd as PersonAddIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { auth, games } from '../api/client';
import { useGameStore } from '../store/gameStore';
import { gradients } from '../theme';

export default function JoinPage() {
  const [nickname, setNickname] = useState('');
  const [gameId, setGameId] = useState('');
  const [createMode, setCreateMode] = useState(false);
  const [gameName, setGameName] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
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
      const { user } = await auth.anonLogin(nickname, isAdmin);
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
    <Fade in timeout={600}>
      <Box
        sx={{
          minHeight: '100vh',
          background: gradients.primary,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: -100,
            right: -100,
            width: 400,
            height: 400,
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.1)',
            animation: 'pulse 4s ease-in-out infinite',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: -150,
            left: -150,
            width: 500,
            height: 500,
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.05)',
            animation: 'pulse 6s ease-in-out infinite',
          },
        }}
      >
        <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
          <Zoom in timeout={800}>
            <Card
              elevation={24}
              sx={{
                borderRadius: 6,
                overflow: 'visible',
                backdropFilter: 'blur(20px)',
                background: 'rgba(255, 255, 255, 0.95)',
              }}
            >
              <CardContent sx={{ p: 5 }}>
                {/* 标题 */}
                <Stack spacing={2} alignItems="center" mb={4}>
                  <Box
                    sx={{
                      width: 96,
                      height: 96,
                      borderRadius: '50%',
                      background: gradients.primary,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 10px 40px rgba(103, 80, 164, 0.4)',
                      animation: 'scaleIn 0.6s ease-out',
                    }}
                  >
                    <GameIcon sx={{ fontSize: 56, color: 'white' }} />
                  </Box>
                  <Typography
                    variant="h3"
                    component="h1"
                    fontWeight="bold"
                    textAlign="center"
                    sx={{
                      background: gradients.primary,
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      animation: 'fadeIn 0.8s ease-out',
                    }}
                  >
                    INF 猎捕行动
                  </Typography>
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    textAlign="center"
                    sx={{ animation: 'fadeIn 1s ease-out' }}
                  >
                    实时位置捉人游戏 • 猎人 vs 逃亡者
                  </Typography>
                </Stack>

                {/* 表单 */}
                <Stack spacing={3}>
                  {/* 昵称输入 */}
                  <TextField
                    label="昵称"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder="输入你的昵称"
                    fullWidth
                    inputProps={{ maxLength: 20 }}
                    disabled={loading}
                    variant="outlined"
                  />

                  {/* 管理员开关 */}
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2.5,
                      bgcolor: 'rgba(103, 80, 164, 0.04)',
                      borderRadius: 3,
                      border: '1px solid rgba(103, 80, 164, 0.1)',
                      transition: 'all 0.3s',
                      '&:hover': {
                        bgcolor: 'rgba(103, 80, 164, 0.08)',
                        borderColor: 'rgba(103, 80, 164, 0.2)',
                      },
                    }}
                  >
                    <FormControlLabel
                      control={
                        <Switch
                          checked={isAdmin}
                          onChange={(e) => setIsAdmin(e.target.checked)}
                          disabled={loading}
                        />
                      }
                      label={
                        <Box>
                          <Typography variant="body1" fontWeight="600">
                            管理员模式
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            可创建道具和审核捕捉
                          </Typography>
                        </Box>
                      }
                    />
                  </Paper>

                  {/* 标签页切换 */}
                  <Tabs
                    value={createMode ? 1 : 0}
                    onChange={(_, value) => setCreateMode(value === 1)}
                    variant="fullWidth"
                    sx={{
                      borderRadius: 2,
                      bgcolor: 'rgba(0, 0, 0, 0.02)',
                      p: 0.5,
                      '& .MuiTab-root': {
                        borderRadius: 1.5,
                      },
                      '& .Mui-selected': {
                        bgcolor: 'white',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                      },
                    }}
                  >
                    <Tab
                      icon={<PersonAddIcon />}
                      iconPosition="start"
                      label="加入游戏"
                      disabled={loading}
                    />
                    <Tab
                      icon={<AddIcon />}
                      iconPosition="start"
                      label="创建游戏"
                      disabled={loading}
                    />
                  </Tabs>

                  {/* 加入/创建输入框 */}
                  {!createMode ? (
                    <TextField
                      label="游戏 ID"
                      value={gameId}
                      onChange={(e) => setGameId(e.target.value.toUpperCase())}
                      placeholder="例如: ABC123"
                      fullWidth
                      disabled={loading}
                      helperText="输入6位游戏代码"
                    />
                  ) : (
                    <TextField
                      label="游戏名称"
                      value={gameName}
                      onChange={(e) => setGameName(e.target.value)}
                      placeholder="输入游戏名称"
                      fullWidth
                      inputProps={{ maxLength: 50 }}
                      disabled={loading}
                    />
                  )}

                  {/* 错误提示 */}
                  {error && (
                    <Alert
                      severity="error"
                      onClose={() => setError('')}
                      sx={{ borderRadius: 2 }}
                    >
                      {error}
                    </Alert>
                  )}

                  {/* 提交按钮 */}
                  <Button
                    variant="contained"
                    size="large"
                    onClick={handleJoin}
                    disabled={loading}
                    fullWidth
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
                    sx={{
                      py: 2,
                      fontSize: '1.1rem',
                      fontWeight: 'bold',
                      background: gradients.primary,
                      boxShadow: '0 8px 24px rgba(103, 80, 164, 0.4)',
                      '&:hover': {
                        background: gradients.primary,
                        boxShadow: '0 12px 32px rgba(103, 80, 164, 0.5)',
                      },
                    }}
                  >
                    {loading ? '处理中...' : createMode ? '创建并加入' : '加入游戏'}
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Zoom>

          {/* 底部说明 */}
          <Typography
            variant="caption"
            color="white"
            textAlign="center"
            display="block"
            mt={3}
            sx={{
              textShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
              animation: 'fadeIn 1.2s ease-out',
            }}
          >
            Powered by Material Design 3 • Enhanced Edition
          </Typography>
        </Container>
      </Box>
    </Fade>
  );
}
