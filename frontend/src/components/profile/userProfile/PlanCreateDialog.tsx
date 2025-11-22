import { Dialog, DialogActions, DialogContent, DialogTitle, Button, TextField } from '@mui/material';

interface PlanCreateDialogProps {
  open: boolean;
  planName: string;
  planDescription: string;
  onClose: () => void;
  onSubmit: () => void;
  onNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
}

export function PlanCreateDialog({
  open,
  planName,
  planDescription,
  onClose,
  onSubmit,
  onNameChange,
  onDescriptionChange,
}: PlanCreateDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Crear nuevo plan de viaje</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Nombre del plan"
          type="text"
          fullWidth
          variant="outlined"
          value={planName}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="Ej: Viaje a Europa 2025"
          sx={{ mb: 2 }}
        />
        <TextField
          margin="dense"
          label="Descripción (opcional)"
          type="text"
          fullWidth
          variant="outlined"
          multiline
          rows={3}
          value={planDescription}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="Describe brevemente tu plan de viaje..."
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              onSubmit();
            }
          }}
        />
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => {
            onNameChange('');
            onDescriptionChange('');
            onClose();
          }}
          color="inherit"
        >
          Cancelar
        </Button>
        <Button onClick={onSubmit} variant="contained" disabled={!planName.trim()}>
          Crear plan
        </Button>
      </DialogActions>
    </Dialog>
  );
}