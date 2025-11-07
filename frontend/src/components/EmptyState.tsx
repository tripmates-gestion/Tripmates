import { Stack, Typography } from "@mui/material";

export function EmptyState({ title }: { title: string }) {
    return (
      <Stack alignItems="center" spacing={1.5} sx={{ py: 6 }}>
        <Typography variant="h6" fontWeight={800}>
          {title}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          No hay contenido por ahora.
        </Typography>
      </Stack>
    );
  }