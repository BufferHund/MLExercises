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
  Tabs,
  Tab,
  IconButton,
  Snackbar,
  Alert,
  Chip,
  AppBar,
  Toolbar,
  Badge,
  Fade,
  Zoom,
  Grow,
  Slide,
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
import { gradients } from '../theme';
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
    <Fade in timeout={600}>
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(to bottom, rgba(237, 108, 2, 0.03) 0%, transparent 100%)',
        }}
      >
        {/* 顶部导航栏 */}
        <Slide in direction="down" timeout={600}>
          <AppBar
            position="static"
            elevation={4}
            sx={{
              background: 'linear-gradient(135deg, #ED6C02 0%, #F57C00 100%)',
              boxShadow: '0 4px 20px rgba(237, 108, 2, 0.3)',
            }}
          >
            <Toolbar>
              <IconButton
                edge="start"
                color="inherit"
                onClick={() => navigate(-1)}
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.15)',
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.25)',
                  },
                }}
              >
                <BackIcon />
              </IconButton>
              <Typography variant="h5" sx={{ flexGrow: 1, ml: 2, fontWeight: 'bold' }}>
                管理员面板
              </Typography>
              <Chip
                label={`${game?.name} (${gameId})`}
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.25)',
                  backdropFilter: 'blur(10px)',
                  color: 'white',
                  fontWeight: 600,
                }}
              />
            </Toolbar>
          </AppBar>
        </Slide>

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
            <Fade in timeout={800}>
              <Stack direction="row" spacing={2} flexWrap="wrap">
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<AddIcon />}
                  onClick={() => setCreateDialogOpen(true)}
                  sx={{
                    borderRadius: 3,
                    px: 3,
                    fontWeight: 'bold',
                    background: gradients.primary,
                    boxShadow: '0 4px 14px rgba(103, 80, 164, 0.3)',
                    '&:hover': {
                      background: gradients.primary,
                      boxShadow: '0 6px 20px rgba(103, 80, 164, 0.4)',
                    },
                  }}
                >
                  创建道具
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<PrintIcon />}
                  onClick={handlePrintQR}
                  disabled={items.length === 0}
                  sx={{
                    borderRadius: 3,
                    px: 3,
                    fontWeight: 600,
                  }}
                >
                  打印二维码
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<RefreshIcon />}
                  onClick={loadData}
                  sx={{
                    borderRadius: 3,
                    px: 3,
                    fontWeight: 600,
                  }}
                >
                  刷新
                </Button>
              </Stack>
            </Fade>

            {/* 道具网格 */}
            {items.length === 0 ? (
              <Grow in timeout={1000}>
                <Card
                  elevation={2}
                  sx={{
                    borderRadius: 4,
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0.95) 100%)',
                  }}
                >
                  <CardContent sx={{ textAlign: 'center', py: 10 }}>
                    <AddIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2, opacity: 0.5 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      还没有道具
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      点击"创建道具"按钮来添加游戏道具
                    </Typography>
                  </CardContent>
                </Card>
              </Grow>
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
                  <Zoom in timeout={1000 + idx * 100} key={item.id}>
                    <Card
                      elevation={4}
                      sx={{
                        borderRadius: 4,
                        background: 'linear-gradient(135deg, rgba(255, 255, 255, 1) 0%, rgba(247, 247, 255, 1) 100%)',
                        transition: 'all 0.3s',
                        '&:hover': {
                          transform: 'translateY(-8px) scale(1.02)',
                          boxShadow: '0 12px 36px rgba(0, 0, 0, 0.15)',
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
                    </Card>
                  </Zoom>
                ))}
              </Box>
            )}
          </Stack>
        )}

        {activeTab === 1 && (
          <Stack spacing={3}>
            <Fade in timeout={800}>
              <Button
                variant="outlined"
                size="large"
                startIcon={<RefreshIcon />}
                onClick={loadData}
                sx={{
                  alignSelf: 'flex-start',
                  borderRadius: 3,
                  px: 3,
                  fontWeight: 600,
                }}
              >
                刷新
              </Button>
            </Fade>

            {pendingCaptures.length === 0 ? (
              <Grow in timeout={1000}>
                <Card
                  elevation={2}
                  sx={{
                    borderRadius: 4,
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0.95) 100%)',
                  }}
                >
                  <CardContent sx={{ textAlign: 'center', py: 10 }}>
                    <CheckIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2, opacity: 0.5 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      没有待审核的捕捉
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      所有捕捉记录都已处理完成
                    </Typography>
                  </CardContent>
                </Card>
              </Grow>
            ) : (
              pendingCaptures.map((capture, idx) => (
                <Zoom in timeout={1000 + idx * 150} key={capture.id}>
                  <Card
                    elevation={4}
                    sx={{
                      borderRadius: 4,
                      background: 'linear-gradient(135deg, rgba(255, 255, 255, 1) 0%, rgba(247, 247, 255, 1) 100%)',
                      transition: 'all 0.3s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 12px 36px rgba(0, 0, 0, 0.15)',
                      },
                    }}
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
                              <Button
                                variant="contained"
                                color="success"
                                size="large"
                                startIcon={<CheckIcon />}
                                onClick={() => handleVerifyCapture(capture.id, true)}
                                disabled={loading}
                                sx={{
                                  borderRadius: 2,
                                  px: 4,
                                  fontWeight: 'bold',
                                  flex: 1,
                                  boxShadow: '0 4px 12px rgba(46, 125, 50, 0.3)',
                                  '&:hover': {
                                    boxShadow: '0 6px 16px rgba(46, 125, 50, 0.4)',
                                  },
                                }}
                              >
                                通过
                              </Button>
                              <Button
                                variant="contained"
                                color="error"
                                size="large"
                                startIcon={<CloseIcon />}
                                onClick={() => handleVerifyCapture(capture.id, false)}
                                disabled={loading}
                                sx={{
                                  borderRadius: 2,
                                  px: 4,
                                  fontWeight: 'bold',
                                  flex: 1,
                                  boxShadow: '0 4px 12px rgba(211, 47, 47, 0.3)',
                                  '&:hover': {
                                    boxShadow: '0 6px 16px rgba(211, 47, 47, 0.4)',
                                  },
                                }}
                              >
                                拒绝
                              </Button>
                            </Stack>
                          </Stack>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Zoom>
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
