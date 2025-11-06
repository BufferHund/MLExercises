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
} from '@mui/material';
import {
  SportsEsports as GameIcon,
  PersonAdd as PersonAddIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { auth, games } from '../api/client';
import { useGameStore } from '../store/gameStore';

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
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <Container maxWidth="sm">
        <Card
          elevation={8}
          sx={{
            borderRadius: 4,
            overflow: 'visible',
          }}
        >
          <CardContent sx={{ p: 4 }}>
            {/* 标题 */}
            <Stack spacing={2} alignItems="center" mb={4}>
              <GameIcon sx={{ fontSize: 64, color: 'primary.main' }} />
              <Typography variant="h4" component="h1" fontWeight="bold" textAlign="center">
                INF 猎捕行动
              </Typography>
              <Typography variant="body2" color="text.secondary" textAlign="center">
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
              />

              {/* 管理员开关 */}
              <Paper
                variant="outlined"
                sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2 }}
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
                      <Typography variant="body2" fontWeight="medium">
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
                sx={{ borderBottom: 1, borderColor: 'divider' }}
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
                <Alert severity="error" onClose={() => setError('')}>
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
                startIcon={loading ? <CircularProgress size={20} /> : null}
                sx={{ py: 1.5, fontSize: '1rem', fontWeight: 'bold' }}
              >
                {loading ? '处理中...' : createMode ? '创建并加入' : '加入游戏'}
              </Button>
            </Stack>
          </CardContent>
        </Card>

        {/* 底部说明 */}
        <Typography
          variant="caption"
          color="white"
          textAlign="center"
          display="block"
          mt={2}
          sx={{ opacity: 0.9 }}
        >
          Powered by Material Design 3
        </Typography>
      </Container>
    </Box>
  );
}
