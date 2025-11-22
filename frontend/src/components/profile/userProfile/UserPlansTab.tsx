import { useMemo, useState } from 'react';
import { Box, Grid, Typography } from '@mui/material';
import PlansGrid from './PlansGrid';
import { PlansTabHeader } from './PlansTabHeader';
import { PlanCreateDialog } from './PlanCreateDialog';
import { PlanEditDialog } from './PlanEditDialog';
import { PlanInviteDialog } from './PlanInviteDialog';
import { DeletePlanDialog } from './DeletePlanDialog';
import { PlansLoadingPlaceholder } from './PlansLoadingPlaceholder';
import { useUserPlansTab } from '../../../hooks/useUserPlansTab';
import { useAuth } from '../../../hooks/useAuth';
import type {
  UserPlansDialogState,
  UserPlansInviteDialogState,
} from '../../../types/profile';
import type { Plan } from '../../../types/Plans';

export default function UserPlansTab() {
  const { accessToken, user } = useAuth();

  const {
    plans,
    usersById,
    expandedPlans,
    loadingPlans,
    togglePlanExpansion,
    handleUserProfile,
    handleCreatePlan,
    handleEditPlan,
    handleDeletePlan,
    handleInviteUser,
    invitedUserIds,
    invitingUserId,
    resetInviteState,
    followersList,
    inviteCandidates: rawInviteCandidates,
  } = useUserPlansTab();

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newPlanName, setNewPlanName] = useState('');
  const [newPlanDescription, setNewPlanDescription] = useState('');

  const [editDialogState, setEditDialogState] = useState<UserPlansDialogState>({
    isOpen: false,
    plan: null,
  });
  const [editPlanName, setEditPlanName] = useState('');
  const [editPlanDescription, setEditPlanDescription] = useState('');
  const [publicationsToDelete, setPublicationsToDelete] = useState<number[]>([]);

  const [deleteDialogState, setDeleteDialogState] = useState<UserPlansDialogState>({
    isOpen: false,
    plan: null,
  });

  const [inviteDialogState, setInviteDialogState] =
    useState<UserPlansInviteDialogState>({
      isOpen: false,
      plan: null,
      search: '',
    });

  const handleCloseCreateDialog = () => {
    setCreateDialogOpen(false);
    setNewPlanName('');
    setNewPlanDescription('');
  };

  const handleSubmitCreatePlan = async () => {
    const ok = await handleCreatePlan(newPlanName, newPlanDescription);
    if (ok) {
      setNewPlanName('');
      setNewPlanDescription('');
      setCreateDialogOpen(false);
    }
  };

  const openEditDialog = (plan: Plan) => {
    setEditDialogState({ isOpen: true, plan });
    setEditPlanName(plan.name);
    setEditPlanDescription(plan.description || '');
    setPublicationsToDelete([]);
  };

  const closeEditDialog = () => {
    setEditDialogState({ isOpen: false, plan: null });
    setEditPlanName('');
    setEditPlanDescription('');
    setPublicationsToDelete([]);
  };

  const handleSubmitEditPlan = async () => {
    if (!editDialogState.plan) return;
    const ok = await handleEditPlan(
      editDialogState.plan.id,
      editPlanName,
      editPlanDescription,
      publicationsToDelete
    );
    if (ok) {
      closeEditDialog();
    }
  };

  const openDeleteDialog = (plan: Plan) => {
    setDeleteDialogState({ isOpen: true, plan });
  };

  const closeDeleteDialog = () => {
    setDeleteDialogState({ isOpen: false, plan: null });
  };

  const handleConfirmDeletePlan = async () => {
    if (!deleteDialogState.plan) return;
    const ok = await handleDeletePlan(deleteDialogState.plan.id);
    if (ok) {
      setDeleteDialogState({ isOpen: false, plan: null });
    }
  };

  const openInviteDialog = (plan: Plan) => {
    setInviteDialogState({ isOpen: true, plan, search: '' });
    resetInviteState();
    followersList.refresh();
  };

  const closeInviteDialog = () => {
    setInviteDialogState({ isOpen: false, plan: null, search: '' });
    resetInviteState();
  };

  const filteredInviteCandidates = useMemo(() => {
    const term = inviteDialogState.search.trim().toLowerCase();
    if (!term) return rawInviteCandidates;
    return rawInviteCandidates.filter(
      (u) =>
        u.name.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term)
    );
  }, [rawInviteCandidates, inviteDialogState.search]);

  const handleInviteFromDialog = async (targetUserId: string) => {
    if (!inviteDialogState.plan) return;
    await handleInviteUser(inviteDialogState.plan.id, targetUserId);
  };

  if (!accessToken) {
    return (
      <Typography variant="body1">
        Debes iniciar sesión para ver tus planes de viaje.
      </Typography>
    );
  }

  return (
    <Box>
      <PlansTabHeader onCreateClick={() => setCreateDialogOpen(true)} />

      <PlanCreateDialog
        open={createDialogOpen}
        planName={newPlanName}
        planDescription={newPlanDescription}
        onClose={handleCloseCreateDialog}
        onSubmit={handleSubmitCreatePlan}
        onNameChange={setNewPlanName}
        onDescriptionChange={setNewPlanDescription}
      />

      <PlanEditDialog
        open={editDialogState.isOpen}
        plan={editDialogState.plan}
        planName={editPlanName}
        planDescription={editPlanDescription}
        onClose={closeEditDialog}
        onSubmit={handleSubmitEditPlan}
        onNameChange={setEditPlanName}
        onDescriptionChange={setEditPlanDescription}
        publicationsToDelete={publicationsToDelete}
        onTogglePublication={(index, checked) => {
          if (checked) {
            setPublicationsToDelete((prev) => [...prev, index]);
          } else {
            setPublicationsToDelete((prev) =>
              prev.filter((pos) => pos !== index)
            );
          }
        }}
      />

      <PlanInviteDialog
        open={inviteDialogState.isOpen}
        plan={inviteDialogState.plan}
        search={inviteDialogState.search}
        onSearchChange={(value) =>
          setInviteDialogState((prev) => ({ ...prev, search: value }))
        }
        candidates={filteredInviteCandidates}
        followersLoading={followersList.loading}
        followersError={followersList.error}
        invitedUserIds={invitedUserIds}
        invitingUserId={invitingUserId}
        onClose={closeInviteDialog}
        onInvite={handleInviteFromDialog}
        currentUserId={user?.id ?? null}
      />

      <DeletePlanDialog
        open={deleteDialogState.isOpen}
        plan={deleteDialogState.plan}
        onClose={closeDeleteDialog}
        onConfirm={handleConfirmDeletePlan}
      />

      {loadingPlans ? (
        <PlansLoadingPlaceholder />
      ) : (
        <Grid container spacing={3} sx={{ p: { xs: 1, sm: 2 } }}>
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
      )}
    </Box>
  );
}
