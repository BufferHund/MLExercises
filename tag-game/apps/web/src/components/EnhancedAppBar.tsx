import { AppBar, Toolbar, Typography, IconButton, Slide, Box } from '@mui/material';
import { appBarStyles } from '../styles/shared';

interface EnhancedAppBarProps {
  variant: 'hunter' | 'runner' | 'admin' | 'primary';
  title: string;
  subtitle?: string;
  leftIcon?: React.ReactNode;
  rightContent?: React.ReactNode;
  onLeftClick?: () => void;
  timeout?: number;
}

export default function EnhancedAppBar({
  variant,
  title,
  subtitle,
  leftIcon,
  rightContent,
  onLeftClick,
  timeout = 600,
}: EnhancedAppBarProps) {
  return (
    <Slide in direction="down" timeout={timeout}>
      <AppBar position="static" elevation={4} sx={appBarStyles[variant]}>
        <Toolbar sx={{ py: 1 }}>
          {leftIcon && onLeftClick && (
            <IconButton
              edge="start"
              color="inherit"
              onClick={onLeftClick}
              sx={{
                bgcolor: 'rgba(255, 255, 255, 0.15)',
                mr: 2,
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.25)',
                },
              }}
            >
              {leftIcon}
            </IconButton>
          )}
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" noWrap fontWeight="bold">
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="caption" sx={{ opacity: 0.95 }}>
                {subtitle}
              </Typography>
            )}
          </Box>
          {rightContent}
        </Toolbar>
      </AppBar>
    </Slide>
  );
}
