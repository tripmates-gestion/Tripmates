// BusinessMetricsButton.tsx
import * as React from 'react';
import { Button } from '@mui/material';
import { BusinessMetricsDialog }  from './BusinessMetricsDialog';
import BarChartIcon from '@mui/icons-material/BarChart';

interface Props {
    accessToken: string | null;
  }
  
export function BusinessMetricsButton({ accessToken }: Props) {
const [open, setOpen] = React.useState(false);

return (
    <>
    <Button
        variant="outlined"
        size="small"
        startIcon={<BarChartIcon fontSize="small" />}
        onClick={() => setOpen(true)}
    >
        Ver estadísticas
    </Button>

    <BusinessMetricsDialog
        open={open}
        onClose={() => setOpen(false)}
        accessToken={accessToken}
    />
    </>
);
}