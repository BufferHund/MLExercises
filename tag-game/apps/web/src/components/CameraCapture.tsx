import { useState, useRef, useEffect } from 'react';

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
      <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-lg p-6 max-w-sm w-full text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={onCancel}
            className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-6 rounded"
          >
            关闭
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* 视频预览或拍摄结果 */}
      <div className="flex-1 relative bg-black flex items-center justify-center">
        {capturedImage ? (
          <img
            src={capturedImage}
            alt="Captured"
            className="max-w-full max-h-full object-contain"
          />
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="max-w-full max-h-full object-contain"
          />
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* 控制按钮 */}
      <div className="bg-gray-900 p-6">
        {capturedImage ? (
          <div className="flex gap-4 justify-center">
            <button
              onClick={retake}
              className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-8 rounded-lg"
            >
              重拍
            </button>
            <button
              onClick={confirm}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-lg"
            >
              确认
            </button>
          </div>
        ) : (
          <div className="flex gap-4 justify-center">
            <button
              onClick={onCancel}
              className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-8 rounded-lg"
            >
              取消
            </button>
            <button
              onClick={takePhoto}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-12 rounded-full"
            >
              拍照
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
