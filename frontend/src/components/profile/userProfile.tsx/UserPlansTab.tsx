import React, { useState } from 'react';
import { Grid, Typography, Box, Stack, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import type { BusinessPublicationResponseDTO } from '../../../types/business';
import PublicationCard from '../../publications/PublicationCard';
import { useAuth } from '../../../hooks/useAuth';
import { createPlan, getPlans } from '../../../services/plansService';

type PlanContent = BusinessPublicationResponseDTO[];

interface Plan {
  name: string;
  description: string;
  planContent: PlanContent;
}

/* 
function getPlans(token: string): Plan[] {
  // Aquí iría la lógica para obtener los planes del usuario usando el token
  // Por ahora, devolvemos un array de ejemplo
  return [
    {
      name: "Viaje a Europa",
      description: "Plan para recorrer las principales ciudades europeas",
      planContent: [{
        id: '1', title: 'Hotel en París', description: 'Hotel céntrico en París', 
        openingDays: [], attentionSchedule: {openingTime: '', closingTime: ''}, 
        exceptionalClosingDays: [], phoneNumber: '', email: '', location: 'París, Francia', 
        imageUrls: [], ownerId: '', ownerUsername: '', ownerAvatarUrl: '', createdAt: '', tags: []
      }]
    },
    {
      name: "Fin de semana en Buenos Aires",
      description: "Escapada corta por la capital argentina",
      planContent: [{
        id: '2', title: 'Restaurante en Palermo', description: 'Restaurante de autor', 
        openingDays: [], attentionSchedule: {openingTime: '', closingTime: ''}, 
        exceptionalClosingDays: [], phoneNumber: '', email: '', location: 'Buenos Aires, Argentina', 
        imageUrls: [], ownerId: '', ownerUsername: '', ownerAvatarUrl: '', createdAt: '', tags: []
      }]
    },
    {
      name: "Aventura en Bariloche",
      description: "Turismo aventura en la Patagonia",
      planContent: []
    }
  ];
}
  */

export default function UserPlansTab() {
  const { user, accessToken } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [newPlanName, setNewPlanName] = useState('');
  const [newPlanDescription, setNewPlanDescription] = useState('');

  if (!accessToken) {
    return <Typography variant="body1">Debes iniciar sesión para ver tus planes de viaje.</Typography>;
  }

  const fetchPlans = async () => {
      try {
        const plans = await getPlans(accessToken);
        console.log('Fetched plans:', plans);
        setPlans(plans);
      } catch (error) {
        console.error('Error fetching plans:', error);
      }
    };

  React.useEffect(() => {
    fetchPlans();

    if (user?.id) {
      fetchPlans();
    } else {
      console.log('No user ID available, skipping fetch of plans.');
    }
  }, [accessToken, user?.id]);



  const handleCreatePlan = async () => {
    if (newPlanName.trim()) {
      // Aquí agregar lógica para crear el plan en la API
      console.log('Creando plan:', { name: newPlanName, description: newPlanDescription });
      
      // Por ahora, agregar un plan vacío al estado local
      const newPlan: Plan = {
        name: newPlanName.trim(),
        description: newPlanDescription.trim(),
        planContent: []
      };
      try {
        await createPlan(accessToken, newPlan.name, newPlan.description);
        await fetchPlans();
      } catch (error) {
        console.error('Error creating plan:', error);
        return;
      }
      
      // Limpiar y cerrar
      setNewPlanName('');
      setNewPlanDescription('');
      setOpenDialog(false);
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
              <Box key={index} sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
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
    </Box>
  );
}