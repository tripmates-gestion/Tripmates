import { Button, Stack } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { PAGES_ROUTE } from '../../constants/Pages';

export function MainLinks() {
  return (
    <Stack direction="row" spacing={1}>
      <Button color="inherit" component={RouterLink} to={PAGES_ROUTE.root}>Inicio</Button>
      <Button color="inherit" component={RouterLink} to={PAGES_ROUTE.search}>Buscar</Button>
    </Stack>
  );
}
