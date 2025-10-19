import { Box, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

export function BrandLink({ to }: { to: string }) {
  return (
    <Box
      component={RouterLink}
      to={to}
      sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: 'inherit', textDecoration: 'none' }}
      aria-label="Ir al inicio"
    >
      <Box component="img" src="logo.png" alt="TripMates" sx={{ width: 42, height: 42, borderRadius: 1 }} />
      <Typography variant="h6" sx={{ fontWeight: 700 }}>TripMates</Typography>
    </Box>
  );
}
