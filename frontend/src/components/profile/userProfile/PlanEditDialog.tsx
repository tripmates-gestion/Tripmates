import { Dialog, DialogActions, DialogContent, DialogTitle, Button, TextField, Typography, Grid, Box } from '@mui/material';
import PublicationCard from '../../publications/PublicationCard';
import type { Plan } from '../../../types/Plans';

interface PlanEditDialogProps {
  open: boolean;
  plan: Plan | null;
  planName: string;
  planDescription: string;
  onClose: () => void;
  onSubmit: () => void;
  onNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  publicationsToDelete: number[];
  onTogglePublication: (publicationIndex: number, checked: boolean) => void;
}

export function PlanEditDialog({
  open,
  plan,
  planName,
  planDescription,
  onClose,
  onSubmit,
  onNameChange,
  onDescriptionChange,
  publicationsToDelete,
  onTogglePublication,
}: PlanEditDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Editar plan de viaje</DialogTitle>
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
        />
        {plan && plan.publications.length > 0 && (
          <>
            <Typography variant="subtitle1" sx={{ mt: 5, mb: 3 }}>
              Publicaciones a eliminar:
            </Typography>

            <Grid container spacing={2} justifyContent="center">
              {plan.publications.map((pub, index) => (
                <Box
                  key={pub.id}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 1.5,
                    mb: 1,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={publicationsToDelete.includes(index)}
                    onChange={(e) => onTogglePublication(index, e.target.checked)}
                    style={{
                      transform: 'scale(1.6)',
                      cursor: 'pointer',
                      accentColor: 'red',
                    }}
                  />
                  <PublicationCard
                    publication={pub}
                    onView={() => console.log(`Viewing publication with id: ${pub.id}`)}
                  />
                </Box>
              ))}
            </Grid>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancelar
        </Button>
        <Button onClick={onSubmit} variant="contained" disabled={!planName.trim()}>
          Guardar cambios
        </Button>
      </DialogActions>
    </Dialog>
  );
}