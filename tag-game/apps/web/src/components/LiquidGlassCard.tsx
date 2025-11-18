import { Card, CardProps, Zoom } from '@mui/material';
import { liquidGlassCard, liquidGlassKeyframes } from '../styles/liquidGlass';

interface LiquidGlassCardProps extends Omit<CardProps, 'variant'> {
  variant?: 'default' | 'morphing' | 'floating';
  animation?: boolean;
  timeout?: number;
  children: React.ReactNode;
}

export default function LiquidGlassCard({
  variant = 'default',
  animation = true,
  timeout = 800,
  children,
  sx,
  ...props
}: LiquidGlassCardProps) {
  const baseStyle = liquidGlassCard[variant];
  const combinedSx = { ...baseStyle, ...sx };

  const cardElement = (
    <>
      <style>{liquidGlassKeyframes}</style>
      <Card elevation={0} sx={combinedSx} {...props}>
        {children}
      </Card>
    </>
  );

  if (animation) {
    return (
      <Zoom in timeout={timeout}>
        {cardElement}
      </Zoom>
    );
  }

  return cardElement;
}
