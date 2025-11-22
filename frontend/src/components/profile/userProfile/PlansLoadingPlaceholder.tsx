import { Box, CircularProgress, Stack, Typography } from '@mui/material';

interface PlansLoadingPlaceholderProps {
  message?: string;
}

export function PlansLoadingPlaceholder({ message = 'Cargando tus planes...' }: PlansLoadingPlaceholderProps) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
      <Stack alignItems="center" spacing={1}>
        <CircularProgress size={32} />
        <Typography variant="body2" color="text.secondary">
          {message}
        </Typography>
      </Stack>
    </Box>
  );
}