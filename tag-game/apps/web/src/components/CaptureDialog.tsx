import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Typography,
  Box,
  IconButton,
  Fade,
  Zoom,
} from '@mui/material';
import {
  Close as CloseIcon,
  CameraAlt as CameraIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import type { Position } from '../types';
import CameraCapture from './CameraCapture';
import { gradients } from '../theme';

interface CaptureDialogProps {
  nearbyRunners: Position[];
  onCapture: (runnerId: string, photo: File) => void;
  onCancel: () => void;
}

export default function CaptureDialog({
  nearbyRunners,
  onCapture,
  onCancel,
}: CaptureDialogProps) {
  const [selectedRunner, setSelectedRunner] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);

  const handleSelectRunner = (runnerId: string) => {
    setSelectedRunner(runnerId);
    setShowCamera(true);
  };

  const handlePhotoCapture = (file: File) => {
    if (selectedRunner) {
      onCapture(selectedRunner, file);
    }
  };

  const handleCameraCancel = () => {
    setShowCamera(false);
    setSelectedRunner(null);
  };

  if (showCamera) {
    return <CameraCapture onCapture={handlePhotoCapture} onCancel={handleCameraCancel} />;
  }

  return (
    <Dialog
      open={true}
      onClose={onCancel}
      maxWidth="sm"
      fullWidth
      TransitionComponent={Zoom}
      PaperProps={{
        sx: {
          borderRadius: 5,
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 1) 0%, rgba(247, 247, 255, 1) 100%)',
          boxShadow: '0 24px 48px rgba(0, 0, 0, 0.2)',
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pb: 2,
          pt: 3,
          px: 3,
        }}
      >
        <Box>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            选择抓捕目标
          </Typography>
          <Typography variant="body2" color="text.secondary">
            选择附近的逃亡者并拍摄他们的徽章
          </Typography>
        </Box>
        <IconButton
          onClick={onCancel}
          edge="end"
          sx={{
            bgcolor: 'rgba(0, 0, 0, 0.04)',
            '&:hover': {
              bgcolor: 'rgba(0, 0, 0, 0.08)',
            },
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {nearbyRunners.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8, px: 3 }}>
            <Fade in timeout={600}>
              <Box>
                <PersonIcon sx={{ fontSize: 80, color: 'text.disabled', mb: 3, opacity: 0.5 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom fontWeight={600}>
                  附近没有逃亡者
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  靠近逃亡者后再尝试抓捕
                </Typography>
              </Box>
            </Fade>
          </Box>
        ) : (
          <List sx={{ py: 2, px: 2 }}>
            {nearbyRunners.map((runner, idx) => (
              <Fade in timeout={400 + idx * 100} key={idx}>
                <ListItem disablePadding sx={{ mb: 1 }}>
                  <ListItemButton
                    onClick={() => handleSelectRunner(runner.userId)}
                    sx={{
                      py: 2.5,
                      px: 3,
                      borderRadius: 3,
                      bgcolor: 'rgba(0, 0, 0, 0.02)',
                      transition: 'all 0.2s',
                      '&:hover': {
                        bgcolor: 'rgba(211, 47, 47, 0.08)',
                        transform: 'translateX(8px)',
                        boxShadow: '0 4px 12px rgba(211, 47, 47, 0.15)',
                      },
                    }}
                  >
                    <ListItemIcon>
                      <Box
                        sx={{
                          width: 56,
                          height: 56,
                          borderRadius: '50%',
                          background: gradients.hunter,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          boxShadow: '0 4px 12px rgba(211, 47, 47, 0.3)',
                        }}
                      >
                        <PersonIcon sx={{ fontSize: 28 }} />
                      </Box>
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle1" fontWeight="bold">
                          逃亡者 #{idx + 1}
                        </Typography>
                      }
                      secondary={
                        <Box sx={{ mt: 0.5 }}>
                          <Typography variant="body2" color="text.secondary" fontWeight={500}>
                            距离: ~{Math.round(runner.lastSeenSec * 10)}米
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            最后更新: {runner.lastSeenSec}秒前
                          </Typography>
                        </Box>
                      }
                    />
                    <CameraIcon
                      sx={{
                        color: 'error.main',
                        fontSize: 36,
                        transition: 'transform 0.2s',
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              </Fade>
            ))}
          </List>
        )}
      </DialogContent>
    </Dialog>
  );
}
