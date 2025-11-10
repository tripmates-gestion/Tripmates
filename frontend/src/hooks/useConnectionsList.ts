import { useCallback, useEffect, useState } from 'react';
import type { CommonUser } from '../types/PrivateUserProfiles';
import { useAuth } from './useAuth';
import {
  getMyFollowers,
  getMyFollowings,
  getUserFollowers,
  getUserFollowings,
} from '../services/userService';

type ConnectionsType = 'followers' | 'followings';

interface UseConnectionsListOptions {
  enabled?: boolean;
}

export function useConnectionsList(
  type: ConnectionsType,
  targetUserId?: string | null,
  options?: UseConnectionsListOptions
) {
  const { accessToken } = useAuth();
  const [items, setItems] = useState<CommonUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const enabled = options?.enabled ?? true;

  const fetchData = useCallback(async () => {
    if (!enabled) return;

    if (!accessToken) {
      setItems([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = targetUserId
        ? type === 'followers'
          ? await getUserFollowers(targetUserId, accessToken)
          : await getUserFollowings(targetUserId, accessToken)
        : type === 'followers'
          ? await getMyFollowers(accessToken)
          : await getMyFollowings(accessToken);

      setItems(data);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'No pudimos cargar la lista. Intenta nuevamente.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [accessToken, enabled, targetUserId, type]);

  useEffect(() => {
    if (enabled) {
      fetchData();
    }
  }, [enabled, fetchData]);

  const removeItem = useCallback((userId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== userId));
  }, []);

  return {
    items,
    loading,
    error,
    refresh: fetchData,
    removeItem,
  } as const;
}
