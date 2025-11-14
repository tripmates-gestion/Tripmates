import React, { useState, useCallback } from 'react';
import { Grid, DialogContentText, Typography, Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useAuth } from '../../../hooks/useAuth';
import { createPlan, getPlans, deletePlan, updatePlan } from '../../../services/plansService';
import PlansGrid from './PlansGrid';
import type { BusinessPublicationResponseDTO } from '../../../types/Business';
import PublicationCard from '../../publications/PublicationCard';

interface Plan {
  id?: string;
  name: string;
  description: string;
  publications: BusinessPublicationResponseDTO[];
}

export default function UserPlansTab() {
  const { user, accessToken } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [newPlanName, setNewPlanName] = useState('');
  const [newPlanDescription, setNewPlanDescription] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<Plan | null>(null);
  const [expandedPlans, setExpandedPlans] = useState<Set<number>>(new Set());
  
  // Estados para edición
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [planToEdit, setPlanToEdit] = useState<Plan | null>(null);
  const [editPlanName, setEditPlanName] = useState('');
  const [editPlanDescription, setEditPlanDescription] = useState('');
  const [publicationsToDelete, setPublicationsToDelete] = useState<number[]>([]);


  if (!accessToken) {
    return <Typography variant="body1">Debes iniciar sesión para ver tus planes de viaje.</Typography>;
  }

  const openEditDialog = (plan: Plan) => {
    setPlanToEdit(plan);
    setEditPlanName(plan.name);
    setEditPlanDescription(plan.description || '');
    setPublicationsToDelete([]);
    setEditDialogOpen(true);
  };

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

  const togglePlanExpansion = (planIndex: number) => {
    setExpandedPlans(prev => {
      const newSet = new Set(prev);
      if (newSet.has(planIndex)) {
        newSet.delete(planIndex);
      } else {
        newSet.add(planIndex);
      }
      return newSet;
    });
  };

  const handleDeletePlan = async () => {
    if (!planToDelete || !planToDelete.id) return;
    
    try {
      console.log('Deleting plan with id:', planToDelete.id);
      await deletePlan(accessToken, planToDelete.id);
      
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

  const handleEditPlan = async () => {
    if (!planToEdit || !planToEdit.id || !editPlanName.trim()) return;

    try {
      console.log('Updating plan with id:', planToEdit.id); 
      console.log('New name:', editPlanName.trim());
      console.log('New description:', editPlanDescription.trim());
      console.log('Publications to delete:', publicationsToDelete);

      await updatePlan(accessToken, planToEdit.id, editPlanName.trim(), editPlanDescription.trim(), publicationsToDelete);
      await fetchPlans();

      // Reset
      setEditDialogOpen(false);
      setPlanToEdit(null);
      setEditPlanName('');
      setEditPlanDescription('');
      setPublicationsToDelete([]);
    } catch (error) {
      console.error('Error updating plan:', error);
    }
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

      {/* Dialog para editar plan */}
      <Dialog 
        open={editDialogOpen} 
        onClose={() => setEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Editar plan de viaje</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nombre del plan"
            type="text"
            fullWidth
            variant="outlined"
            value={editPlanName}
            onChange={(e) => setEditPlanName(e.target.value)}
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
            value={editPlanDescription}
            onChange={(e) => setEditPlanDescription(e.target.value)}
            placeholder="Describe brevemente tu plan de viaje..."
          />
          {planToEdit && planToEdit.publications.length > 0 && (
            <>
              <Typography variant="subtitle1" sx={{ mt: 5, mb: 3 }}>
                Publicaciones a eliminar:
              </Typography>

              <Grid container spacing={2} justifyContent="center">
                {planToEdit.publications.map((pub, index) => (
                    <Box
                      key={pub.id} // Agregar key para evitar warnings
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
                        checked={publicationsToDelete.includes(index)} // Cambiar de pub.id a index
                        onChange={(e) => {
                          if (e.target.checked) {
                            setPublicationsToDelete((prev) => [...prev, index]);
                          } else {
                            setPublicationsToDelete((prev) => prev.filter((pos) => pos !== index)); 
                          }
                        }}
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
          <Button 
            onClick={() => {
              setEditDialogOpen(false);
              setPlanToEdit(null);
              setEditPlanName('');
              setEditPlanDescription('');
            }}
            color="inherit"
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleEditPlan}
            variant="contained"
            disabled={!editPlanName.trim()}
          >
            Guardar cambios
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
          <PlansGrid
            plans={plans}
            expandedPlans={expandedPlans}
            togglePlanExpansion={togglePlanExpansion}
            openDeleteDialog={openDeleteDialog}
            onEditPlan={openEditDialog}
            />
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