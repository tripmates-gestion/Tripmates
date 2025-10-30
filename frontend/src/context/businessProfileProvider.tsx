import { getCurrentUser } from '../services/userService'; // endpoint GET /users/me
import { useAuth } from '../hooks/useAuth';
import type { CompleteBusinessProfile } from '../types/business';
import { useCallback, useEffect, useState } from 'react';
import { BusinessProfileContext } from './businessProfileContext';
import { DEFAULT_OPENING_DAYS } from '../types/business';
import { DEFAULT_STATS } from '../constants/DefaultStats'


const DEFAULT_COVER_URL = 'https://png.pngtree.com/background/20250119/original/pngtree-mountain-scenery-natural-banner-images-picture-image_16218538.jpg'; // si querés una imagen placeholder poné acá la URL

// ---------------------- Provider ----------------------
export const BusinessProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { token , user} = useAuth();
    const [completeProfile, setCompleteProfile] = useState<CompleteBusinessProfile | null>(null);
    const [loading, setLoading] = useState(false);
  
    const refreshProfile = useCallback(async () => {
      if (!token) return;
      setLoading(true);
      try {
        const response = await getCurrentUser(token);
        // perfil basado en la información del usuario reciente del back
        const mappedProfile: CompleteBusinessProfile = {
          name: response.name,
          description: response.description,
          openningDays: response.openingDays ?? DEFAULT_OPENING_DAYS,
          openingHours: response.attentionSchedule ?? null,
          location: response.location ?? '',
          phone: response.phoneNumber ?? '',
          businessUrlPhotos: response.profileImageUrls ?? [],
          avatarUrl: response.avatarURL ?? user?.avatarURL ?? undefined,
          coverUrl: response.coverURL ?? DEFAULT_COVER_URL,
          stats: response.stats ?? DEFAULT_STATS,
        };
        setCompleteProfile(mappedProfile);
      } catch (error) {
        console.error('Error fetching business profile:', error);
      } finally {
        setLoading(false);
      }
    }, [token, user?.avatarURL]);
  
    useEffect(() => {
      refreshProfile();
    }, [refreshProfile]);
  
    return (
      <BusinessProfileContext.Provider
        value={{ completeProfile, setCompleteProfile, refreshProfile, loading }}
      >
        {children}
      </BusinessProfileContext.Provider>
    );
  };
  
  