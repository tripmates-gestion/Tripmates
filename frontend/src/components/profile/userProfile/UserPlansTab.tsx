import { useState, useCallback, useMemo, useEffect } from 'react';
import { Avatar, Box, Button, Chip, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Grid, InputAdornment, Paper, Stack, TextField, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { createPlan, getPlans, deletePlan, updatePlan, inviteUserToPlan } from '../../../services/plansService';
import { getUserById } from '../../../services/userService';
import PlansGrid from './PlansGrid';
import type { CommonUser } from '../../../types/PrivateUserProfiles';
import type { Plan } from '../../../types/Plans';
import PublicationCard from '../../publications/PublicationCard';
import { useConnectionsList } from '../../../hooks/useConnectionsList';

export default function UserPlansTab() {
  const { user, accessToken } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const followersList = useConnectionsList('followers');
  const followingsList = useConnectionsList('followings');

  const [plans, setPlans] = useState<Plan[]>([]);
  const [usersById, setUsersById] = useState<Record<string, CommonUser>>({});

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

  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [planToInvite, setPlanToInvite] = useState<Plan | null>(null);
  const [inviteSearch, setInviteSearch] = useState('');
  const [invitedUserIds, setInvitedUserIds] = useState<Set<string>>(new Set());


  // Estado de carga
  const [invitingUserId, setInvitingUserId] = useState<string | null>(null);


  const errorMessage = useCallback((err: unknown, fallback: string) => {
    if (err instanceof Error) return err.message;
    if (typeof err === 'string') return err;
    return fallback;
  }, []);

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

  // Hack anterior: followers + followings + yo
  // Lo seguimos usando para fallback / navegación
  const knownUsersById = useMemo<Record<string, CommonUser>>(() => {
    const directory: Record<string, CommonUser> = {};
    const addUser = (item?: CommonUser | null) => {
      if (item) {
        directory[item.id] = item;
      }
    };

    followersList.items.forEach(addUser);
    followingsList.items.forEach(addUser);

    if (user) {
      addUser({
        id: user.id,
        name: user.name ?? 'Usuario',
        email: user.email,
        avatarURL: (user as CommonUser).avatarURL,
        role: user.role,
        description: user.description,
      });
    }

    return directory;
  }, [followersList.items, followingsList.items, user]);

  const fetchPlans = useCallback(async () => {
    try {
      const plansResponse = await getPlans(accessToken);
      const normalizedPlans = plansResponse.map((plan) => ({
        ...plan,
        collaboratorsIds: plan.collaboratorsIds ?? [],
        publications: plan.publications ?? [],
        description: plan.description ?? '',
      }));
      setPlans(normalizedPlans);

      // traer todos los usuarios (owner + colaboradores) por ID
      const idsSet = new Set<string>();

      normalizedPlans.forEach((plan) => {
        if (plan.ownerId) idsSet.add(plan.ownerId);
        (plan.collaboratorsIds ?? []).forEach((id) => idsSet.add(id));
      });

      if (user?.id) {
        idsSet.add(user.id);
      }

      const ids = Array.from(idsSet);

      const fetched = await Promise.all(
        ids.map(async (id) => {
          try {
            const profile = await getUserById(id, accessToken);
            return [id, profile as CommonUser] as const;
          } catch (err) {
            console.warn('No pudimos cargar el usuario', id, err);
            return null;
          }
        })
      );

      const directory: Record<string, CommonUser> = {};
      fetched.forEach((item) => {
        if (item) {
          directory[item[0]] = item[1];
        }
      });

      // mergeamos con knownUsersById para aprovechar followers/followings también
      setUsersById({ ...knownUsersById, ...directory });
    } catch (error) {
      console.error('Error fetching plans:', error);
      enqueueSnackbar(errorMessage(error, 'No pudimos cargar tus planes.'), { variant: 'error' });
    }
  }, [accessToken, enqueueSnackbar, errorMessage, knownUsersById, user?.id]);

  useEffect(() => {
    if (user?.id) {
      fetchPlans();
    } else {
      console.log('No user ID available, skipping fetch of plans.');
    }
  }, [fetchPlans, user?.id]);

  const filteredFollowers = useMemo(() => {
    const term = inviteSearch.trim().toLowerCase();
    if (!term) return followersList.items;
    return followersList.items.filter((follower) =>
      follower.name.toLowerCase().includes(term) || follower.email.toLowerCase().includes(term)
    );
  }, [followersList.items, inviteSearch]);

  const togglePlanExpansion = (planIndex: number) => {
    setExpandedPlans((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(planIndex)) {
        newSet.delete(planIndex);
      } else {
        newSet.add(planIndex);
      }
      return newSet;
    });
  };

  const handleUserProfile = useCallback(
    (userId: string) => {
      const account = usersById[userId] ?? knownUsersById[userId];

      if (account) {
        navigate(`/userProfile/${userId}`, {
          state: { account },
        });
      } else {
        navigate(`/userProfile/${userId}`);
      }
    },
    [navigate, usersById, knownUsersById]
  );

  const closeInviteDialog = () => {
    setInviteDialogOpen(false);
    setPlanToInvite(null);
    setInviteSearch('');
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
      enqueueSnackbar(errorMessage(error, 'No pudimos eliminar el plan.'), { variant: 'error' });
    }
  };


  const handleInviteUser = async (targetUserId: string) => {
    if (!planToInvite?.id) return;

    try {
      setInvitingUserId(targetUserId); 
      await inviteUserToPlan(accessToken, planToInvite.id, targetUserId);
      enqueueSnackbar('Invitación enviada', { variant: 'success' });
      setInvitedUserIds((prev) => new Set(prev).add(targetUserId));
      await fetchPlans();
    } catch (error) {
      const message = errorMessage(error, 'No pudimos enviar la invitación.');
      enqueueSnackbar(message, { variant: 'error' });

      if (message.toLowerCase().includes('ya') && message.toLowerCase().includes('invit')) {
        setInvitedUserIds((prev) => new Set(prev).add(targetUserId));
      }
    } finally {
      setInvitingUserId(null);         
    }
  };

  const openDeleteDialog = (plan: Plan) => {
    setPlanToDelete(plan);
    setDeleteDialogOpen(true);
  };

  const openInviteDialog = (plan: Plan) => {
    setPlanToInvite(plan);
    setInviteSearch('');
    setInvitedUserIds(new Set());
    followersList.refresh(); 
    setInviteDialogOpen(true);
  };

  const handleEditPlan = async () => {
    if (!planToEdit || !planToEdit.id || !editPlanName.trim()) return;

    try {
      console.log('Updating plan with id:', planToEdit.id);
      console.log('New name:', editPlanName.trim());
      console.log('New description:', editPlanDescription.trim());
      console.log('Publications to delete:', publicationsToDelete);

      await updatePlan(
        accessToken,
        planToEdit.id,
        editPlanName.trim(),
        editPlanDescription.trim(),
        publicationsToDelete
      );
      await fetchPlans();

      setEditDialogOpen(false);
      setPlanToEdit(null);
      setEditPlanName('');
      setEditPlanDescription('');
      setPublicationsToDelete([]);
    } catch (error) {
      console.error('Error updating plan:', error);
      enqueueSnackbar(errorMessage(error, 'No pudimos actualizar el plan.'), { variant: 'error' });
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
        enqueueSnackbar(errorMessage(error, 'No pudimos crear el plan.'), { variant: 'error' });
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
            py: 1,
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

      <Dialog
        open={inviteDialogOpen}
        onClose={closeInviteDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PersonAddAlt1Icon fontSize="small" /> Invitar a "{planToInvite?.name ?? 'tu plan'}"
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Busca entre tus seguidores para sumar co-creadores a tu plan.
          </Typography>

          <TextField
            fullWidth
            placeholder="Buscar por nombre o email"
            value={inviteSearch}
            onChange={(e) => setInviteSearch(e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment position="start">🔎</InputAdornment>,
            }}
          />

          {followersList.loading ? (
            <Stack alignItems="center" sx={{ py: 3 }}>
              <CircularProgress size={28} />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Cargando seguidores...
              </Typography>
            </Stack>
          ) : (
            <Stack spacing={1.5} sx={{ mt: 2 }}>
              {filteredFollowers.map((follower) => {
                const isOwner = planToInvite?.ownerId === follower.id;
                const alreadyCollaborator = planToInvite?.collaboratorsIds?.includes(follower.id);
                const alreadyInvited = invitedUserIds.has(follower.id);
                return (
                  <Paper
                    key={follower.id}
                    elevation={0}
                    sx={{
                      border: (theme) => `1px solid ${theme.palette.divider}`,
                      borderRadius: 2,
                      p: 1.5,
                    }}
                  >
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Avatar src={follower.avatarURL} alt={follower.name} />
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography fontWeight={600}>{follower.name}</Typography>
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {follower.email}
                        </Typography>
                      </Box>

                      {isOwner && (
                        <Chip label="Creador" color="primary" size="small" variant="outlined" />
                      )}

                      {alreadyCollaborator && !isOwner && (
                        <Chip label="Ya participa" color="success" size="small" variant="outlined" />
                      )}

                      {alreadyInvited && !alreadyCollaborator && (
                        <Chip label="Invitación enviada" color="info" size="small" variant="outlined" />
                      )}

                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<PersonAddAlt1Icon />}
                        disabled={
                          isOwner ||
                          alreadyCollaborator ||
                          alreadyInvited ||
                          invitingUserId === follower.id   
                        }
                        onClick={() => handleInviteUser(follower.id)}
                      >
                        {alreadyInvited ? 'Invitado' : 'Invitar'}
                      </Button>
                    </Stack>
                  </Paper>
                );
              })}

              {!followersList.loading && filteredFollowers.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    No encontramos seguidores que coincidan con tu búsqueda.
                  </Typography>
                </Box>
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeInviteDialog} color="inherit">
            Cerrar
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
            onInvite={openInviteDialog}
            usersById={usersById}    
            onUserClick={handleUserProfile}
            currentUserId={user?.id ?? null}
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