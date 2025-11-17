import { apiFetch } from '../api/client';
import { ENDPOINTS } from '../api/endpoints';
import type { BusinessUpdateResponseDTO } from '../types/business';
import type { BusinessUser, CommonUser } from '../types/PrivateUserProfiles';

function ensureToken(accessToken: string | null) {
  if (!accessToken) throw new Error('No estás autenticado.');
  return accessToken;
}


export async function getCurrentUser(token: string) {
  return apiFetch(ENDPOINTS.USER_ME, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function updateBusinessUser(
  data: BusinessUser,
  avatar: File | null,
  files: File[],
  accessToken: string | null,
  signal?: AbortSignal
): Promise<BusinessUpdateResponseDTO> {
  const token = ensureToken(accessToken);
  
  const fd = new FormData();
  fd.append("data", JSON.stringify(data));
  
  if (avatar) fd.append("avatar", avatar, avatar.name);
  files.forEach((f) => fd.append("files", f, f.name));
  console.log("[USER SERVICE]: Sending request with:\n", "Method: PATCH\n", "Endpoint: ", ENDPOINTS.USER_ME, "\n")
  console.log("Data: ", data)

  return apiFetch(ENDPOINTS.USER_ME, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` }, // SIN Content-Type
    body: fd,
    signal,
  }) as Promise<BusinessUpdateResponseDTO>;
}



// services/userService.ts
export async function updateUser(
  data: Partial<CommonUser>,
  avatar: File | null,
  accessToken: string | null,
  signal?: AbortSignal
): Promise<unknown> {
  const token = ensureToken(accessToken);

  const fd = new FormData();
  // sólo los campos de texto van en data
  fd.append('data', JSON.stringify(data));

  if (avatar) {
    fd.append('avatar', avatar, avatar.name);
  }

  console.log(
    '[USER SERVICE]: Sending request with:\n',
    'Method: PATCH\n',
    'Endpoint: ',
    ENDPOINTS.USER_ME,
    '\n'
  );
  console.log('Data (JSON): ', data);
  if (avatar) {
    console.log('Avatar file:', {
      name: avatar.name,
      size: avatar.size,
      type: avatar.type,
    });
  } else {
    console.log('No avatar file attached');
  }

  return apiFetch(ENDPOINTS.USER_ME, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` }, // SIN Content-Type
    body: fd,
    signal,
  });
}




{/* Sistemas de seguidores */}

type FollowersResponse = { followers: CommonUser[] } | null;
type FollowingsResponse = { followings: CommonUser[] } | null;

export async function getMyFollowers(accessToken: string | null): Promise<CommonUser[]> {
  const token = ensureToken(accessToken);
  const response = (await apiFetch(ENDPOINTS.MY_FOLLOWERS, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  })) as FollowersResponse;

  return response?.followers ?? [];
}

export async function getMyFollowings(accessToken: string | null): Promise<CommonUser[]> {
  const token = ensureToken(accessToken);
  const response = (await apiFetch(ENDPOINTS.MY_FOLLOWINGS, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  })) as FollowingsResponse;

  return response?.followings ?? [];
}

export async function getUserFollowers(
  userId: string,
  accessToken: string | null
): Promise<CommonUser[]> {
  const token = ensureToken(accessToken);
  const response = (await apiFetch(ENDPOINTS.USER_FOLLOWERS(userId), {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  })) as FollowersResponse;

  return response?.followers ?? [];
}

export async function getUserFollowings(
  userId: string,
  accessToken: string | null
): Promise<CommonUser[]> {
  const token = ensureToken(accessToken);
  const response = (await apiFetch(ENDPOINTS.USER_FOLLOWINGS(userId), {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  })) as FollowingsResponse;

  return response?.followings ?? [];
}

export async function followUser(userId: string, accessToken: string | null): Promise<void> {
  const token = ensureToken(accessToken);
  await apiFetch(ENDPOINTS.FOLLOW_USER(userId), {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function unfollowUser(userId: string, accessToken: string | null): Promise<void> {
  const token = ensureToken(accessToken);
  await apiFetch(ENDPOINTS.UNFOLLOW_USER(userId), {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
}


export async function getUserByEmail(email: string, accessToken: string | null) {
  const token = ensureToken(accessToken);
  const response = await apiFetch(ENDPOINTS.GET_USER_BY_EMAIL.replace('{email}', email), {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
  return response;
}