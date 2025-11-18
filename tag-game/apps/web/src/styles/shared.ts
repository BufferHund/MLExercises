import { SxProps, Theme } from '@mui/material';
import { gradients } from '../theme';

// ===== 动画时长常量 =====
export const ANIMATION_DURATION = {
  fast: 400,
  normal: 600,
  slow: 800,
  slower: 1000,
  slowest: 1200,
} as const;

// ===== 卡片样式 =====
export const cardStyles = {
  elevated: {
    borderRadius: 4,
    background: 'linear-gradient(135deg, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0.95) 100%)',
    transition: 'all 0.3s',
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: '0 12px 40px rgba(0, 0, 0, 0.12)',
    },
  } as SxProps<Theme>,

  gradient: {
    borderRadius: 4,
    background: 'linear-gradient(135deg, rgba(255, 255, 255, 1) 0%, rgba(247, 247, 255, 1) 100%)',
    transition: 'all 0.3s',
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: '0 12px 40px rgba(103, 80, 164, 0.15)',
    },
  } as SxProps<Theme>,

  dialog: {
    borderRadius: 5,
    background: 'linear-gradient(135deg, rgba(255, 255, 255, 1) 0%, rgba(247, 247, 255, 1) 100%)',
    boxShadow: '0 24px 48px rgba(0, 0, 0, 0.2)',
  } as SxProps<Theme>,
};

// ===== 按钮样式 =====
export const buttonStyles = {
  primary: {
    borderRadius: 2,
    fontWeight: 'bold',
    background: gradients.primary,
    boxShadow: '0 4px 14px rgba(103, 80, 164, 0.3)',
    '&:hover': {
      background: gradients.primary,
      boxShadow: '0 6px 20px rgba(103, 80, 164, 0.4)',
    },
  } as SxProps<Theme>,

  success: {
    borderRadius: 2,
    fontWeight: 'bold',
    boxShadow: '0 4px 12px rgba(46, 125, 50, 0.3)',
    '&:hover': {
      boxShadow: '0 6px 16px rgba(46, 125, 50, 0.4)',
    },
  } as SxProps<Theme>,

  error: {
    borderRadius: 2,
    fontWeight: 'bold',
    boxShadow: '0 4px 12px rgba(211, 47, 47, 0.3)',
    '&:hover': {
      boxShadow: '0 6px 16px rgba(211, 47, 47, 0.4)',
    },
  } as SxProps<Theme>,

  outlined: {
    borderRadius: 3,
    fontWeight: 600,
  } as SxProps<Theme>,
};

// ===== 列表项样式 =====
export const listItemStyles = {
  elevated: {
    borderRadius: 3,
    mb: 1.5,
    bgcolor: 'rgba(0, 0, 0, 0.02)',
    transition: 'all 0.2s',
    '&:hover': {
      bgcolor: 'rgba(103, 80, 164, 0.08)',
      transform: 'translateX(8px)',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
    },
    p: 2,
  } as SxProps<Theme>,

  simple: {
    borderRadius: 3,
    mb: 1,
    bgcolor: 'rgba(0, 0, 0, 0.02)',
    border: '1px solid rgba(0, 0, 0, 0.05)',
    transition: 'all 0.2s',
    '&:hover': {
      bgcolor: 'rgba(103, 80, 164, 0.05)',
      transform: 'translateX(4px)',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
    },
  } as SxProps<Theme>,
};

// ===== AppBar 样式 =====
export const appBarStyles = {
  hunter: {
    background: 'linear-gradient(135deg, #D32F2F 0%, #F44336 100%)',
    boxShadow: '0 4px 20px rgba(211, 47, 47, 0.3)',
  } as SxProps<Theme>,

  runner: {
    background: 'linear-gradient(135deg, #1976D2 0%, #2196F3 100%)',
    boxShadow: '0 4px 20px rgba(25, 118, 210, 0.3)',
  } as SxProps<Theme>,

  admin: {
    background: 'linear-gradient(135deg, #ED6C02 0%, #F57C00 100%)',
    boxShadow: '0 4px 20px rgba(237, 108, 2, 0.3)',
  } as SxProps<Theme>,

  primary: {
    background: gradients.primary,
    boxShadow: '0 4px 20px rgba(103, 80, 164, 0.3)',
  } as SxProps<Theme>,
};

// ===== 芯片样式 =====
export const chipStyles = {
  glassmorphism: {
    bgcolor: 'rgba(255, 255, 255, 0.25)',
    backdropFilter: 'blur(10px)',
    color: 'white',
    fontWeight: 600,
  } as SxProps<Theme>,

  elevated: {
    fontWeight: 600,
    px: 2,
  } as SxProps<Theme>,
};

// ===== FAB 按钮样式 =====
export const fabStyles = {
  primary: {
    background: gradients.primary,
    boxShadow: '0 6px 20px rgba(103, 80, 164, 0.4)',
    '&:hover': {
      background: gradients.primary,
      transform: 'scale(1.1)',
      boxShadow: '0 8px 28px rgba(103, 80, 164, 0.5)',
    },
  } as SxProps<Theme>,

  hunter: {
    background: 'linear-gradient(135deg, #D32F2F 0%, #F44336 100%)',
    boxShadow: '0 8px 28px rgba(211, 47, 47, 0.5)',
    animation: 'pulse 2s ease-in-out infinite',
    '&:hover': {
      background: 'linear-gradient(135deg, #D32F2F 0%, #F44336 100%)',
      transform: 'scale(1.15)',
      boxShadow: '0 12px 36px rgba(211, 47, 47, 0.6)',
    },
  } as SxProps<Theme>,

  secondary: {
    boxShadow: '0 6px 20px rgba(156, 39, 176, 0.4)',
    '&:hover': {
      transform: 'scale(1.1)',
      boxShadow: '0 8px 28px rgba(156, 39, 176, 0.5)',
    },
  } as SxProps<Theme>,
};

// ===== Drawer 样式 =====
export const drawerStyles = {
  bottomRounded: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    background: 'linear-gradient(to bottom, rgba(255, 255, 255, 1) 0%, rgba(247, 247, 255, 1) 100%)',
    boxShadow: '0 -8px 32px rgba(0, 0, 0, 0.15)',
  } as SxProps<Theme>,
};

// ===== 空状态样式 =====
export const emptyStateStyles = {
  container: {
    textAlign: 'center',
    py: 8,
    px: 3,
  } as SxProps<Theme>,

  icon: {
    fontSize: 80,
    color: 'text.disabled',
    mb: 3,
    opacity: 0.5,
  } as SxProps<Theme>,
};

// ===== 背景渐变 =====
export const backgroundGradients = {
  primary: 'linear-gradient(to bottom, rgba(103, 80, 164, 0.03) 0%, transparent 100%)',
  warning: 'linear-gradient(to bottom, rgba(237, 108, 2, 0.03) 0%, transparent 100%)',
  subtle: 'linear-gradient(135deg, rgba(255, 255, 255, 1) 0%, rgba(247, 247, 255, 1) 100%)',
};

// ===== IconButton 样式 =====
export const iconButtonStyles = {
  glassmorphism: {
    bgcolor: 'rgba(255, 255, 255, 0.15)',
    '&:hover': {
      bgcolor: 'rgba(255, 255, 255, 0.25)',
    },
  } as SxProps<Theme>,

  elevated: {
    bgcolor: 'rgba(0, 0, 0, 0.04)',
    '&:hover': {
      bgcolor: 'rgba(0, 0, 0, 0.08)',
    },
  } as SxProps<Theme>,
};

// ===== TextField 样式 =====
export const textFieldStyles = {
  rounded: {
    '& .MuiOutlinedInput-root': {
      borderRadius: 2,
    },
  } as SxProps<Theme>,
};

// ===== 头像样式 =====
export const avatarStyles = {
  hunter: {
    bgcolor: '#D32F2F',
    width: 48,
    height: 48,
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  } as SxProps<Theme>,

  runner: {
    bgcolor: '#1976D2',
    width: 48,
    height: 48,
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  } as SxProps<Theme>,
};

// ===== 动画延迟计算辅助函数 =====
export const getStaggeredDelay = (index: number, baseDelay: number = 1000, increment: number = 100) => {
  return baseDelay + index * increment;
};
