import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button } from '@mui/material';
import type { Plan } from '../../../types/Plans';

interface DeletePlanDialogProps {
  open: boolean;
  plan: Plan | null;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeletePlanDialog({ open, plan, onClose, onConfirm }: DeletePlanDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Eliminar plan</DialogTitle>
      <DialogContent>
        <DialogContentText>
          ¿Estás seguro de que quieres eliminar el plan "{plan?.name}"? Esta acción no se puede
          deshacer.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancelar
        </Button>
        <Button onClick={onConfirm} color="error" variant="contained">
          Eliminar
        </Button>
      </DialogActions>
    </Dialog>
  );
}