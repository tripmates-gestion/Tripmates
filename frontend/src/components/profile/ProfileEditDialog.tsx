
import * as React from 'react';
import {
  Backdrop,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import { BUSINESS_TYPES } from '../../constants/Rol';
import { PROFILE_LIMITS } from '../../constants/UserProfile';
import { useAuth } from '../../hooks/useAuth';
import { useBusinessProfile } from '../../hooks/useBusinessProfile';
import { updateBusinessUser, updateUser } from '../../services/userService';
import type {
  BusinessCommon,
  BusinessUser,
  CommonUser,
  RestaurantExtras,
} from '../../types/PrivateUserProfiles';
import type { HotelType } from '../../types/Hotel';
import type { RestaurantType } from '../../types/Restaurant';
import type { SocialMediaLinks } from '../../services/socialMedia';
import { updateMySocialMedia } from '../../services/socialMedia';
import { dataURLtoFile } from '../GeneralHelpers';
import CountedTextField from '../ui/CountedTextField';
import ImageUploader from '../ui/ImageUploader';
import BusinessCommonFields from './businessPrivateProfile/common/BusinessCommonFields';
import GalleryManager from './businessPrivateProfile/common/GalleryManager';
import type { Location } from './businessPrivateProfile/common/types';
import HotelFields from './businessPrivateProfile/hotel/HotelFields';
import { formatScheduleForInput, scheduleFromInput } from './businessPrivateProfile/common/schedule';
import RestaurantFields from './businessPrivateProfile/restaurant/RestaurantFields';
import {
  validateHotel,
  validateRestaurant,
  type HotelErrors,
  type RestaurantErrors,
} from '../../hooks/useUpdateBusinessUserValidation';

export type ProfileType = 'business' | 'traveler';

export type ProfileEditDialogProps = {
  open: boolean;
  onClose: () => void;
  profileType: ProfileType;
  initialProfileData: BusinessUser | CommonUser;
  initialSocialMedia: SocialMediaLinks;
  onProfileUpdated?: (profile: BusinessUser | CommonUser, social: SocialMediaLinks) => void;
};

const isRestaurant = (
  b: BusinessUser,
): b is BusinessCommon & { businessType: 'RESTAURANT' } & RestaurantExtras =>
  b.businessType === BUSINESS_TYPES.restaurant;

const isHotel = (
  b: BusinessUser,
): b is BusinessCommon & { businessType: 'HOTEL' } & { hotelType?: HotelType } =>
  b.businessType === BUSINESS_TYPES.hotel;

const BASE_URLS: Record<keyof SocialMediaLinks, string> = {
  instagramURL: 'https://instagram.com/',
  xURL: 'https://x.com/',
  facebookURL: 'https://facebook.com/',
};

const isValidUrl = (value?: string) => {
  if (!value) return true;
  return /^https?:\/\//i.test(value.trim());
};

const normalizeValue = (key: keyof SocialMediaLinks, raw?: string) => {
  if (!raw) return '';

  const trimmed = raw.trim();
  if (isValidUrl(trimmed)) return trimmed;

  const username = trimmed.replace(/^@/, '');
  const base = BASE_URLS[key];
  return base ? `${base}${username}` : username;
};

type RestaurantForm = {
  name: string;
  description: string;
  location: Location;
  phoneNumber: string;
  publicEmail: string;
  avatarUrl?: string;
  avatar?: string | null;
  existingPhotos: string[];
  uploadingPhotos: string[];
  openingDays: string[];
  openingHours: string;
  averagePrice?: '$' | '$$' | '$$$';
  restaurantType?: RestaurantType;
};

type HotelForm = {
  name: string;
  description: string;
  location: Location;
  phoneNumber: string;
  publicEmail: string;
  hotelType?: HotelType;
  avatarUrl?: string;
  avatar?: string | null;
  existingPhotos: string[];
  uploadingPhotos: string[];
};

export default function ProfileEditDialog({
  open,
  onClose,
  profileType,
  initialProfileData,
  initialSocialMedia,
  onProfileUpdated,
}: ProfileEditDialogProps) {
  const { accessToken, refreshUser } = useAuth();
  const { business, refreshProfile } = useBusinessProfile();

  const [socialValues, setSocialValues] = React.useState<SocialMediaLinks>(initialSocialMedia ?? {});
  const [socialError, setSocialError] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setSocialValues(initialSocialMedia ?? {});
      setSocialError(null);
    }
  }, [initialSocialMedia, open]);

  const [userName, setUserName] = React.useState('');
  const [userDescription, setUserDescription] = React.useState('');
  const [avatarPreview, setAvatarPreview] = React.useState<string | undefined>('');
  const [avatarDataUrl, setAvatarDataUrl] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (profileType === 'traveler' && open) {
      const traveler = initialProfileData as CommonUser;
      setUserName(traveler.name ?? '');
      setUserDescription(traveler.description ?? '');
      setAvatarPreview(traveler.avatarURL);
      setAvatarDataUrl(null);
    }
  }, [initialProfileData, profileType, open]);

  const [restaurantForm, setRestaurantForm] = React.useState<RestaurantForm | null>(null);
  const [restaurantErrors, setRestaurantErrors] = React.useState<RestaurantErrors>({});
  const [restaurantToDelete, setRestaurantToDelete] = React.useState<string[]>([]);

  const [hotelForm, setHotelForm] = React.useState<HotelForm | null>(null);
  const [hotelErrors, setHotelErrors] = React.useState<HotelErrors>({});
  const [hotelToDelete, setHotelToDelete] = React.useState<string[]>([]);

  React.useEffect(() => {
    if (profileType !== 'business' || !open) return;

    const currentBusiness = (initialProfileData as BusinessUser) ?? business;
    if (!currentBusiness) return;

    if (isRestaurant(currentBusiness)) {
      const initialExisting = currentBusiness.profileImageUrls?.length
        ? currentBusiness.profileImageUrls
        : [];

      const init: RestaurantForm = {
        name: currentBusiness.name ?? '',
        description: currentBusiness.description ?? '',
        location:
          typeof currentBusiness.location === 'string'
            ? { address: currentBusiness.location, latitude: 0, longitude: 0 }
            : currentBusiness.location ?? { address: '', latitude: 0, longitude: 0 },
        phoneNumber: currentBusiness.phoneNumber ?? '',
        publicEmail: currentBusiness.publicEmail ?? '',
        avatarUrl: currentBusiness.avatarURL ?? '',
        avatar: null,
        existingPhotos: initialExisting,
        uploadingPhotos: [],
        openingDays: currentBusiness.openingDays ?? [],
        openingHours: formatScheduleForInput(currentBusiness.attentionSchedule as any),
        averagePrice: currentBusiness.averagePrice ?? undefined,
        restaurantType: (currentBusiness.restaurantType ?? undefined) as RestaurantType | undefined,
      };
      setRestaurantForm(init);
      setRestaurantToDelete([]);
      setRestaurantErrors({});
    } else if (isHotel(currentBusiness)) {
      const initialExisting = currentBusiness.profileImageUrls?.length
        ? currentBusiness.profileImageUrls
        : [];

      const init: HotelForm = {
        name: currentBusiness.name ?? '',
        description: currentBusiness.description ?? '',
        location:
          typeof currentBusiness.location === 'string'
            ? { address: currentBusiness.location, latitude: 0, longitude: 0 }
            : currentBusiness.location ?? { address: '', latitude: 0, longitude: 0 },
        phoneNumber: currentBusiness.phoneNumber ?? '',
        publicEmail: currentBusiness.publicEmail ?? '',
        hotelType: (currentBusiness as any).hotelType as HotelType | undefined,
        avatarUrl: currentBusiness.avatarURL ?? '',
        avatar: null,
        existingPhotos: initialExisting,
        uploadingPhotos: [],
      };
      setHotelForm(init);
      setHotelToDelete([]);
      setHotelErrors({});
    }
  }, [business, initialProfileData, open, profileType]);

  const handleSocialChange = (key: keyof SocialMediaLinks) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setSocialValues(prev => ({ ...prev, [key]: event.target.value }));
    };

  const renderSocialFields = () => (
    <Stack spacing={2} sx={{ mt: 2 }}>
      <Typography variant="subtitle1" fontWeight={700}>
        Redes sociales (opcional)
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Podés dejar los campos vacíos. Si escribís solo tu usuario, completaremos el link automáticamente.
      </Typography>

      <TextField
        label="Instagram"
        placeholder="usuario"
        value={socialValues.instagramURL ?? ''}
        onChange={handleSocialChange('instagramURL')}
        fullWidth
      />

      <TextField
        label="X / Twitter"
        placeholder="usuario"
        value={socialValues.xURL ?? ''}
        onChange={handleSocialChange('xURL')}
        fullWidth
      />

      <TextField
        label="Facebook"
        placeholder="usuario"
        value={socialValues.facebookURL ?? ''}
        onChange={handleSocialChange('facebookURL')}
        fullWidth
      />

      {socialError && (
        <Box sx={{ color: 'error.main', fontSize: 14 }}>
          {socialError}
        </Box>
      )}
    </Stack>
  );

  const splitLines = (text: string) => text.split('\n').map(s => s.trim()).filter(Boolean);


  const saveTraveler = async () => {
    const traveler = initialProfileData as CommonUser;
    const changes: Partial<CommonUser> = {
      name: userName,
      description: userDescription,
    };
    const avatarFile = avatarDataUrl ? dataURLtoFile(avatarDataUrl, 'avatar.jpg') : null;
    await updateUser(changes, avatarFile, accessToken);
    await refreshUser();
    return { ...traveler, ...changes, avatarURL: avatarDataUrl ?? traveler.avatarURL } as CommonUser;
  };

  const saveRestaurant = async (form: RestaurantForm) => {
    const openingHoursLines = splitLines(form.openingHours);

    const preDto = {
      name: form.name.trim(),
      description: form.description,
      location: form.location,
      phoneNumber: form.phoneNumber.trim(),
      publicEmail: form.publicEmail.trim() || '',
      openingDays: form.openingDays,
      openingHours: openingHoursLines,
      averagePrice: form.averagePrice,
      restaurantType: form.restaurantType || '',
      uploadingPhotos: form.uploadingPhotos,
      existingPhotos: form.existingPhotos,
    };

    const validation = validateRestaurant(preDto);
    if (Object.keys(validation).length > 0) {
      setRestaurantErrors(validation);
      enqueueSnackbar('Revisá los campos marcados en rojo', { variant: 'warning' });
      throw new Error('validation-error');
    }

    const dto: any = {
      name: preDto.name,
      description: preDto.description,
      location: preDto.location,
      phoneNumber: preDto.phoneNumber,
      publicEmail: form.publicEmail.trim() || undefined,
      openingDays: form.openingDays,
      attentionSchedule: scheduleFromInput(form.openingHours),
      averagePrice: form.averagePrice,
      restaurantType: form.restaurantType || undefined,
    };
    if (restaurantToDelete.length > 0) dto.imageUrlsToDelete = restaurantToDelete;

    const avatarFile = form.avatar ? dataURLtoFile(form.avatar, 'avatar.jpg') : null;
    const galleryFiles = form.uploadingPhotos.map((p, i) => dataURLtoFile(p, `photo_${i + 1}.jpg`));

    await updateBusinessUser(dto as any, avatarFile, galleryFiles, accessToken);
    await refreshProfile();
    const updatedProfile: BusinessUser = {
      ...(business as BusinessUser),
      ...dto,
      avatarURL: form.avatar ?? (business as BusinessUser).avatarURL,
      profileImageUrls: form.existingPhotos,
    } as BusinessUser;
    return updatedProfile;
  };

  const saveHotel = async (form: HotelForm) => {
    const preDto = {
      name: form.name.trim(),
      description: form.description,
      location: form.location,
      phoneNumber: form.phoneNumber.trim(),
      publicEmail: form.publicEmail.trim(),
      hotelType: form.hotelType,
      existingPhotos: form.existingPhotos,
      uploadingPhotos: form.uploadingPhotos,
    };

    const validation = validateHotel(preDto);
    if (Object.keys(validation).length > 0) {
      setHotelErrors(validation);
      enqueueSnackbar('Revisá los campos marcados en rojo', { variant: 'warning' });
      throw new Error('validation-error');
    }

    const dto: any = {
      name: preDto.name,
      description: preDto.description,
      location: preDto.location,
      phoneNumber: preDto.phoneNumber,
      publicEmail: preDto.publicEmail || undefined,
      hotelType: preDto.hotelType || undefined,
    };
    if (hotelToDelete.length > 0) dto.imageUrlsToDelete = hotelToDelete;

    const avatarFile = form.avatar ? dataURLtoFile(form.avatar, 'avatar.jpg') : null;
    const galleryFiles = form.uploadingPhotos.map((p, i) => dataURLtoFile(p, `photo_${i + 1}.jpg`));

    await updateBusinessUser(dto as any, avatarFile, galleryFiles, accessToken);
    await refreshProfile();
    const updatedProfile: BusinessUser = {
      ...(business as BusinessUser),
      ...dto,
      avatarURL: form.avatar ?? (business as BusinessUser).avatarURL,
      profileImageUrls: form.existingPhotos,
    } as BusinessUser;
    return updatedProfile;
  };

  const handleSave = async () => {
    setSocialError(null);
    const normalized: SocialMediaLinks = {
      instagramURL: normalizeValue('instagramURL', socialValues.instagramURL),
      xURL: normalizeValue('xURL', socialValues.xURL),
      facebookURL: normalizeValue('facebookURL', socialValues.facebookURL),
    };

    if (!isValidUrl(normalized.instagramURL) || !isValidUrl(normalized.xURL) || !isValidUrl(normalized.facebookURL)) {
      setSocialError('Revisá los enlaces ingresados. Recordá incluir http(s)://.');
      return;
    }

    if (!accessToken) {
      enqueueSnackbar('Necesitás estar autenticado para editar tu perfil.', { variant: 'error' });
      return;
    }

    try {
      setSaving(true);
      let updatedProfile: BusinessUser | CommonUser | undefined;
      if (profileType === 'traveler') {
        updatedProfile = await saveTraveler();
      } else if (profileType === 'business' && business) {
        const currentBusiness = business as BusinessUser;
        if (isRestaurant(currentBusiness) && restaurantForm) {
          updatedProfile = await saveRestaurant(restaurantForm);
        } else if (isHotel(currentBusiness) && hotelForm) {
          updatedProfile = await saveHotel(hotelForm);
        }
      }
      await updateMySocialMedia(normalized, accessToken);
      onProfileUpdated?.(updatedProfile ?? initialProfileData, normalized);
      enqueueSnackbar('¡Los cambios se guardaron correctamente!', { variant: 'success' });
      onClose();
    } catch (e: any) {
      if (e?.message !== 'validation-error') {
        const message = e instanceof Error ? e.message : 'No pudimos guardar los cambios.';
        setSocialError(message);
        enqueueSnackbar(message, { variant: 'error' });
      }
    } finally {
      setSaving(false);
    }
  };

  const renderTravelerContent = () => (
    <Stack spacing={3} sx={{ mt: 1 }}>
      <CountedTextField
        label="Nombre"
        value={userName}
        onChange={(v) => setUserName(v)}
        maxLength={PROFILE_LIMITS.name}
        fullWidth
        disabled={saving}
      />

      <CountedTextField
        label="Descripción"
        value={userDescription}
        onChange={(v) => setUserDescription(v)}
        maxLength={PROFILE_LIMITS.description}
        fullWidth
        multiline
        minRows={3}
        disabled={saving}
      />

      <ImageUploader
        label="Foto de perfil"
        imageUrl={avatarPreview}
        variant="circular"
        onChange={(b64) => {
          const val = b64 || null;
          setAvatarDataUrl(val);
          setAvatarPreview(val || (initialProfileData as CommonUser).avatarURL);
        }}
      />

      <Divider />

      {renderSocialFields()}
    </Stack>
  );

  const renderRestaurantContent = (form: RestaurantForm) => (
    <Stack spacing={3} sx={{ mt: 1 }}>
      <BusinessCommonFields
        name={form.name}
        description={form.description}
        location={typeof form.location === 'string' ? { address: form.location, latitude: 0, longitude: 0 } : form.location}
        phoneNumber={form.phoneNumber}
        publicEmail={form.publicEmail}
        onChange={(field, value) => {
          if (field === 'location') {
            setRestaurantForm(prev => prev ? { ...prev, location: typeof value === 'string' ? { address: value, latitude: 0, longitude: 0 } : value } : prev);
          } else {
            setRestaurantForm(prev => prev ? { ...prev, [field]: value } as RestaurantForm : prev);
          }
          setRestaurantErrors(prev => ({ ...prev, [field]: undefined }));
        }}
        avatarUrl={form.avatarUrl}
        onAvatarSelected={(b64) => setRestaurantForm(prev => prev ? ({ ...prev, avatar: b64, avatarUrl: b64 }) : prev)}
        disabled={saving}
        errors={{
          name: restaurantErrors.name,
          description: restaurantErrors.description,
          location: restaurantErrors.location,
          phoneNumber: restaurantErrors.phoneNumber,
          publicEmail: restaurantErrors.publicEmail,
        }}
      />

      <RestaurantFields
        openingDays={form.openingDays}
        setOpeningDays={(v) => setRestaurantForm(prev => prev ? { ...prev, openingDays: v } : prev)}
        openingHours={form.openingHours}
        setOpeningHours={(v) => setRestaurantForm(prev => prev ? { ...prev, openingHours: v } : prev)}
        averagePrice={form.averagePrice}
        setAveragePrice={(v) => setRestaurantForm(prev => prev ? { ...prev, averagePrice: v } : prev)}
        restaurantType={form.restaurantType}
        setRestaurantType={(v) => setRestaurantForm(prev => prev ? { ...prev, restaurantType: v } : prev)}
        disabled={saving}
        errors={{
          openingDays: restaurantErrors.openingDays,
          openingHours: restaurantErrors.openingHours,
          averagePrice: restaurantErrors.averagePrice,
          restaurantType: restaurantErrors.restaurantType,
        }}
      />

      <GalleryManager
        existing={form.existingPhotos}
        toDelete={restaurantToDelete}
        setToDelete={setRestaurantToDelete}
        newOnes={form.uploadingPhotos}
        setNewOnes={(v) => setRestaurantForm(prev => prev ? { ...prev, uploadingPhotos: v } : prev)}
        disabled={saving}
      />

      <Divider />

      {renderSocialFields()}
    </Stack>
  );

  const renderHotelContent = (form: HotelForm) => (
    <Stack spacing={3} sx={{ mt: 1 }}>
      <BusinessCommonFields
        name={form.name}
        description={form.description}
        location={typeof form.location === 'string' ? { address: form.location, latitude: 0, longitude: 0 } : form.location}
        phoneNumber={form.phoneNumber}
        publicEmail={form.publicEmail}
        onChange={(field, value) => {
          if (field === 'location') {
            setHotelForm(prev => prev ? { ...prev, location: typeof value === 'string' ? { address: value, latitude: 0, longitude: 0 } : value } : prev);
          } else {
            setHotelForm(prev => prev ? { ...prev, [field]: value } as HotelForm : prev);
          }
          setHotelErrors(prev => ({ ...prev, [field]: undefined }));
        }}
        avatarUrl={form.avatarUrl}
        onAvatarSelected={(b64) => setHotelForm(prev => prev ? ({ ...prev, avatar: b64, avatarUrl: b64 }) : prev)}
        disabled={saving}
        errors={{
          name: hotelErrors.name,
          description: hotelErrors.description,
          location: hotelErrors.location,
          phoneNumber: hotelErrors.phoneNumber,
          publicEmail: hotelErrors.publicEmail,
        }}
      />

      <HotelFields
        hotelType={form.hotelType}
        setHotelType={(v) => setHotelForm(prev => prev ? { ...prev, hotelType: v } : prev)}
        disabled={saving}
        errors={{ hotelType: hotelErrors.hotelType }}
      />

      <GalleryManager
        existing={form.existingPhotos}
        toDelete={hotelToDelete}
        setToDelete={setHotelToDelete}
        newOnes={form.uploadingPhotos}
        setNewOnes={(v) => setHotelForm(prev => prev ? { ...prev, uploadingPhotos: v } : prev)}
        disabled={saving}
      />

      <Divider />

      {renderSocialFields()}
    </Stack>
  );

  const renderContent = () => {
    if (profileType === 'traveler') return renderTravelerContent();

    if (profileType === 'business' && business) {
      const currentBusiness = business as BusinessUser;
      if (isRestaurant(currentBusiness) && restaurantForm) {
        return renderRestaurantContent(restaurantForm);
      }
      if (isHotel(currentBusiness) && hotelForm) {
        return renderHotelContent(hotelForm);
      }
    }

    return (
      <Typography variant="body2" color="text.secondary">
        No pudimos cargar la información del perfil.
      </Typography>
    );
  };

  const dialogTitle =
    profileType === 'traveler'
      ? 'Editar perfil'
      : isRestaurant(initialProfileData as BusinessUser)
        ? 'Editar restaurante'
        : 'Editar negocio';

  return (
    <>
      <Backdrop open={saving} sx={{ color: '#fff', zIndex: (t) => t.zIndex.drawer + 1 }}>
        <CircularProgress />
      </Backdrop>

      <Dialog
        open={open}
        onClose={saving ? undefined : onClose}
        maxWidth={profileType === 'business' ? false : 'sm'}
        fullWidth
        PaperProps={
          profileType === 'business'
            ? {
                sx: {
                  width: '60vw',
                  maxWidth: '1200px',
                  height: '80vh',
                  borderRadius: 1.2,
                },
              }
            : undefined
        }
      >
        <DialogTitle>{dialogTitle}</DialogTitle>
        <DialogContent dividers>{renderContent()}</DialogContent>

        <DialogActions>
          <Button onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}>
            {saving ? 'Guardando…' : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
