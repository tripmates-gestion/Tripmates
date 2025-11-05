import { Chip, Stack, Typography } from "@mui/material";
import { DAYS_ORDER } from "../../../constants/Days";

// dataURL (base64) -> File
export function dataURLtoFile(dataUrl: string, filename: string) {
  const arr = dataUrl.split(','), mime = arr[0].match(/:(.*?);/)?.[1] ?? 'image/jpeg';
  const bstr = atob(arr[1]); let n = bstr.length; const u8arr = new Uint8Array(n);
  while (n--) u8arr[n] = bstr.charCodeAt(n);
  return new File([u8arr], filename, { type: mime });
}


// Utils.ts
export function parseHours(s?: string) {
  if (!s) return undefined;
  const clean = s.replace(/[–—]/g, "-").trim();   // en dash/em dash -> hyphen
  const [open, close] = clean.split("-").map(t => t.trim());
  if (!/^\d{2}:\d{2}$/.test(open) || !/^\d{2}:\d{2}$/.test(close)) return undefined;
  return { openingTime: open, closingTime: close };
}

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