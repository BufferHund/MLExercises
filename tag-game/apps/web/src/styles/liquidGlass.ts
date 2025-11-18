import { SxProps, Theme } from '@mui/material';

// ===== 液态玻璃关键帧动画 =====
export const liquidGlassKeyframes = `
  @keyframes liquidFloat {
    0%, 100% {
      transform: translateY(0) translateX(0) rotate(0deg);
      border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
    }
    25% {
      transform: translateY(-20px) translateX(10px) rotate(5deg);
      border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%;
    }
    50% {
      transform: translateY(-30px) translateX(-10px) rotate(-5deg);
      border-radius: 50% 50% 50% 50% / 50% 50% 50% 50%;
    }
    75% {
      transform: translateY(-20px) translateX(10px) rotate(3deg);
      border-radius: 70% 30% 40% 60% / 40% 70% 60% 30%;
    }
  }

  @keyframes liquidMorphing {
    0%, 100% {
      border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
    }
    25% {
      border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%;
    }
    50% {
      border-radius: 50% 50% 50% 50% / 50% 50% 50% 50%;
    }
    75% {
      border-radius: 70% 30% 40% 60% / 40% 70% 60% 30%;
    }
  }

  @keyframes liquidGlow {
    0%, 100% {
      box-shadow: 0 0 20px rgba(103, 80, 164, 0.3),
                  0 0 40px rgba(103, 80, 164, 0.2),
                  0 0 60px rgba(103, 80, 164, 0.1);
    }
    50% {
      box-shadow: 0 0 30px rgba(103, 80, 164, 0.4),
                  0 0 60px rgba(103, 80, 164, 0.3),
                  0 0 90px rgba(103, 80, 164, 0.2);
    }
  }

  @keyframes liquidWave {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }

  @keyframes liquidRipple {
    0% {
      transform: scale(0.95);
      opacity: 0.7;
    }
    50% {
      transform: scale(1.05);
      opacity: 0.3;
    }
    100% {
      transform: scale(0.95);
      opacity: 0.7;
    }
  }

  @keyframes liquidBubble {
    0% {
      transform: translateY(0) scale(1);
      opacity: 0;
    }
    50% {
      opacity: 0.6;
    }
    100% {
      transform: translateY(-100px) scale(0.5);
      opacity: 0;
    }
  }

  @keyframes liquidShimmer {
    0% {
      background-position: -1000px 0;
    }
    100% {
      background-position: 1000px 0;
    }
  }

  @keyframes liquidBreath {
    0%, 100% {
      transform: scale(1);
      filter: blur(0px);
    }
    50% {
      transform: scale(1.05);
      filter: blur(2px);
    }
  }
`;

// ===== 液态玻璃背景样式 =====
export const liquidGlassBackground = {
  primary: {
    background: `
      linear-gradient(135deg,
        rgba(103, 80, 164, 0.1) 0%,
        rgba(118, 75, 162, 0.1) 25%,
        rgba(103, 80, 164, 0.1) 50%,
        rgba(118, 75, 162, 0.1) 75%,
        rgba(103, 80, 164, 0.1) 100%
      )
    `,
    backgroundSize: '400% 400%',
    animation: 'liquidWave 15s ease-in-out infinite',
  } as SxProps<Theme>,

  gradient: {
    background: `
      linear-gradient(135deg,
        rgba(103, 80, 164, 0.15) 0%,
        rgba(156, 39, 176, 0.15) 50%,
        rgba(103, 80, 164, 0.15) 100%
      )
    `,
    backgroundSize: '200% 200%',
    animation: 'liquidWave 10s ease-in-out infinite',
  } as SxProps<Theme>,
};

// ===== 液态玻璃卡片样式 =====
export const liquidGlassCard = {
  default: {
    background: 'rgba(255, 255, 255, 0.7)',
    backdropFilter: 'blur(20px) saturate(180%)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    borderRadius: '24px',
    boxShadow: `
      0 8px 32px rgba(0, 0, 0, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.6)
    `,
    transition: 'all 0.5s cubic-bezier(0.23, 1, 0.32, 1)',
    position: 'relative',
    overflow: 'hidden',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: '-100%',
      width: '100%',
      height: '100%',
      background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent)',
      animation: 'liquidShimmer 3s infinite',
    },
    '&:hover': {
      transform: 'translateY(-8px) scale(1.02)',
      boxShadow: `
        0 16px 48px rgba(103, 80, 164, 0.2),
        inset 0 1px 0 rgba(255, 255, 255, 0.8)
      `,
      border: '1px solid rgba(103, 80, 164, 0.3)',
    },
  } as SxProps<Theme>,

  morphing: {
    background: 'rgba(255, 255, 255, 0.75)',
    backdropFilter: 'blur(25px) saturate(200%)',
    border: '2px solid rgba(255, 255, 255, 0.4)',
    borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%',
    boxShadow: `
      0 10px 40px rgba(103, 80, 164, 0.15),
      inset 0 2px 0 rgba(255, 255, 255, 0.7)
    `,
    animation: 'liquidMorphing 8s ease-in-out infinite',
    transition: 'all 0.6s cubic-bezier(0.23, 1, 0.32, 1)',
    position: 'relative',
    '&:hover': {
      animation: 'liquidMorphing 4s ease-in-out infinite, liquidGlow 2s ease-in-out infinite',
      transform: 'scale(1.05)',
    },
  } as SxProps<Theme>,

  floating: {
    background: 'rgba(255, 255, 255, 0.65)',
    backdropFilter: 'blur(30px) saturate(180%)',
    border: '1px solid rgba(255, 255, 255, 0.35)',
    borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%',
    boxShadow: `
      0 12px 48px rgba(103, 80, 164, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.65),
      0 0 0 1px rgba(103, 80, 164, 0.1)
    `,
    animation: 'liquidFloat 12s ease-in-out infinite',
    transition: 'all 0.7s cubic-bezier(0.23, 1, 0.32, 1)',
    '&:hover': {
      boxShadow: `
        0 20px 60px rgba(103, 80, 164, 0.3),
        inset 0 2px 0 rgba(255, 255, 255, 0.8),
        0 0 0 2px rgba(103, 80, 164, 0.2)
      `,
    },
  } as SxProps<Theme>,
};

// ===== 液态玻璃按钮样式 =====
export const liquidGlassButton = {
  primary: {
    background: 'rgba(103, 80, 164, 0.15)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(103, 80, 164, 0.3)',
    borderRadius: '50px',
    color: '#6750A4',
    fontWeight: 'bold',
    padding: '12px 32px',
    position: 'relative',
    overflow: 'hidden',
    transition: 'all 0.4s cubic-bezier(0.23, 1, 0.32, 1)',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: '50%',
      left: '50%',
      width: '0',
      height: '0',
      borderRadius: '50%',
      background: 'rgba(103, 80, 164, 0.3)',
      transform: 'translate(-50%, -50%)',
      transition: 'width 0.6s, height 0.6s',
    },
    '&:hover': {
      background: 'rgba(103, 80, 164, 0.25)',
      border: '1px solid rgba(103, 80, 164, 0.5)',
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 24px rgba(103, 80, 164, 0.3)',
      '&::before': {
        width: '300px',
        height: '300px',
      },
    },
    '&:active': {
      transform: 'translateY(0) scale(0.98)',
    },
  } as SxProps<Theme>,

  solid: {
    background: 'linear-gradient(135deg, rgba(103, 80, 164, 0.9), rgba(118, 75, 162, 0.9))',
    backdropFilter: 'blur(15px)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    borderRadius: '50px',
    color: 'white',
    fontWeight: 'bold',
    padding: '14px 36px',
    boxShadow: `
      0 8px 24px rgba(103, 80, 164, 0.4),
      inset 0 1px 0 rgba(255, 255, 255, 0.3)
    `,
    transition: 'all 0.4s cubic-bezier(0.23, 1, 0.32, 1)',
    position: 'relative',
    overflow: 'hidden',
    '&::after': {
      content: '""',
      position: 'absolute',
      top: '-50%',
      left: '-50%',
      width: '200%',
      height: '200%',
      background: 'radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, transparent 70%)',
      opacity: 0,
      transition: 'opacity 0.4s',
    },
    '&:hover': {
      transform: 'translateY(-3px)',
      boxShadow: `
        0 12px 32px rgba(103, 80, 164, 0.5),
        inset 0 1px 0 rgba(255, 255, 255, 0.4)
      `,
      '&::after': {
        opacity: 1,
      },
    },
  } as SxProps<Theme>,
};

// ===== 液态泡泡元素 =====
export const liquidBubble = (size: number, delay: number = 0) => ({
  position: 'absolute',
  width: size,
  height: size,
  borderRadius: '50%',
  background: 'radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.8), rgba(103, 80, 164, 0.2))',
  backdropFilter: 'blur(5px)',
  border: '1px solid rgba(255, 255, 255, 0.4)',
  animation: `liquidBubble 6s ease-in-out infinite ${delay}s`,
  boxShadow: `
    0 4px 12px rgba(103, 80, 164, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.6)
  `,
} as SxProps<Theme>);

// ===== 液态玻璃输入框样式 =====
export const liquidGlassInput = {
  background: 'rgba(255, 255, 255, 0.6)',
  backdropFilter: 'blur(15px)',
  border: '1px solid rgba(255, 255, 255, 0.4)',
  borderRadius: '16px',
  transition: 'all 0.3s cubic-bezier(0.23, 1, 0.32, 1)',
  '& .MuiOutlinedInput-root': {
    background: 'rgba(255, 255, 255, 0.5)',
    backdropFilter: 'blur(10px)',
    borderRadius: '16px',
    '& fieldset': {
      borderColor: 'rgba(103, 80, 164, 0.2)',
      borderWidth: '1px',
      transition: 'all 0.3s',
    },
    '&:hover fieldset': {
      borderColor: 'rgba(103, 80, 164, 0.4)',
      boxShadow: '0 0 0 4px rgba(103, 80, 164, 0.05)',
    },
    '&.Mui-focused fieldset': {
      borderColor: 'rgba(103, 80, 164, 0.6)',
      borderWidth: '2px',
      boxShadow: '0 0 0 4px rgba(103, 80, 164, 0.1)',
    },
  },
} as SxProps<Theme>;

// ===== 液态玻璃导航栏样式 =====
export const liquidGlassAppBar = {
  background: 'rgba(255, 255, 255, 0.7)',
  backdropFilter: 'blur(20px) saturate(180%)',
  borderBottom: '1px solid rgba(255, 255, 255, 0.3)',
  boxShadow: `
    0 4px 24px rgba(0, 0, 0, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.6)
  `,
} as SxProps<Theme>;

// ===== 辅助函数：创建液态渐变 =====
export const createLiquidGradient = (color1: string, color2: string, opacity: number = 0.1) => ({
  background: `linear-gradient(135deg, ${color1} 0%, ${color2} 50%, ${color1} 100%)`,
  backgroundSize: '200% 200%',
  animation: 'liquidWave 10s ease-in-out infinite',
  opacity,
});

// ===== 液态玻璃叠加层 =====
export const liquidGlassOverlay = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.3), transparent 70%)',
  pointerEvents: 'none',
  animation: 'liquidBreath 4s ease-in-out infinite',
} as SxProps<Theme>;
