import { useCallback, useEffect, useMemo, useState } from 'react';
import { followUser, getMyFollowings, unfollowUser } from '../services/userService';
import { useAuth } from './useAuth';

interface UseFollowStatusOptions {
  autoFetch?: boolean;
}


{/* Devuelve el estado de seguimiento de un usuario objetivo */ }
export function useFollowStatus(
  targetUserId: string | null | undefined,
  options?: UseFollowStatusOptions
) {
  const { accessToken, user } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { autoFetch = true } = options ?? {};
  const canFollow = useMemo(
    () => Boolean(accessToken && targetUserId && user?.id !== targetUserId),
    [accessToken, targetUserId, user?.id]
  );

  const refresh = useCallback(async () => {
    if (!canFollow) {
      setIsFollowing(false);
      setIsInitialized(true);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const followings = await getMyFollowings(accessToken);
      setIsFollowing(followings.some((account) => account.id === targetUserId));
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo obtener el estado de seguimiento.'
      );
    } finally {
      setIsLoading(false);
      setIsInitialized(true);
    }
  }, [accessToken, canFollow, targetUserId]);

  useEffect(() => {
    if (autoFetch) {
      refresh();
    }
  }, [autoFetch, refresh]);

  const follow = useCallback(async () => {
    if (!canFollow || !targetUserId) return;

    setIsLoading(true);
    setError(null);
    try {
      await followUser(targetUserId, accessToken);
      setIsFollowing(true);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'No se pudo seguir a la persona. Intenta nuevamente más tarde.';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
      setIsInitialized(true);
    }
  }, [accessToken, canFollow, targetUserId]);

  const unfollow = useCallback(async () => {
    if (!canFollow || !targetUserId) return;

    setIsLoading(true);
    setError(null);
    try {
      await unfollowUser(targetUserId, accessToken);
      setIsFollowing(false);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'No se pudo dejar de seguir a la persona. Intenta nuevamente más tarde.';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
      setIsInitialized(true);
    }
  }, [accessToken, canFollow, targetUserId]);

  const toggleFollow = useCallback(() => {
    return isFollowing ? unfollow() : follow();
  }, [follow, isFollowing, unfollow]);

  return {
    isFollowing,
    isLoading,
    isInitialized,
    error,
    canFollow,
    follow,
    unfollow,
    toggleFollow,
    refresh,
  } as const;
}
