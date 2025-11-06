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
  Grid,
  IconButton,
  Snackbar,
  Alert,
  Chip,
  AppBar,
  Toolbar,
  Badge,
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
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* 顶部导航栏 */}
      <AppBar position="static" elevation={1}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={() => navigate(-1)}>
            <BackIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1, ml: 2 }}>
            管理员面板
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            {game?.name} ({gameId})
          </Typography>
        </Toolbar>
      </AppBar>

      {/* 标签页 */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
        <Container maxWidth="lg">
          <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)}>
            <Tab label={<Badge badgeContent={items.length} color="primary">道具管理</Badge>} />
            <Tab label={<Badge badgeContent={pendingCaptures.length} color="error">捕捉审核</Badge>} />
          </Tabs>
        </Container>
      </Box>

      {/* 内容区域 */}
      <Container maxWidth="lg" sx={{ py: 3 }}>
        {activeTab === 0 && (
          <Stack spacing={2}>
            {/* 操作按钮 */}
            <Stack direction="row" spacing={2}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setCreateDialogOpen(true)}
              >
                创建道具
              </Button>
              <Button
                variant="outlined"
                startIcon={<PrintIcon />}
                onClick={handlePrintQR}
                disabled={items.length === 0}
              >
                打印二维码
              </Button>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={loadData}
              >
                刷新
              </Button>
            </Stack>

            {/* 道具网格 */}
            {items.length === 0 ? (
              <Card>
                <CardContent sx={{ textAlign: 'center', py: 8 }}>
                  <Typography color="text.secondary">还没有道具</Typography>
                </CardContent>
              </Card>
            ) : (
              <Grid container spacing={2}>
                {items.map(item => (
                  <Grid item xs={12} sm={6} md={4} key={item.id}>
                    <Card>
                      <CardContent>
                        <Box sx={{ textAlign: 'center' }}>
                          <img src={item.qrCode} alt={item.name} style={{ width: '100%', maxWidth: 200 }} />
                          <Typography variant="h6" mt={2}>{item.name}</Typography>
                          <Typography variant="body2" color="text.secondary">{item.description}</Typography>
                          <Stack direction="row" spacing={1} justifyContent="center" mt={1}>
                            <Chip label={item.type} size="small" />
                            <Chip label={`${item.durationSec}秒`} size="small" />
                            <Chip label={item.isUsed ? '已使用' : '未使用'} size="small" color={item.isUsed ? 'default' : 'success'} />
                          </Stack>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Stack>
        )}

        {activeTab === 1 && (
          <Stack spacing={2}>
            <Button variant="outlined" startIcon={<RefreshIcon />} onClick={loadData} sx={{ alignSelf: 'flex-start' }}>
              刷新
            </Button>

            {pendingCaptures.length === 0 ? (
              <Card>
                <CardContent sx={{ textAlign: 'center', py: 8 }}>
                  <Typography color="text.secondary">没有待审核的捕捉</Typography>
                </CardContent>
              </Card>
            ) : (
              pendingCaptures.map(capture => (
                <Card key={capture.id}>
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={4}>
                        <img
                          src={capture.photoUrl}
                          alt="Capture"
                          style={{ width: '100%', borderRadius: 8 }}
                        />
                      </Grid>
                      <Grid item xs={12} md={8}>
                        <Stack spacing={2}>
                          <Box>
                            <Typography variant="h6">捕捉记录</Typography>
                            <Typography variant="body2" color="text.secondary">
                              猎人: {capture.hunter?.nickname || '未知'} →  逃亡者: {capture.runner?.nickname || '未知'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              位置: {capture.lat.toFixed(6)}, {capture.lng.toFixed(6)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {new Date(capture.createdAt).toLocaleString('zh-CN')}
                            </Typography>
                          </Box>
                          <Stack direction="row" spacing={1}>
                            <Button
                              variant="contained"
                              color="success"
                              startIcon={<CheckIcon />}
                              onClick={() => handleVerifyCapture(capture.id, true)}
                              disabled={loading}
                            >
                              通过
                            </Button>
                            <Button
                              variant="contained"
                              color="error"
                              startIcon={<CloseIcon />}
                              onClick={() => handleVerifyCapture(capture.id, false)}
                              disabled={loading}
                            >
                              拒绝
                            </Button>
                          </Stack>
                        </Stack>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
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
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}
