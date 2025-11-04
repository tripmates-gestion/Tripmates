import { Stack, Chip, Typography } from '@mui/material';

const DAYS = [
  { value: 'MONDAY', label: 'Lun' },
  { value: 'TUESDAY', label: 'Mar' },
  { value: 'WEDNESDAY', label: 'Mié' },
  { value: 'THURSDAY', label: 'Jue' },
  { value: 'FRIDAY', label: 'Vie' },
  { value: 'SATURDAY', label: 'Sáb' },
  { value: 'SUNDAY', label: 'Dom' },
];

export default function DaysSelector({
  value, onChange, disabled,
}: { value: string[]; onChange: (v: string[]) => void; disabled?: boolean }) {
  const toggle = (d: string) => {
    if (disabled) return;
    onChange(value.includes(d) ? value.filter(x => x!==d) : [...value, d]);
  };
  return (
    <Stack spacing={1}>
      <Typography variant="subtitle2" fontWeight={700}>Días de atención</Typography>
      <Stack direction="row" spacing={1} flexWrap="wrap">
        {DAYS.map(d => (
          <Chip
            key={d.value}
            label={d.label}
            color={value.includes(d.value) ? 'primary' : 'default'}
            variant={value.includes(d.value) ? 'filled' : 'outlined'}
            onClick={() => toggle(d.value)}
            disabled={disabled}
            sx={{ mb: 1 }}
          />
        ))}
      </Stack>
    </Stack>
  );
}
