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
} from '@mui/material';
import {
  Close as CloseIcon,
  CameraAlt as CameraIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import type { Position } from '../types';
import CameraCapture from './CameraCapture';

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
      PaperProps={{
        sx: {
          borderRadius: 3,
        },
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
        <Box>
          <Typography variant="h6" fontWeight="bold">
            选择抓捕目标
          </Typography>
          <Typography variant="body2" color="text.secondary">
            选择附近的逃亡者并拍摄他们的徽章
          </Typography>
        </Box>
        <IconButton onClick={onCancel} edge="end">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {nearbyRunners.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8, px: 3 }}>
            <PersonIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
            <Typography color="text.secondary" gutterBottom>
              附近没有逃亡者
            </Typography>
            <Typography variant="body2" color="text.secondary">
              靠近逃亡者后再尝试抓捕
            </Typography>
          </Box>
        ) : (
          <List sx={{ py: 1 }}>
            {nearbyRunners.map((runner, idx) => (
              <ListItem key={idx} disablePadding>
                <ListItemButton
                  onClick={() => handleSelectRunner(runner.userId)}
                  sx={{
                    py: 2,
                    px: 3,
                    '&:hover': {
                      bgcolor: 'action.hover',
                    },
                  }}
                >
                  <ListItemIcon>
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: '50%',
                        bgcolor: 'primary.main',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                      }}
                    >
                      <PersonIcon />
                    </Box>
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography variant="subtitle1" fontWeight="medium">
                        逃亡者 #{idx + 1}
                      </Typography>
                    }
                    secondary={
                      <>
                        <Typography variant="body2" color="text.secondary">
                          距离: ~{Math.round(runner.lastSeenSec * 10)}米
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          最后更新: {runner.lastSeenSec}秒前
                        </Typography>
                      </>
                    }
                  />
                  <CameraIcon sx={{ color: 'primary.main', fontSize: 32 }} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>
    </Dialog>
  );
}
