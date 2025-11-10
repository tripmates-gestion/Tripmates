import { ButtonBase, CircularProgress, Stack, Typography } from '@mui/material';

type StatProps = {
  label: string;
  value: number;
  onClick?: () => void;
  loading?: boolean;
};

// Label arriba en mayúsculas, número abajo (como TripAdvisor)
export const Stat = ({ label, value, onClick, loading = false }: StatProps) => {
  const content = (
    <Stack spacing={0.25} alignItems="center" minWidth={96}>
      <Typography
        variant="caption"
        sx={{ textTransform: 'uppercase', letterSpacing: 0.6, fontWeight: 700, color: 'text.secondary' }}
      >
        {label}
      </Typography>
      <Typography variant="h6" fontWeight={800} lineHeight={1.1}>
        {loading ? <CircularProgress size={18} thickness={5} /> : value}
      </Typography>
    </Stack>
  );

  if (!onClick) {
    return content;
  }

  return (
    <ButtonBase
      onClick={onClick}
      sx={{
        borderRadius: 1,
        p: 1,
        transition: 'background-color 0.2s ease-in-out',
        '&:hover': { backgroundColor: 'action.hover' },
      }}
    >
      {content}
    </ButtonBase>
  );
};
