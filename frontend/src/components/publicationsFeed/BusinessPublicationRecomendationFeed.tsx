/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/recommendations/BusinessRecommendationFeed.tsx (Crear nuevo archivo)
import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Container, 
  CircularProgress, 
  Alert,
  Menu, // 👈 Nuevo
  MenuItem, // 👈 Nuevo
  Divider, // 👈 Nuevo
  Dialog, // 👈 Nuevo
  DialogTitle, // 👈 Nuevo
  DialogContent, // 👈 Nuevo
  DialogActions, // 👈 Nuevo
  TextField, // 👈 Nuevo
  Button, // 👈 Nuevo
  Snackbar // 👈 Nuevo
} from '@mui/material';

import BusinessPublicationCard from '../publications/PublicationCard';
import type { BusinessPublicationResponseDTO } from '../../types/Business';

import { useSnackbar } from 'notistack';
import { useAuth } from '../../hooks/useAuth'; // 👈 Importamos useAuth
// 💡 Asegúrate de que las rutas a los servicios son correctas
import { getPlans, createPlan, addPublicationToPlan } from '../../services/plansService'; 
import { getBusinessPublicationsPublicRecommendations } from '../../services/recommendations';
import PublicationDetailDialog from '../publications/PublicationDetailDialog';
import { useTheme } from '@emotion/react';
// ──────────────────────────────────────────────────────────
// TIPOS Y FUNCIONES COPIADAS DEL BusinessPublicationsTab.tsx
// ──────────────────────────────────────────────────────────

type PlanInfo = {
  name: string;
  id: string
}

// Nota: Asumiendo que 'any' en el mapeo proviene de la estructura de tu backend real.
async function fetchPlans(accessToken: string) : Promise<PlanInfo[]>
{ 
  const response = await getPlans(accessToken);
  const fetchedPlans: PlanInfo[] = Array.isArray(response)
    ? response.map((p: any) => ({
    name: typeof p === "string" ? p : p.name,
    id: typeof p === "string" ? p : p.id
    })) : [];
  return fetchedPlans;
}

// ──────────────────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ──────────────────────────────────────────────────────────

export default function BusinessRecommendationFeed() {
  const [publications, setPublications] = useState<BusinessPublicationResponseDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 🆕 Estados para la gestión de planes
  const [showLoginMsg, setShowLoginMsg] = useState(false);
  const [showSuccessMsg, setShowSuccessMsg] = useState(false);
  const [plans, setPlans] = useState<PlanInfo[]>([]);
  const [plansLoaded, setPlansLoaded] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [targetPublication, setTargetPublication] =
    useState<BusinessPublicationResponseDTO | null>(null);

  // 🆕 Estados para el diálogo de creación de plan
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [newPlanName, setNewPlanName] = useState("");

  const { enqueueSnackbar } = useSnackbar();
  const context  = useAuth();

  // 🆕 Estados para el diálogo de detalle de publicación
  const [selected, setSelected] = React.useState<BusinessPublicationResponseDTO | null>(null);

  const theme = useTheme();
  
  // ───────────────────────────────
  // Lógica de Fetch inicial
  // ───────────────────────────────
  useEffect(() => {
    const fetchRecommendations = async () => {
      if (context.user ==null || !context.accessToken) {
        setIsLoading(false);
        return;
      }
      try {
        setIsLoading(true);
        setError(null);
        const pubs = await getBusinessPublicationsPublicRecommendations(context.user.id, context.accessToken);
        setPublications(pubs);
      } catch (err) {
        console.error(err);
        setError('Error al cargar las publicaciones recomendadas.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommendations();
  }, []);


  // ───────────────────────────────
  // Lógica de "Agregar a plan" (Copiado de BusinessPublicationsTab)
  // ───────────────────────────────
  const handleAddToBoard = async (
    event: React.MouseEvent<HTMLElement>,
    publication: BusinessPublicationResponseDTO,
    _token: string // token viene del card, pero usamos el del hook
  ) => {
    event.stopPropagation();

    if (!context.accessToken) {
      setShowLoginMsg(true);
      return;
    }

    setTargetPublication(publication);
    setMenuAnchor(event.currentTarget);

    // Sólo fetchear si no se cargaron antes
    if (!plansLoaded) {
      try {
        const fetchedPlans = await fetchPlans(context.accessToken);
        setPlans(fetchedPlans);
        setPlansLoaded(true);
      } catch (error) {
        console.error("Error fetching plans:", error);
        setPlans([]);
      }
    }
  };

  const handleCloseBoardsMenu = () => {
    setMenuAnchor(null);
    setTargetPublication(null);
  };
  
  // ───────────────────────────────
  // Manejo de selección de plan (Copiado de BusinessPublicationsTab)
  // ───────────────────────────────
  const handleSelectBoard = async (boardName: string, planId: string, publicationId: string) => {
    if (boardName === "➕ Crear nuevo plan") {
      setOpenCreateDialog(true);
      return;
    }

    if (planId && publicationId && context.accessToken) {
      try {
          await addPublicationToPlan(context.accessToken, planId, publicationId);
          console.log(
            `📌 Agregando publicación "${targetPublication?.title}" al plan "${boardName}"`
          );
          setShowSuccessMsg(true);
      } catch(e) {
          console.error("Error al agregar a plan:", e);
          enqueueSnackbar('Error al agregar publicación al plan.', { variant: 'error' });
      }
    } else {
      console.error("Plan ID or Publication ID is null.");
    }
    
    handleCloseBoardsMenu();
  };
  
  // ───────────────────────────────
  // Crear nuevo plan (Copiado de BusinessPublicationsTab)
  // ───────────────────────────────
  const handleCreatePlan = async (id: string) => {
    const trimmed = newPlanName.trim();

    if (!trimmed) {
      return;
    }

    if (!context.accessToken) {
      setShowLoginMsg(true);
      return;
    }

    try {
      // 1. Crear el plan
      await createPlan(context.accessToken, trimmed, "");
      
      // 2. Refrescar la lista de planes para incluir el nuevo
      const fetchedPlans = await fetchPlans(context.accessToken);
      const plan = fetchedPlans.find((p) => p.name === trimmed);
      setPlans(fetchedPlans); // Actualiza el estado de planes para el menú

      // 3. Agregar la publicación al nuevo plan
      await addPublicationToPlan(context.accessToken, plan.id, id);
      
      setShowSuccessMsg(true);
    } catch (error) {
      console.error("Error creating plan:", error);
      enqueueSnackbar('Error al crear y guardar el plan.', { variant: 'error' });
    } finally {
      setOpenCreateDialog(false);
      setNewPlanName("");
      handleCloseBoardsMenu();
    }
  };


  if (isLoading) {
    return (
      <Container sx={{ textAlign: 'center', py: 8 }}>
        <CircularProgress color="primary" />
        <Typography variant="body1" mt={2}>Cargando recomendaciones...</Typography>
      </Container>
    );
  }

  if (error) {
    return <Container sx={{ py: 8 }}><Alert severity="error">{error}</Alert></Container>;
  }

  if (publications.length === 0) {
    return (
      <Container sx={{ py: 8 }}>
        <Typography variant="overline" color="primary">Para ti</Typography>
        <Typography variant="h4" fontWeight={800} gutterBottom>Publicaciones Recomendadas</Typography>
        <Typography variant="body1" color="text.secondary" mb={5}>
          Descubre los mejores negocios y experiencias que otros viajeros han disfrutado.
        </Typography>
        <Alert severity="info">Aún no hay publicaciones recomendadas para ti. Para una experiencia completa interactúa con más usuarios y publicaciones!</Alert>
      </Container>
    );
  }
  
  const glowColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(80, 84, 88, 0.6)'
  return (
    // 💡 El contenedor principal
    <>
    <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: 'background.paper' }}>
      <Container>
        <Typography variant="overline" color="primary">Para ti</Typography>
        <Typography variant="h4" fontWeight={800} gutterBottom>Publicaciones Recomendadas</Typography>
        <Typography variant="body1" color="text.secondary" mb={5}>
          Descubre los mejores negocios y experiencias que otros viajeros han disfrutado.
        </Typography>

        {publications.map((p, index) => (
            <Box key={p.id} sx={{ 
                mb: index < publications.length - 1 ? 6 : 0, 
                maxWidth: 800, 
                mx: 'auto',
            }}>
                <BusinessPublicationCard
                    publication={p}
                    onView={setSelected}
                    onAddToBoard={handleAddToBoard} // 👈 Usamos la función handleAddToBoard copiada
                    sx={{
                        "& img": { height: '450px !important' }, 
                        borderRadius: 3, 
                        boxShadow: '0 0 35px 8px ' + glowColor,
                    }}
                />
            </Box>
        ))}
      </Container>
    </Box>
    
    {/* ────────────────────────────────────────────────────────── */}
    {/* 🆕 UI DE SOPORTE PARA PLANES (Copiada de BusinessPublicationsTab) */}
    {/* ────────────────────────────────────────────────────────── */}
    
    {/* Snackbar: login requerido */}
    <Snackbar
        open={showLoginMsg}
        autoHideDuration={4000}
        onClose={() => setShowLoginMsg(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="info" onClose={() => setShowLoginMsg(false)}>
          Debes iniciar sesión para agregar una publicación a un plan.
        </Alert>
      </Snackbar>

      {/* Snackbar: éxito */}
      <Snackbar
        open={showSuccessMsg}
        autoHideDuration={4000}
        onClose={() => setShowSuccessMsg(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="success" onClose={() => setShowSuccessMsg(false)}>
          Publicación agregada correctamente al plan.
        </Alert>
      </Snackbar>

      {/* Menú contextual con planes */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleCloseBoardsMenu}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <MenuItem onClick={() => handleSelectBoard("➕ Crear nuevo plan", undefined!, targetPublication?.id!)}>
          ➕ Crear nuevo plan
        </MenuItem>
        <Divider />
        {plans.map((plan: PlanInfo) => (
          <MenuItem key={plan.id} onClick={() => handleSelectBoard(plan.name, plan.id, targetPublication?.id!)}>
            {plan.name}
          </MenuItem>
        ))}
      </Menu>

      {/* Diálogo para crear nuevo plan */}
      <Dialog open={openCreateDialog}>
        <DialogTitle>Crear nuevo plan</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nombre del plan"
            fullWidth
            variant="outlined"
            value={newPlanName}
            onChange={(e) => setNewPlanName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                if (newPlanName.trim() && targetPublication?.id) {
                  handleCreatePlan(targetPublication.id);
                }
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreateDialog(false)}>Cancelar</Button>
          <Button 
            onClick={() => {
              if (targetPublication?.id) {
                handleCreatePlan(targetPublication.id);
              }
            }} 
            variant="contained"
            disabled={!newPlanName.trim()}
          >
            Crear
          </Button>
        </DialogActions>
      </Dialog>
      <PublicationDetailDialog
        open={!!selected}
        onClose={() => setSelected(null)}
        publication={selected}
        letReview={true}
      />
      </>
  );
}