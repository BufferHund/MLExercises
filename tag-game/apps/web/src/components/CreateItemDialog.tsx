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
} from '@mui/material';

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
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>创建道具</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <FormControl fullWidth>
            <InputLabel>道具类型</InputLabel>
            <Select
              value={type}
              label="道具类型"
              onChange={(e) => setType(e.target.value)}
            >
              <MenuItem value="STEALTH">隐身</MenuItem>
              <MenuItem value="BOOST">加速</MenuItem>
              <MenuItem value="RADAR">雷达</MenuItem>
              <MenuItem value="REFLECT">反射</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="道具名称"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            required
          />

          <TextField
            label="道具描述"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            multiline
            rows={2}
          />

          <TextField
            label="持续时间（秒）"
            type="number"
            value={durationSec}
            onChange={(e) => setDurationSec(parseInt(e.target.value))}
            fullWidth
          />

          <TextField
            label="创建数量"
            type="number"
            value={count}
            onChange={(e) => setCount(parseInt(e.target.value))}
            fullWidth
            inputProps={{ min: 1, max: 100 }}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>取消</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || !name.trim()}
        >
          创建
        </Button>
      </DialogActions>
    </Dialog>
  );
}
