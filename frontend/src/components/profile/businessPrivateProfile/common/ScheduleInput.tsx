import { TextField } from '@mui/material';

export default function ScheduleInput({
  value, onChange, disabled,
}: { value: string; onChange: (v: string)=>void; disabled?: boolean }) {
  return (
    <TextField
      label="Horario (HH:mm-HH:mm)"
      placeholder="09:00-18:00"
      fullWidth
      value={value}
      onChange={(e)=>onChange(e.target.value)}
      disabled={disabled}
    />
  );
}
