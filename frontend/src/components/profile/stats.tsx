import { Stack, Typography } from '@mui/material';
// Label arriba en mayúsculas, número abajo (como TripAdvisor)
export const Stat = ({ label, value }: { label: string; value: number }) => (
  <Stack spacing={0.25} alignItems="center" minWidth={96}>
    <Typography
      variant="caption"
      sx={{ textTransform: 'uppercase', letterSpacing: 0.6, fontWeight: 700, color: 'text.secondary' }}
    >
      {label}
    </Typography>
    <Typography variant="h6" fontWeight={800} lineHeight={1.1}>
      {value}
    </Typography>
  </Stack>
);