import type { BusinessPublicationResponseDTO } from './Business';
import type { CommonUser } from './PrivateUserProfiles';

export interface Plan {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  collaboratorsIds: string[];
  publications: BusinessPublicationResponseDTO[];
}

export interface EnrichedPlan extends Plan {
  owner?: CommonUser;
  collaborators?: CommonUser[];
}
