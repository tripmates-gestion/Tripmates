import { IconButton } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';

type Props = { mode: 'light' | 'dark'; setMode: (m: 'light' | 'dark') => void };

export function ThemeToggle({ mode, setMode }: Props) {
  const toggle = () => setMode(mode === 'light' ? 'dark' : 'light');
  return (
    <IconButton color="inherit" onClick={toggle} aria-label="toggle theme">
      {mode === 'light' ? <Brightness4Icon /> : <Brightness7Icon />}
    </IconButton>
  );
}
