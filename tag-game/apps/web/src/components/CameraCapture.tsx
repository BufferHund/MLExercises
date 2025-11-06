import { useState, useRef, useEffect } from 'react';
import { Box, IconButton, Stack, Alert, Button, Fab } from '@mui/material';
import { Close as CloseIcon, CameraAlt as CameraIcon, Refresh as RefreshIcon, Check as CheckIcon } from '@mui/icons-material';

interface CameraCaptureProps {
  onCapture: (file: File) => void;
  onCancel: () => void;
}

export default function CameraCapture({ onCapture, onCancel }: CameraCaptureProps) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }, // 使用后置摄像头
        audio: false,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error('Camera access error:', err);
      setError('无法访问摄像头，请检查权限设置');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const takePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // 设置 canvas 尺寸为视频尺寸
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // 将视频帧绘制到 canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // 获取图片数据
    const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8);
    setCapturedImage(imageDataUrl);
    stopCamera();
  };

  const retake = () => {
    setCapturedImage(null);
    startCamera();
  };

  const confirm = () => {
    if (!capturedImage) return;

    // 将 base64 转换为 File 对象
    fetch(capturedImage)
      .then((res) => res.blob())
      .then((blob) => {
        const file = new File([blob], 'capture.jpg', { type: 'image/jpeg' });
        onCapture(file);
      });
  };

  if (error) {
    return (
      <Box
        sx={{
          position: 'fixed',
          inset: 0,
          bgcolor: 'rgba(0,0,0,0.9)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2,
        }}
      >
        <Box sx={{ maxWidth: 400 }}>
          <Alert severity="error" action={
            <Button color="inherit" size="small" onClick={onCancel}>关闭</Button>
          }>
            {error}
          </Alert>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        position: 'fixed',
        inset: 0,
        bgcolor: 'black',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* 顶部关闭按钮 */}
      <Box sx={{ position: 'absolute', top: 16, left: 16, zIndex: 1 }}>
        <IconButton onClick={onCancel} sx={{ color: 'white', bgcolor: 'rgba(0,0,0,0.5)' }}>
          <CloseIcon />
        </IconButton>
      </Box>

      {/* 视频预览或拍摄结果 */}
      <Box
        sx={{
          flex: 1,
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {capturedImage ? (
          <img
            src={capturedImage}
            alt="Captured"
            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
          />
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
          />
        )}
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </Box>

      {/* 控制按钮 */}
      <Box sx={{ bgcolor: 'rgba(0,0,0,0.8)', p: 3, pb: 4 }}>
        {capturedImage ? (
          <Stack direction="row" spacing={2} justifyContent="center">
            <Button
              variant="outlined"
              size="large"
              startIcon={<RefreshIcon />}
              onClick={retake}
              sx={{ color: 'white', borderColor: 'white' }}
            >
              重拍
            </Button>
            <Button
              variant="contained"
              size="large"
              color="success"
              startIcon={<CheckIcon />}
              onClick={confirm}
            >
              确认
            </Button>
          </Stack>
        ) : (
          <Stack direction="row" spacing={3} justifyContent="center" alignItems="center">
            <Fab
              color="error"
              size="large"
              onClick={takePhoto}
              sx={{ width: 80, height: 80 }}
            >
              <CameraIcon sx={{ fontSize: 40 }} />
            </Fab>
          </Stack>
        )}
      </Box>
    </Box>
  );
}
