import { Chip, Stack, Typography } from "@mui/material";
import { DAYS_ORDER } from "../../../constants/Days";


export function PriceBadge({ value }: { value?: string | null }) {
  if (!value) return null;

  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <Typography variant="body2">Precio promedio:</Typography>
      <Chip
        size="small"
        label={value}               // $, $$, $$$
        sx={{
          fontWeight: 700,
          color: "success.main",
          borderColor: "success.light",
        
        }}
        variant="outlined"
      />
    </Stack>
  );
}


export function OpeningDaysRow({ openingDays }: { openingDays?: string[] | null }) {
  const set = new Set(openingDays ?? []);
  return (
    <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 1 }}>
      {DAYS_ORDER.map(d => {
        const open = set.has(d.key);
        return (
          <Chip
            key={d.key}
            size="small"
            label={d.label}
            color={open ? "primary" : undefined}
            variant={open ? "filled" : "outlined"}
            sx={!open ? { color: "text.secondary", borderColor: "divider" } : undefined}
          />
        );
      })}
    </Stack>
  );
}