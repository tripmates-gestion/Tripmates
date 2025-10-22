// components/ui/CountedTextField.tsx
import TextField, { type TextFieldProps } from '@mui/material/TextField';

type Props = Omit<TextFieldProps, 'value' | 'onChange'> & {
  value: string;
  onChange: (v: string) => void;
  maxLength: number;
};

export default function CountedTextField({
  value,
  onChange,
  maxLength,
  helperText,
  inputProps,
  ...props
}: Props) {
  const count = value?.length ?? 0;
  const atMax = count >= maxLength;
  const warn = !atMax && count >= Math.floor(maxLength * 0.9);
  const helperColor = atMax ? 'error.main' : warn ? 'warning.main' : 'text.secondary';

  return (
    <TextField
      {...props}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      inputProps={{ ...inputProps, maxLength }}
      error={atMax || props.error === true}
      helperText={helperText ?? `${count}/${maxLength}`}
      FormHelperTextProps={{
        sx: { ml: 'auto', textAlign: 'right', color: helperColor },
      }}
    />
  );
}
