import { Box, Typography, Fade } from '@mui/material';
import { emptyStateStyles } from '../styles/shared';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <Fade in timeout={600}>
      <Box sx={emptyStateStyles.container}>
        <Box sx={emptyStateStyles.icon}>{icon}</Box>
        <Typography variant="h6" color="text.secondary" gutterBottom fontWeight={600}>
          {title}
        </Typography>
        {description && (
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        )}
        {action && <Box sx={{ mt: 3 }}>{action}</Box>}
      </Box>
    </Fade>
  );
}
