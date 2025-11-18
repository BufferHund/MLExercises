import { Box } from '@mui/material';
import { liquidBubble, liquidGlassKeyframes } from '../styles/liquidGlass';

interface LiquidBackgroundProps {
  variant?: 'primary' | 'secondary' | 'gradient';
  children: React.ReactNode;
}

export default function LiquidBackground({ variant = 'primary', children }: LiquidBackgroundProps) {
  const getBackgroundGradient = () => {
    switch (variant) {
      case 'primary':
        return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
      case 'secondary':
        return 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)';
      case 'gradient':
        return 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)';
      default:
        return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    }
  };

  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: '100vh',
        background: getBackgroundGradient(),
        overflow: 'hidden',
      }}
    >
      {/* 注入关键帧动画 */}
      <style>{liquidGlassKeyframes}</style>

      {/* 液态泡泡层 1 */}
      <Box
        sx={{
          ...liquidBubble(300, 0),
          bottom: '-150px',
          left: '-150px',
          zIndex: 1,
        }}
      />

      {/* 液态泡泡层 2 */}
      <Box
        sx={{
          ...liquidBubble(250, 1),
          top: '-125px',
          right: '-125px',
          zIndex: 1,
        }}
      />

      {/* 液态泡泡层 3 */}
      <Box
        sx={{
          ...liquidBubble(200, 2),
          top: '50%',
          left: '-100px',
          zIndex: 1,
        }}
      />

      {/* 液态泡泡层 4 */}
      <Box
        sx={{
          ...liquidBubble(180, 3),
          bottom: '20%',
          right: '10%',
          zIndex: 1,
        }}
      />

      {/* 液态泡泡层 5 */}
      <Box
        sx={{
          ...liquidBubble(150, 1.5),
          top: '30%',
          right: '20%',
          zIndex: 1,
        }}
      />

      {/* 液态形态背景元素 */}
      <Box
        sx={{
          position: 'absolute',
          top: '-20%',
          right: '-10%',
          width: '60%',
          height: '60%',
          background: 'radial-gradient(circle, rgba(255, 255, 255, 0.15) 0%, transparent 70%)',
          borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%',
          animation: 'liquidMorphing 15s ease-in-out infinite, liquidFloat 20s ease-in-out infinite',
          filter: 'blur(40px)',
          zIndex: 1,
        }}
      />

      <Box
        sx={{
          position: 'absolute',
          bottom: '-30%',
          left: '-15%',
          width: '70%',
          height: '70%',
          background: 'radial-gradient(circle, rgba(255, 255, 255, 0.12) 0%, transparent 70%)',
          borderRadius: '30% 70% 70% 30% / 60% 40% 60% 40%',
          animation: 'liquidMorphing 18s ease-in-out infinite reverse, liquidFloat 25s ease-in-out infinite',
          filter: 'blur(50px)',
          zIndex: 1,
        }}
      />

      {/* 漂浮的小泡泡 */}
      {[...Array(8)].map((_, i) => (
        <Box
          key={i}
          sx={{
            position: 'absolute',
            bottom: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            width: `${30 + Math.random() * 40}px`,
            height: `${30 + Math.random() * 40}px`,
            borderRadius: '50%',
            background: 'radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.6), rgba(255, 255, 255, 0.1))',
            backdropFilter: 'blur(3px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            animation: `liquidBubble ${4 + Math.random() * 4}s ease-in-out infinite ${Math.random() * 3}s`,
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.5)',
            zIndex: 1,
          }}
        />
      ))}

      {/* 内容层 */}
      <Box sx={{ position: 'relative', zIndex: 2 }}>{children}</Box>
    </Box>
  );
}
