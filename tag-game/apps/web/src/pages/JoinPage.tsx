import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Container,
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
} from '@mui/material';
import {
  SportsEsports as GameIcon,
  PersonAdd as PersonAddIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { auth, games } from '../api/client';
import { useGameStore } from '../store/gameStore';
import { liquidGlassInput, liquidGlassButton } from '../styles/liquidGlass';
import LiquidBackground from '../components/LiquidBackground';
import LiquidGlassCard from '../components/LiquidGlassCard';
import LanguageSwitcher from '../components/LanguageSwitcher';

export default function JoinPage() {
  const { t } = useTranslation();
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
    <LiquidBackground variant="primary">
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          p: 2,
        }}
      >
        <Container maxWidth="sm">
          <LiquidGlassCard variant="floating" timeout={1000}>
            {/* 语言切换器 */}
            <Box sx={{ position: 'absolute', top: 16, right: 16, zIndex: 10 }}>
              <LanguageSwitcher />
            </Box>
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
                    {t('app.name')}
                  </Typography>
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    textAlign="center"
                    sx={{ animation: 'fadeIn 1s ease-out' }}
                  >
                    {t('app.subtitle')}
                  </Typography>
                </Stack>

                {/* 表单 */}
                <Stack spacing={3}>
                  {/* 昵称输入 */}
                  <TextField
                    label={t('join.nickname')}
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder={t('join.nicknamePlaceholder')}
                    fullWidth
                    inputProps={{ maxLength: 20 }}
                    disabled={loading}
                    variant="outlined"
                    sx={liquidGlassInput}
                  />

                  {/* 管理员开关 */}
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2.5,
                      background: 'rgba(255, 255, 255, 0.6)',
                      backdropFilter: 'blur(15px)',
                      borderRadius: 3,
                      border: '1px solid rgba(103, 80, 164, 0.2)',
                      transition: 'all 0.3s cubic-bezier(0.23, 1, 0.32, 1)',
                      '&:hover': {
                        background: 'rgba(255, 255, 255, 0.7)',
                        border: '1px solid rgba(103, 80, 164, 0.3)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 16px rgba(103, 80, 164, 0.1)',
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
                            {t('join.adminMode')}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {t('join.adminModeDesc')}
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
                      label={t('join.tabJoin')}
                      disabled={loading}
                    />
                    <Tab
                      icon={<AddIcon />}
                      iconPosition="start"
                      label={t('join.tabCreate')}
                      disabled={loading}
                    />
                  </Tabs>

                  {/* 加入/创建输入框 */}
                  {!createMode ? (
                    <TextField
                      label={t('join.gameId')}
                      value={gameId}
                      onChange={(e) => setGameId(e.target.value.toUpperCase())}
                      placeholder={t('join.gameIdPlaceholder')}
                      fullWidth
                      disabled={loading}
                      helperText={t('join.gameIdHelper')}
                      sx={liquidGlassInput}
                    />
                  ) : (
                    <TextField
                      label={t('join.gameName')}
                      value={gameName}
                      onChange={(e) => setGameName(e.target.value)}
                      placeholder={t('join.gameNamePlaceholder')}
                      fullWidth
                      inputProps={{ maxLength: 50 }}
                      disabled={loading}
                      sx={liquidGlassInput}
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
                      ...liquidGlassButton.solid,
                      py: 2,
                      fontSize: '1.1rem',
                    }}
                  >
                    {loading ? t('join.processing') : createMode ? t('join.btnCreate') : t('join.btnJoin')}
                  </Button>
                </Stack>
              </CardContent>
          </LiquidGlassCard>

          {/* 底部说明 */}
          <Typography
            variant="caption"
            color="white"
            textAlign="center"
            display="block"
            mt={3}
            sx={{
              textShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
              backdropFilter: 'blur(10px)',
              background: 'rgba(255, 255, 255, 0.1)',
              padding: '8px 16px',
              borderRadius: '20px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
            }}
          >
            {t('app.poweredBy')}
          </Typography>
        </Container>
      </Box>
    </LiquidBackground>
  );
}
