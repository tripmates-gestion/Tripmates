// frontend/src/components/publicationsFeed/BusinessPublicationsRecomendationFeed.tsx

import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Container,
  CircularProgress,
  Alert,
  Menu,
  MenuItem,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Snackbar,
  useTheme,
  IconButton
} from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';

import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";

import BusinessPublicationCard from '../publications/PublicationCard';
import PublicationDetailDialog from '../publications/PublicationDetailDialog';

import { useAuth } from '../../hooks/useAuth';
import { useSnackbar } from 'notistack';

import { getPlans, createPlan, addPublicationToPlan } from '../../services/plansService';
import { getBusinessPublicationsPublicRecommendations } from '../../services/recommendations';

// -------------------------------------------------------------------
// TIPOS
// -------------------------------------------------------------------
type PlanInfo = {
  name: string;
  id: string;
};

async function fetchPlans(accessToken: string): Promise<PlanInfo[]> {
  const response = await getPlans(accessToken);
  const fetchedPlans: PlanInfo[] = Array.isArray(response)
    ? response.map((p: any) => ({ name: p.name ?? p, id: p.id ?? p }))
    : [];
  return fetchedPlans;
}

// -------------------------------------------------------------------
// COMPONENTE PRINCIPAL
// -------------------------------------------------------------------
export default function BusinessPublicationsRecomendationFeed() {
  const [publications, setPublications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [showLoginMsg, setShowLoginMsg] = useState(false);
  const [showSuccessMsg, setShowSuccessMsg] = useState(false);
  const [plans, setPlans] = useState<PlanInfo[]>([]);
  const [plansLoaded, setPlansLoaded] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [targetPublication, setTargetPublication] = useState<any | null>(null);

  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [newPlanName, setNewPlanName] = useState('');

  const [selected, setSelected] = useState<any | null>(null);

  const { enqueueSnackbar } = useSnackbar();
  const context = useAuth();
  const theme = useTheme();

  // -------------------------------------------------------------------
  // Fetch inicial
  // -------------------------------------------------------------------
  useEffect(() => {
    let mounted = true;

    const fetchRecommendations = async () => {
      if (!context?.user || !context?.accessToken) {
        if (mounted) {
          setIsLoading(false);
          setPublications([]);
        }
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const pubs = await getBusinessPublicationsPublicRecommendations(context.user.id, context.accessToken);
        if (mounted) {
          setPublications(Array.isArray(pubs) ? pubs : []);
        }
      } catch (err) {
        console.error(err);
        if (mounted) setError('Error al cargar las publicaciones recomendadas.');
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    fetchRecommendations();
    return () => { mounted = false; };
  }, [context?.user?.id, context?.accessToken]);

  // -------------------------------------------------------------------
  // Keen Slider (Continuous Loop)
  // -------------------------------------------------------------------
  const animationRef = useRef<number | null>(null);
  const isHoveringRef = useRef(false);
  const isInteractingRef = useRef(false);
  const [isReady, setIsReady] = useState(false);
  const [visibleSlides, setVisibleSlides] = useState(3); // Default to 3
  const [shouldAutoScroll, setShouldAutoScroll] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  const [sliderRef, slider] = useKeenSlider<HTMLDivElement>({
    loop: true,
    renderMode: "performance",
    drag: true,
    created: (_s) => {
      setIsReady(true);
      // Determine initial visible slides based on window width
      const width = window.innerWidth;
      if (width >= 960) {
        setVisibleSlides(3);
      } else if (width >= 600) {
        setVisibleSlides(2);
      } else {
        setVisibleSlides(1);
      }
    },
    destroyed: () => setIsReady(false),
    slideChanged: (_s) => {
      // Update visible slides count when breakpoint changes
      const width = window.innerWidth;
      if (width >= 960) {
        setVisibleSlides(3);
      } else if (width >= 600) {
        setVisibleSlides(2);
      } else {
        setVisibleSlides(1);
      }
    },
    slides: {
      perView: 1,
      spacing: 15,
    },
    breakpoints: {
      "(min-width: 600px)": {
        slides: { perView: 2, spacing: 15 },
      },
      "(min-width: 960px)": {
        slides: { perView: 3, spacing: 15 },
      },
    },
  });

  // Determine if auto-scroll should be enabled
  useEffect(() => {
    setShouldAutoScroll(publications.length > visibleSlides);
  }, [publications.length, visibleSlides]);

  // Animation loop
  const animation = (_timestamp: number) => {
    if (!slider.current) return;

    if (!isHoveringRef.current && !isInteractingRef.current && shouldAutoScroll) {
      const distance = 0.002;
      slider.current.track.add(distance);
    }

    animationRef.current = requestAnimationFrame(animation);
  };

  useEffect(() => {
    if (!isReady || !slider.current || !shouldAutoScroll) return;
    animationRef.current = requestAnimationFrame(animation);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [slider, isReady, shouldAutoScroll]);

  // Sync interaction state
  useEffect(() => {
    isInteractingRef.current = !!selected || !!menuAnchor || !!openCreateDialog;
  }, [selected, menuAnchor, openCreateDialog]);

  // -------------------------------------------------------------------
  // Lógica de Boards
  // -------------------------------------------------------------------
  const handleAddToBoard = async (
    event: React.MouseEvent<HTMLElement>,
    publication: any
  ) => {
    event.stopPropagation();

    if (!context?.accessToken) {
      setShowLoginMsg(true);
      return;
    }

    setTargetPublication(publication);
    setMenuAnchor(event.currentTarget);

    if (!plansLoaded && context?.accessToken) {
      try {
        const fetchedPlans = await fetchPlans(context.accessToken);
        setPlans(fetchedPlans);
        setPlansLoaded(true);
      } catch (e) {
        console.error('Error fetching plans:', e);
        setPlans([]);
      }
    }
  };

  const handleCloseBoardsMenu = () => {
    setMenuAnchor(null);
    setTargetPublication(null);
  };

  const handleSelectBoard = async (
    boardName: string,
    planId: string | undefined,
    publicationId: string | undefined
  ) => {
    if (boardName === '➕ Crear nuevo plan') {
      setOpenCreateDialog(true);
      return;
    }

    if (planId && publicationId && context?.accessToken) {
      try {
        await addPublicationToPlan(context.accessToken, planId, publicationId);
        setShowSuccessMsg(true);
      } catch (e) {
        console.error('Error al agregar a plan:', e);
        enqueueSnackbar('Error al agregar publicación al plan.', { variant: 'error' });
      }
    }

    handleCloseBoardsMenu();
  };

  const handleCreatePlan = async (publicationId: string | undefined) => {
    const trimmed = newPlanName.trim();
    if (!trimmed) return;

    if (!context?.accessToken) {
      setShowLoginMsg(true);
      return;
    }

    try {
      await createPlan(context.accessToken, trimmed, '');

      const fetchedPlans = await fetchPlans(context.accessToken);
      setPlans(fetchedPlans);

      const created = fetchedPlans.find((p) => p.name === trimmed);

      if (created && publicationId) {
        await addPublicationToPlan(context.accessToken, created.id, publicationId);
        setShowSuccessMsg(true);
      }
    } catch (e) {
      console.error('Error creating plan:', e);
      enqueueSnackbar('Error al crear y guardar el plan.', { variant: 'error' });
    } finally {
      setOpenCreateDialog(false);
      setNewPlanName('');
      handleCloseBoardsMenu();
    }
  };

  // -------------------------------------------------------------------
  // RENDER
  // -------------------------------------------------------------------
  if (isLoading) {
    return (
      <Container sx={{ textAlign: 'center', py: 8 }}>
        <CircularProgress color="primary" />
        <Typography mt={2}>Cargando recomendaciones...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ py: 8 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!publications || publications.length === 0) {
    return (
      <Container sx={{ py: 8 }}>
        <Typography variant="overline" color="primary">Para ti</Typography>
        <Typography variant="h4" fontWeight={800} gutterBottom>Publicaciones Recomendadas</Typography>
        <Typography color="text.secondary" mb={3}>
          Descubre los mejores negocios y experiencias que otros viajeros han disfrutado.
        </Typography>
        <Alert severity="info">
          Aún no hay publicaciones recomendadas. Interactúa con más usuarios y publicaciones.
        </Alert>
      </Container>
    );
  }

  return (
    <>
      <Box sx={{ py: { xs: 4, md: 5 }, bgcolor: 'background.paper' }}>
        <Container>
          <Typography variant="h4" fontWeight={800} gutterBottom>Experiencias para ti</Typography>
          {/* Carrusel Keen */}
          <Box
            sx={{ position: 'relative' }}
            onMouseEnter={() => {
              isHoveringRef.current = true;
              setIsHovering(true);
            }}
            onMouseLeave={() => {
              isHoveringRef.current = false;
              setIsHovering(false);
            }}
          >
            <Box
              ref={sliderRef}
              className="keen-slider"
              sx={{
                mt: 3,
                borderRadius: 1,
                py: 0
              }}
            >
              {publications.map((p: any) => (
                <Box
                  key={p.id}
                  className="keen-slider__slide"
                  sx={{ px: { xs: 1, md: 1 }, display: 'flex' }}
                >
                  <BusinessPublicationCard
                    publication={p}
                    onView={(pub: any) => setSelected(pub)}
                    onAddToBoard={(e: React.MouseEvent<HTMLElement>) => handleAddToBoard(e, p)}
                    sx={{ width: '100%' }}
                  />
                </Box>
              ))}
            </Box>

            {/* Navigation Arrows - Only show when hovering and there are more publications than visible */}
            {shouldAutoScroll && isHovering && (
              <>
                <IconButton
                  onClick={() => slider.current?.prev()}
                  sx={{
                    position: 'absolute',
                    left: -20,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                    backdropFilter: 'blur(10px)',
                    '&:hover': {
                      bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
                    },
                    zIndex: 10,
                    boxShadow: 2,
                  }}
                >
                  <ChevronLeft />
                </IconButton>
                <IconButton
                  onClick={() => slider.current?.next()}
                  sx={{
                    position: 'absolute',
                    right: -20,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                    backdropFilter: 'blur(10px)',
                    '&:hover': {
                      bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
                    },
                    zIndex: 10,
                    boxShadow: 2,
                  }}
                >
                  <ChevronRight />
                </IconButton>
              </>
            )}
          </Box>
        </Container>
      </Box>

      {/* Snackbars */}
      <Snackbar
        open={showLoginMsg}
        autoHideDuration={4000}
        onClose={() => setShowLoginMsg(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="info" onClose={() => setShowLoginMsg(false)}>
          Debes iniciar sesión para agregar una publicación a un plan.
        </Alert>
      </Snackbar>

      <Snackbar
        open={showSuccessMsg}
        autoHideDuration={4000}
        onClose={() => setShowSuccessMsg(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={() => setShowSuccessMsg(false)}>
          Publicación agregada correctamente al plan.
        </Alert>
      </Snackbar>

      {/* Menú contextual */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleCloseBoardsMenu}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem onClick={() => handleSelectBoard('➕ Crear nuevo plan', undefined!, targetPublication?.id)}>
          ➕ Crear nuevo plan
        </MenuItem>

        <Divider />

        {plans.map((plan: PlanInfo) => (
          <MenuItem
            key={plan.id}
            onClick={() => handleSelectBoard(plan.name, plan.id, targetPublication?.id)}
          >
            {plan.name}
          </MenuItem>
        ))}
      </Menu>

      {/* Diálogo crear plan */}
      <Dialog open={openCreateDialog} onClose={() => setOpenCreateDialog(false)}>
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
              if (e.key === 'Enter' && newPlanName.trim() && targetPublication?.id) {
                e.preventDefault();
                handleCreatePlan(targetPublication.id);
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreateDialog(false)}>Cancelar</Button>
          <Button
            onClick={() => targetPublication?.id && handleCreatePlan(targetPublication.id)}
            variant="contained"
            disabled={!newPlanName.trim()}
          >
            Crear
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog detalle */}
      <PublicationDetailDialog
        open={!!selected}
        onClose={() => setSelected(null)}
        publication={selected}
        letReview={true}
      />
    </>
  );
}
