import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
  Zoom,
  Typography,
} from '@mui/material';
import { gradients } from '../theme';

interface CreateItemDialogProps {
  open: boolean;
  gameId: string;
  onClose: () => void;
  onCreate: (data: any) => Promise<void>;
}

export default function CreateItemDialog({
  open,
  gameId,
  onClose,
  onCreate,
}: CreateItemDialogProps) {
  const [type, setType] = useState('STEALTH');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [durationSec, setDurationSec] = useState(30);
  const [count, setCount] = useState(1);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) return;

    setLoading(true);
    try {
      await onCreate({
        gameId,
        type,
        name,
        description: description || undefined,
        durationSec,
        count,
      });
      onClose();
      setName('');
      setDescription('');
      setDurationSec(30);
      setCount(1);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
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
      <DialogTitle sx={{ pt: 3, pb: 2, px: 3 }}>
        <Typography variant="h5" fontWeight="bold">
          创建道具
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          为游戏添加新的道具
        </Typography>
      </DialogTitle>
      <DialogContent sx={{ px: 3 }}>
        <Stack spacing={3} sx={{ mt: 2 }}>
          <FormControl fullWidth>
            <InputLabel>道具类型</InputLabel>
            <Select
              value={type}
              label="道具类型"
              onChange={(e) => setType(e.target.value)}
              sx={{ borderRadius: 2 }}
            >
              <MenuItem value="STEALTH">🥷 隐身</MenuItem>
              <MenuItem value="BOOST">⚡ 加速</MenuItem>
              <MenuItem value="RADAR">📡 雷达</MenuItem>
              <MenuItem value="REFLECT">🛡️ 反射</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="道具名称"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            required
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              },
            }}
          />

          <TextField
            label="道具描述"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            multiline
            rows={3}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              },
            }}
          />

          <TextField
            label="持续时间（秒）"
            type="number"
            value={durationSec}
            onChange={(e) => setDurationSec(parseInt(e.target.value))}
            fullWidth
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              },
            }}
          />

          <TextField
            label="创建数量"
            type="number"
            value={count}
            onChange={(e) => setCount(parseInt(e.target.value))}
            fullWidth
            inputProps={{ min: 1, max: 100 }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              },
            }}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3, pt: 2 }}>
        <Button
          onClick={onClose}
          disabled={loading}
          size="large"
          sx={{
            borderRadius: 2,
            px: 3,
            fontWeight: 600,
          }}
        >
          取消
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || !name.trim()}
          size="large"
          sx={{
            borderRadius: 2,
            px: 4,
            fontWeight: 'bold',
            background: gradients.primary,
            boxShadow: '0 4px 14px rgba(103, 80, 164, 0.3)',
            '&:hover': {
              background: gradients.primary,
              boxShadow: '0 6px 20px rgba(103, 80, 164, 0.4)',
            },
          }}
        >
          创建
        </Button>
      </DialogActions>
    </Dialog>
  );
}
