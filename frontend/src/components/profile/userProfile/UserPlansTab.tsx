import React, { useState, useCallback } from 'react';
import { Grid, DialogContentText, Typography, Box, Stack, IconButton, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import type { BusinessPublicationResponseDTO } from '../../../types/business';
import PublicationCard from '../../publications/PublicationCard';
import { useAuth } from '../../../hooks/useAuth';
import { createPlan, getPlans, deletePlan } from '../../../services/plansService';
import { Delete } from '@mui/icons-material';

type PlanContent = BusinessPublicationResponseDTO[];

interface Plan {
  name: string;
  description: string;
  planContent: PlanContent;
}

export default function UserPlansTab() {
  const { user, accessToken } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [newPlanName, setNewPlanName] = useState('');
  const [newPlanDescription, setNewPlanDescription] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<Plan | null>(null);

  if (!accessToken) {
    return <Typography variant="body1">Debes iniciar sesión para ver tus planes de viaje.</Typography>;
  }

  const fetchPlans = useCallback(async () => {
    try {
      const plans = await getPlans(accessToken);
      console.log('Fetched plans:', plans);
      setPlans(plans);
    } catch (error) {
      console.error('Error fetching plans:', error);
    }
  }, [accessToken]);

  React.useEffect(() => {
    if (user?.id) {
      fetchPlans();
    } else {
      console.log('No user ID available, skipping fetch of plans.');
    }
  }, [fetchPlans, user?.id]);

  const handleDeletePlan = async () => {
    if (!planToDelete) return;
    
    try {
      const id = planToDelete.id; 
      console.log('Deleting plan with id:', id);
      await deletePlan(accessToken, id);
      
      // Actualizar la lista de planes
      await fetchPlans();
      
      setDeleteDialogOpen(false);
      setPlanToDelete(null);
    } catch (error) {
      console.error('Error deleting plan:', error);
    }
  };

  const openDeleteDialog = (plan: Plan) => {
    setPlanToDelete(plan);
    setDeleteDialogOpen(true);
  };

  const handleCreatePlan = async () => {
    if (newPlanName.trim()) {
      console.log('Creando plan:', { name: newPlanName, description: newPlanDescription });
      
      try {
        await createPlan(accessToken, newPlanName.trim(), newPlanDescription.trim());
        await fetchPlans();
        
        setNewPlanName('');
        setNewPlanDescription('');
        setOpenDialog(false);
      } catch (error) {
        console.error('Error creating plan:', error);
      }
    }
  };

  return (
    <Box>
      {/* Botón para crear nuevo plan */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-start' }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            px: 3,
            py: 1
          }}
        >
          Crear nuevo plan
        </Button>
      </Box>

      {/* Dialog para crear plan */}
      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Crear nuevo plan de viaje</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nombre del plan"
            type="text"
            fullWidth
            variant="outlined"
            value={newPlanName}
            onChange={(e) => setNewPlanName(e.target.value)}
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
            value={newPlanDescription}
            onChange={(e) => setNewPlanDescription(e.target.value)}
            placeholder="Describe brevemente tu plan de viaje..."
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleCreatePlan();
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setNewPlanName('');
              setNewPlanDescription('');
              setOpenDialog(false);
            }}
            color="inherit"
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleCreatePlan}
            variant="contained"
            disabled={!newPlanName.trim()}
          >
            Crear plan
          </Button>
        </DialogActions>
      </Dialog>

      {/* Grid de planes */}
      <Grid
        container
        spacing={3}
        sx={{
          p: { xs: 1, sm: 2 },
        }}
      >
        {plans && plans.length > 0 ? (
          <Grid item xs={12}>
            {plans.map((plan, index) => (
              <Box 
                key={index} 
                sx={{ 
                  mb: 3,
                  p: 2,
                  borderRadius: 2,
                  boxShadow: 1,
                  backgroundColor: 'background.paper',
                  position: 'relative'
                }}
              >
                <IconButton
                  onClick={() => openDeleteDialog(plan)}
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    color: 'error.main',
                    '&:hover': {
                      backgroundColor: 'error.light',
                      color: 'error.contrastText'
                    }
                  }}
                  size="small"
                >
                  <Delete />
                </IconButton>
                <Typography variant="h6" gutterBottom sx={{ pr: 5 }}>
                  {plan.name}
                </Typography>
                {plan && plan.description && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontStyle: 'italic' }}>
                    {plan.description}
                  </Typography>
                )}
                <Stack spacing={1}>
                  {plan.planContent && plan.planContent.length > 0 ? (
                    plan.planContent.map((publication) => (
                      <PublicationCard 
                        key={publication.id}
                        publication={publication} 
                        onView={() => {}} 
                      />
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ p: 2, fontStyle: 'italic' }}>
                      Plan vacío - Agrega publicaciones desde la sección de búsqueda
                    </Typography>
                  )}
                </Stack>
              </Box>
            ))}
          </Grid>
        ) : (
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              No tienes planes de viaje
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Crea tu primer plan para comenzar a organizar tu viaje
            </Typography>
          </Grid>
        )}
      </Grid>

      {/* Diálogo de confirmación para eliminar */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Eliminar plan</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que quieres eliminar el plan "{planToDelete?.name}"? 
            Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="inherit">
            Cancelar
          </Button>
          <Button 
            onClick={handleDeletePlan} 
            color="error" 
            variant="contained"
          >
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}