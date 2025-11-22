import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './useAuth';
import { useConnectionsList } from './useConnectionsList';
import {
  USER_PLANS_CONNECTION_TYPES,
  type UserPlansTabState,
} from '../types/profile';
import type { CommonUser } from '../types/PrivateUserProfiles';
import type { Plan } from '../types/Plans';
import {
  createPlan,
  deletePlan,
  getPlans,
  inviteUserToPlan,
  updatePlan,
} from '../services/plansService';
import { getUserById } from '../services/userService';

export function useUserPlansTab(): UserPlansTabState {
  const { user, accessToken } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const followersList = useConnectionsList(USER_PLANS_CONNECTION_TYPES.Followers);
  const followingsList = useConnectionsList(USER_PLANS_CONNECTION_TYPES.Followings);

  const [plans, setPlans] = useState<Plan[]>([]);
  const [usersById, setUsersById] = useState<Record<string, CommonUser>>({});
  const [expandedPlans, setExpandedPlans] = useState<Set<number>>(new Set());
  const [loadingPlans, setLoadingPlans] = useState(false);

  const [invitedUserIds, setInvitedUserIds] = useState<Set<string>>(new Set());
  const [invitingUserId, setInvitingUserId] = useState<string | null>(null);

  const errorMessage = useCallback((err: unknown, fallback: string) => {
    if (err instanceof Error) return err.message;
    if (typeof err === 'string') return err;
    return fallback;
  }, []);

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
    if (!accessToken) return;

    setLoadingPlans(true);
    try {
      const plansResponse = await getPlans(accessToken);
      const normalizedPlans = plansResponse.map((plan) => ({
        ...plan,
        collaboratorsIds: plan.collaboratorsIds ?? [],
        publications: plan.publications ?? [],
        description: plan.description ?? '',
      }));
      setPlans(normalizedPlans);

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

      setUsersById({ ...knownUsersById, ...directory });
    } catch (error) {
      console.error('Error fetching plans:', error);
      enqueueSnackbar(errorMessage(error, 'No pudimos cargar tus planes.'), {
        variant: 'error',
      });
    } finally {
      setLoadingPlans(false);
    }
  }, [accessToken, enqueueSnackbar, errorMessage, knownUsersById, user?.id]);

  useEffect(() => {
    if (user?.id) {
      fetchPlans();
    } else {
      console.log('No user ID available, skipping fetch of plans.');
    }
  }, [fetchPlans, user?.id]);

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

  const inviteCandidates = useMemo(() => {
    const followers = followersList.items;
    const followings = followingsList.items;
    const followingSet = new Set(followings.map((u) => u.id));

    return followers.filter((f) => followingSet.has(f.id));
  }, [followersList.items, followingsList.items]);

  const handleCreatePlan = async (
    name: string,
    description: string
  ): Promise<boolean> => {
    if (!name.trim() || !accessToken) return false;

    try {
      await createPlan(accessToken, name.trim(), description.trim());
      await fetchPlans();
      return true;
    } catch (error) {
      console.error('Error creating plan:', error);
      enqueueSnackbar(errorMessage(error, 'No pudimos crear el plan.'), {
        variant: 'error',
      });
      return false;
    }
  };

  const handleEditPlan = async (
    planId: string,
    name: string,
    description: string,
    publicationsToDelete: number[]
  ): Promise<boolean> => {
    if (!planId || !name.trim() || !accessToken) return false;

    try {
      await updatePlan(
        accessToken,
        planId,
        name.trim(),
        description.trim(),
        publicationsToDelete
      );
      await fetchPlans();
      return true;
    } catch (error) {
      console.error('Error updating plan:', error);
      enqueueSnackbar(errorMessage(error, 'No pudimos actualizar el plan.'), {
        variant: 'error',
      });
      return false;
    }
  };

  const handleDeletePlan = async (planId: string): Promise<boolean> => {
    if (!planId || !accessToken) return false;

    try {
      await deletePlan(accessToken, planId);
      await fetchPlans();
      return true;
    } catch (error) {
      console.error('Error deleting plan:', error);
      enqueueSnackbar(errorMessage(error, 'No pudimos eliminar el plan.'), {
        variant: 'error',
      });
      return false;
    }
  };

  const handleInviteUser = async (
    planId: string,
    targetUserId: string
  ): Promise<boolean> => {
    if (!planId || !accessToken) return false;

    try {
      setInvitingUserId(targetUserId);
      await inviteUserToPlan(accessToken, planId, targetUserId);
      enqueueSnackbar('Invitación enviada', { variant: 'success' });
      setInvitedUserIds((prev) => new Set(prev).add(targetUserId));
      await fetchPlans();
      return true;
    } catch (error) {
      const message = errorMessage(error, 'No pudimos enviar la invitación.');
      enqueueSnackbar(message, { variant: 'error' });

      if (
        message.toLowerCase().includes('ya') &&
        message.toLowerCase().includes('invit')
      ) {
        setInvitedUserIds((prev) => new Set(prev).add(targetUserId));
      }
      return false;
    } finally {
      setInvitingUserId(null);
    }
  };

  const resetInviteState = () => {
    setInvitedUserIds(new Set());
    setInvitingUserId(null);
  };

  return {
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
    inviteCandidates,
  };
}
