import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  CardContent,
  Typography,
  Stack,
  Tabs,
  Tab,
  Snackbar,
  Alert,
  Chip,
  Badge,
  Fade,
} from '@mui/material';
import {
  Add as AddIcon,
  Print as PrintIcon,
  Refresh as RefreshIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  ArrowBack as BackIcon,
} from '@mui/icons-material';
import { admin, games } from '../api/client';
import { useGameStore } from '../store/gameStore';
import CreateItemDialog from '../components/CreateItemDialog';
import {
  ANIMATION_DURATION,
  buttonStyles,
  chipStyles,
  getStaggeredDelay,
  backgroundGradients,
} from '../styles/shared';
import AnimatedCard from '../components/AnimatedCard';
import EnhancedButton from '../components/EnhancedButton';
import EnhancedAppBar from '../components/EnhancedAppBar';
import EmptyState from '../components/EmptyState';
import type { Game, Item, Capture } from '../types';

export default function AdminPage() {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const [game, setGame] = useState<Game | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [items, setItems] = useState<(Item & { qrCode: string })[]>([]);
  const [pendingCaptures, setPendingCaptures] = useState<Capture[]>([]);
  const [loading, setLoading] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as any });

  const user = useGameStore((state) => state.user);

  useEffect(() => {
    if (!user?.isAdmin) {
      navigate(-1);
      return;
    }
    loadData();
  }, [gameId, user]);

  const loadData = async () => {
    try {
      const [gameData, itemsData, capturesData] = await Promise.all([
        games.get(gameId!),
        admin.getGameItems(gameId!).catch(() => ({ items: [] })),
        admin.getPendingCaptures(gameId!).catch(() => []),
      ]);
      setGame(gameData);
      setItems(itemsData.items || []);
      setPendingCaptures(capturesData);
    } catch (err) {
      console.error('Load error:', err);
    }
  };

  const handleCreateItem = async (data: any) => {
    try {
      await admin.createItems(data);
      showSnackbar(`成功创建 ${data.count} 个道具`, 'success');
      loadData();
    } catch (err: any) {
      showSnackbar(err.response?.data?.error || '创建失败', 'error');
    }
  };

  const handleVerifyCapture = async (captureId: string, approved: boolean) => {
    setLoading(true);
    try {
      await admin.verifyCapture(captureId, approved ? 'APPROVED' : 'REJECTED');
      showSnackbar(approved ? '已通过' : '已拒绝', 'success');
      loadData();
    } catch (err: any) {
      showSnackbar(err.response?.data?.error || '操作失败', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePrintQR = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${game?.name} - 道具二维码</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
            .item-card { page-break-after: always; text-align: center; padding: 40px; border: 2px solid #333; margin-bottom: 20px; }
            .item-card:last-child { page-break-after: auto; }
            .qr-code { max-width: 300px; margin: 20px auto; }
            h1 { margin: 10px 0; font-size: 24px; }
            @media print { body { padding: 0; } .item-card { border: none; margin: 0; } }
          </style>
        </head>
        <body>
          ${items.map(item => `
            <div class="item-card">
              <h1>${item.name}</h1>
              <img src="${item.qrCode}" class="qr-code" />
              <p>${item.description || ''}</p>
              <p>类型: ${item.type} | 时长: ${item.durationSec}秒</p>
            </div>
          `).join('')}
          <script>window.onload = () => window.print();</script>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  const showSnackbar = (message: string, severity: any) => {
    setSnackbar({ open: true, message, severity });
  };

  if (!user?.isAdmin) return null;

  return (
    <Fade in timeout={ANIMATION_DURATION.normal}>
      <Box sx={{ minHeight: '100vh', background: backgroundGradients.warning }}>
        {/* 顶部导航栏 */}
        <EnhancedAppBar
          variant="admin"
          title="管理员面板"
          leftIcon={<BackIcon />}
          onLeftClick={() => navigate(-1)}
          rightContent={
            <Chip
              label={`${game?.name} (${gameId})`}
              sx={chipStyles.glassmorphism}
            />
          }
        />

        {/* 标签页 */}
        <Box
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            bgcolor: 'white',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
          }}
        >
          <Container maxWidth="lg">
            <Tabs
              value={activeTab}
              onChange={(_, v) => setActiveTab(v)}
              sx={{
                '& .MuiTab-root': {
                  fontWeight: 600,
                  fontSize: '1rem',
                },
              }}
            >
              <Tab
                label={
                  <Badge badgeContent={items.length} color="primary">
                    道具管理
                  </Badge>
                }
              />
              <Tab
                label={
                  <Badge badgeContent={pendingCaptures.length} color="error">
                    捕捉审核
                  </Badge>
                }
              />
            </Tabs>
          </Container>
        </Box>

      {/* 内容区域 */}
      <Container maxWidth="lg" sx={{ py: 3 }}>
        {activeTab === 0 && (
          <Stack spacing={3}>
            {/* 操作按钮 */}
            <Fade in timeout={ANIMATION_DURATION.slow}>
              <Stack direction="row" spacing={2} flexWrap="wrap">
                <EnhancedButton
                  startIcon={<AddIcon />}
                  onClick={() => setCreateDialogOpen(true)}
                  sx={{ px: 3 }}
                >
                  创建道具
                </EnhancedButton>
                <EnhancedButton
                  variant="outlined"
                  startIcon={<PrintIcon />}
                  onClick={handlePrintQR}
                  disabled={items.length === 0}
                  sx={{ px: 3 }}
                >
                  打印二维码
                </EnhancedButton>
                <EnhancedButton
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={loadData}
                  sx={{ px: 3 }}
                >
                  刷新
                </EnhancedButton>
              </Stack>
            </Fade>

            {/* 道具网格 */}
            {items.length === 0 ? (
              <AnimatedCard animation="grow" timeout={ANIMATION_DURATION.slower}>
                <EmptyState
                  icon={<AddIcon />}
                  title="还没有道具"
                  description="点击"创建道具"按钮来添加游戏道具"
                />
              </AnimatedCard>
            ) : (
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: '1fr',
                    sm: 'repeat(2, 1fr)',
                    md: 'repeat(3, 1fr)',
                  },
                  gap: 3,
                }}
              >
                {items.map((item, idx) => (
                  <AnimatedCard
                    key={item.id}
                    variant="gradient"
                    animation="zoom"
                    timeout={getStaggeredDelay(idx)}
                    sx={{
                      '&:hover': {
                        transform: 'translateY(-8px) scale(1.02)',
                      },
                    }}
                  >
                      <CardContent sx={{ p: 3 }}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Box
                            sx={{
                              p: 2,
                              borderRadius: 3,
                              bgcolor: 'white',
                              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                              display: 'inline-block',
                              mb: 2,
                            }}
                          >
                            <img
                              src={item.qrCode}
                              alt={item.name}
                              style={{ width: '100%', maxWidth: 180, display: 'block' }}
                            />
                          </Box>
                          <Typography variant="h6" fontWeight="bold" mt={2} gutterBottom>
                            {item.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            {item.description}
                          </Typography>
                          <Stack direction="row" spacing={1} justifyContent="center" mt={2} flexWrap="wrap">
                            <Chip label={item.type} size="small" sx={{ fontWeight: 600 }} />
                            <Chip label={`${item.durationSec}秒`} size="small" sx={{ fontWeight: 600 }} />
                            <Chip
                              label={item.isUsed ? '已使用' : '未使用'}
                              size="small"
                              color={item.isUsed ? 'default' : 'success'}
                              sx={{ fontWeight: 600 }}
                            />
                          </Stack>
                        </Box>
                      </CardContent>
                  </AnimatedCard>
                ))}
              </Box>
            )}
          </Stack>
        )}

        {activeTab === 1 && (
          <Stack spacing={3}>
            <Fade in timeout={ANIMATION_DURATION.slow}>
              <EnhancedButton
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={loadData}
                sx={{ alignSelf: 'flex-start', px: 3 }}
              >
                刷新
              </EnhancedButton>
            </Fade>

            {pendingCaptures.length === 0 ? (
              <AnimatedCard animation="grow" timeout={ANIMATION_DURATION.slower}>
                <EmptyState
                  icon={<CheckIcon />}
                  title="没有待审核的捕捉"
                  description="所有捕捉记录都已处理完成"
                />
              </AnimatedCard>
            ) : (
              pendingCaptures.map((capture, idx) => (
                <AnimatedCard
                  key={capture.id}
                  variant="gradient"
                  animation="zoom"
                  timeout={getStaggeredDelay(idx, 1000, 150)}
                >
                    <CardContent sx={{ p: 3 }}>
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: { xs: 'column', md: 'row' },
                          gap: 3,
                        }}
                      >
                        <Box sx={{ flex: { xs: '1', md: '0 0 35%' } }}>
                          <Box
                            sx={{
                              borderRadius: 3,
                              overflow: 'hidden',
                              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                            }}
                          >
                            <img
                              src={capture.photoUrl}
                              alt="Capture"
                              style={{ width: '100%', display: 'block' }}
                            />
                          </Box>
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Stack spacing={3}>
                            <Box>
                              <Typography variant="h5" fontWeight="bold" gutterBottom>
                                捕捉记录
                              </Typography>
                              <Stack spacing={1} mt={2}>
                                <Box>
                                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                    猎人 → 逃亡者
                                  </Typography>
                                  <Typography variant="body1" fontWeight={600}>
                                    {capture.hunter?.nickname || '未知'} → {capture.runner?.nickname || '未知'}
                                  </Typography>
                                </Box>
                                <Box>
                                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                    位置坐标
                                  </Typography>
                                  <Typography variant="body2" fontFamily="monospace">
                                    {capture.lat.toFixed(6)}, {capture.lng.toFixed(6)}
                                  </Typography>
                                </Box>
                                <Box>
                                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                    提交时间
                                  </Typography>
                                  <Typography variant="body2">
                                    {new Date(capture.createdAt).toLocaleString('zh-CN')}
                                  </Typography>
                                </Box>
                              </Stack>
                            </Box>
                            <Stack direction="row" spacing={2}>
                              <EnhancedButton
                                variant="success"
                                startIcon={<CheckIcon />}
                                onClick={() => handleVerifyCapture(capture.id, true)}
                                disabled={loading}
                                sx={{ px: 4, flex: 1 }}
                              >
                                通过
                              </EnhancedButton>
                              <EnhancedButton
                                variant="error"
                                startIcon={<CloseIcon />}
                                onClick={() => handleVerifyCapture(capture.id, false)}
                                disabled={loading}
                                sx={{ px: 4, flex: 1 }}
                              >
                                拒绝
                              </EnhancedButton>
                            </Stack>
                          </Stack>
                        </Box>
                      </Box>
                    </CardContent>
                </AnimatedCard>
              ))
            )}
          </Stack>
        )}
      </Container>

      {/* 创建道具对话框 */}
      <CreateItemDialog
        open={createDialogOpen}
        gameId={gameId!}
        onClose={() => setCreateDialogOpen(false)}
        onCreate={handleCreateItem}
      />

      {/* 提示消息 */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={snackbar.severity}
          sx={{
            borderRadius: 3,
            fontWeight: 600,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
    </Fade>
  );
}
