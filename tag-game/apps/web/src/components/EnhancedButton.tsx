import { Button, ButtonProps } from '@mui/material';
import { buttonStyles } from '../styles/shared';

interface EnhancedButtonProps extends Omit<ButtonProps, 'variant'> {
  variant?: 'primary' | 'success' | 'error' | 'outlined';
  children: React.ReactNode;
}

export default function EnhancedButton({
  variant = 'primary',
  children,
  sx,
  size = 'large',
  ...props
}: EnhancedButtonProps) {
  const baseStyle = buttonStyles[variant];
  const combinedSx = { ...baseStyle, ...sx };

  // 对于 outlined，使用 MUI 的 outlined variant
  const muiVariant = variant === 'outlined' ? 'outlined' : 'contained';

  // 对于 success 和 error，使用 MUI 的 color prop
  const color = variant === 'success' ? 'success' : variant === 'error' ? 'error' : 'primary';

  return (
    <Button
      variant={muiVariant}
      color={variant === 'primary' || variant === 'outlined' ? 'primary' : color}
      size={size}
      sx={combinedSx}
      {...props}
    >
      {children}
    </Button>
  );
}
