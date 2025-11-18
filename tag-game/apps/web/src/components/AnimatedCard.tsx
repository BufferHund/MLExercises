import { Card, CardProps, Grow, Zoom, Fade } from '@mui/material';
import { cardStyles } from '../styles/shared';

interface AnimatedCardProps extends CardProps {
  variant?: 'elevated' | 'gradient' | 'dialog';
  animation?: 'grow' | 'zoom' | 'fade' | 'none';
  timeout?: number;
  children: React.ReactNode;
}

export default function AnimatedCard({
  variant = 'elevated',
  animation = 'grow',
  timeout = 600,
  children,
  sx,
  ...props
}: AnimatedCardProps) {
  const baseStyle = cardStyles[variant];
  const combinedSx = { ...baseStyle, ...sx };

  const cardElement = (
    <Card elevation={4} sx={combinedSx} {...props}>
      {children}
    </Card>
  );

  switch (animation) {
    case 'grow':
      return (
        <Grow in timeout={timeout}>
          {cardElement}
        </Grow>
      );
    case 'zoom':
      return (
        <Zoom in timeout={timeout}>
          {cardElement}
        </Zoom>
      );
    case 'fade':
      return (
        <Fade in timeout={timeout}>
          {cardElement}
        </Fade>
      );
    default:
      return cardElement;
  }
}
