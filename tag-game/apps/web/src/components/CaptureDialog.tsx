import { useState } from 'react';
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
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[80vh] overflow-hidden">
        <div className="bg-red-600 text-white p-4">
          <h2 className="text-xl font-bold">选择抓捕目标</h2>
          <p className="text-sm opacity-90 mt-1">
            选择附近的逃亡者并拍摄他们的徽章
          </p>
        </div>

        <div className="p-4 overflow-y-auto max-h-96">
          {nearbyRunners.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>附近没有逃亡者</p>
              <p className="text-sm mt-2">靠近逃亡者后再尝试抓捕</p>
            </div>
          ) : (
            <div className="space-y-2">
              {nearbyRunners.map((runner, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectRunner(runner.userId)}
                  className="w-full bg-gray-100 hover:bg-gray-200 p-4 rounded-lg text-left transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-800">
                        逃亡者 #{idx + 1}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        距离: ~{Math.round(runner.lastSeenSec * 10)}米
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        最后更新: {runner.lastSeenSec}秒前
                      </p>
                    </div>
                    <div className="text-3xl">📸</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t">
          <button
            onClick={onCancel}
            className="w-full bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 rounded-lg"
          >
            取消
          </button>
        </div>
      </div>
    </div>
  );
}
