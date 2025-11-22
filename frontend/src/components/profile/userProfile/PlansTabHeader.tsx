import { Box, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';


interface PlansTabHeaderProps {
    onCreateClick: () => void;
  }
  
export function PlansTabHeader({ onCreateClick }: PlansTabHeaderProps) {
return (
    <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-start' }}>
    <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={onCreateClick}
        sx={{
        borderRadius: 2,
        textTransform: 'none',
        px: 3,
        py: 1,
        }}
    >
        Crear nuevo plan
    </Button>
    </Box>
);
}