import type { CommonUsersInformation } from '../../types/user';

const DEFAULT_AVATAR_URL = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTS6qyXg2AdweutivMZTTbquH6Ed11xM4T63Q&s';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapUser(data: any): CommonUsersInformation {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid user data');
  }

  return {
    id: data.id,
    username: data.username,
    email: data.email,
    role: data.role,
    description: data.description || '',
    avatarURL: data.avatarURL || DEFAULT_AVATAR_URL,
  };
}

