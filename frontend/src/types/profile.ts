import type { CommonUser } from './PrivateUserProfiles';
import type { Plan } from './Plans';

export const USER_PLANS_CONNECTION_TYPES = {
  Followers: 'followers',
  Followings: 'followings',
} as const;

export type UserPlansConnectionType =
  (typeof USER_PLANS_CONNECTION_TYPES)[keyof typeof USER_PLANS_CONNECTION_TYPES];

export interface UserPlansDialogState {
  isOpen: boolean;
  plan: Plan | null;
}

export interface UserPlansInviteDialogState extends UserPlansDialogState {
  search: string;
}

export interface UserPlansTabState {
  plans: Plan[];
  usersById: Record<string, CommonUser>;
  expandedPlans: Set<number>;
  loadingPlans: boolean;
  togglePlanExpansion: (planIndex: number) => void;
  handleUserProfile: (userId: string) => void;
  handleCreatePlan: (name: string, description: string) => Promise<boolean>;
  handleEditPlan: (
    planId: string,
    name: string,
    description: string,
    publicationsToDelete: number[]
  ) => Promise<boolean>;
  handleDeletePlan: (planId: string) => Promise<boolean>;
  handleInviteUser: (planId: string, targetUserId: string) => Promise<boolean>;
  invitedUserIds: Set<string>;
  invitingUserId: string | null;
  resetInviteState: () => void;
  followersList: {
    items: CommonUser[];
    loading: boolean;
    error: string | null;
    refresh: () => Promise<void>;
  };
  inviteCandidates: CommonUser[];
}
