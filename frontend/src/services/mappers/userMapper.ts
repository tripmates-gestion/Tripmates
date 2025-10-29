import type { CommonUsersInformation } from '../../types/user';

const DEFAULT_AVATAR_URL = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTS6qyXg2AdweutivMZTTbquH6Ed11xM4T63Q&s';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapUser(data: any): CommonUsersInformation {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid user data');
  }
  console.log("[UserMapper] Mapping user recived from GET user/me", data);
  return {
    id: data.id,
    email: data.email,
    username: data.name,
    role: data.role,
    description: data.description || '',
    avatarURL: data.avatarURL ?? DEFAULT_AVATAR_URL,
  };
}

