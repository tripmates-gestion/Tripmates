import * as React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Stack, Backdrop, CircularProgress } from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import { useAuth } from '../../../../hooks/useAuth';
import { useBusinessProfile } from '../../../../hooks/useBusinessProfile';
import { BUSINESS_TYPES } from '../../../../constants/Rol';
import { dataURLtoFile } from '../../../GeneralHelpers';
import { updateBusinessUser } from '../../../../services/userService';

import { type RestaurantForm } from '../common/types';
import { formatScheduleForInput, scheduleFromInput } from '../common/schedule';
import BusinessCommonFields from '../common/BusinessCommonFields';
import GalleryManager from '../common/GalleryManager';
import RestaurantFields from './RestaurantFields';
import { validateRestaurant, type RestaurantErrors } from '../../../../hooks/useUpdateBusinessUserValidation';

type Props = { open: boolean; onClose: () => void };

export default function RestaurantEditDialog({ open, onClose }: Props) {
  const { accessToken, refreshUser, user } = useAuth()
  const { business, refreshProfile } = useBusinessProfile()

  if (!business || business.businessType !== BUSINESS_TYPES.restaurant) return null

  const initialExisting = business.profileImageUrls?.length ? business.profileImageUrls : (user as any)?.profileImageUrls ?? []

  const initial: RestaurantForm = {
    name: business.name ?? '',
    description: business.description ?? '',
    location: typeof business.location === 'string' 
      ? { address: business.location, latitude: 0, longitude: 0 }
      : business.location ?? { address: '', latitude: 0, longitude: 0 },
    phoneNumber: business.phoneNumber ?? '',
    publicEmail: business.publicEmail ?? '',
    avatarUrl: business.avatarURL ?? '',
    avatar: null,
    existingPhotos: initialExisting,
    uploadingPhotos: [],
    openingDays: business.openingDays ?? [],
    openingHours: formatScheduleForInput(business.attentionSchedule as any),
    averagePrice: business.averagePrice ?? undefined,
    restaurantType: business.restaurantType as any,
  }

  const [form, setForm] = React.useState<RestaurantForm>(initial)
  const [saving, setSaving] = React.useState(false)
  const [toDelete, setToDelete] = React.useState<string[]>([])
  type FormErrors = {
    name?: string;
    description?: string;
    location?: string | { address?: string; latitude?: string; longitude?: string };
    phoneNumber?: string;
    publicEmail?: string;
    openingDays?: string;
    openingHours?: string;
    averagePrice?: string;
    restaurantType?: string;
  };

  const [errors, setErrors] = React.useState<FormErrors>({})

  React.useEffect(()=>{ if (open){ setForm(initial); setToDelete([]); setErrors({}) } }, [open])

  const setField = (k: keyof RestaurantForm, v: any) => {
    if (k === 'location' && typeof v === 'string') {
      setForm(prev => ({
        ...prev, 
        location: { 
          address: v, 
          latitude: 0, 
          longitude: 0 
        }
      }));
    } else {
      setForm(prev => ({ ...prev, [k]: v }));
    }
    setErrors(prev => ({ ...prev, [k]: undefined }));
  };


  const splitLines = (text: string) =>
    text.split('\n').map(s => s.trim()).filter(Boolean)


  const onSave = async () => {
    if (!accessToken || saving) return
  
  const openingHoursLines = splitLines(form.openingHours);
  
  // Convert Location object to string for the API
  const locationString = form.location.address;
  
  const preDto = {
    name: form.name.trim(),
    description: form.description,
    location: locationString,
      phoneNumber: form.phoneNumber.trim(),
      publicEmail: form.publicEmail.trim() || '',
      openingDays: form.openingDays,
      openingHours: openingHoursLines,           // ← ahora es string[]
      averagePrice: form.averagePrice,           // '$' | '$$' | '$$$' | undefined
      restaurantType: form.restaurantType || '',
      uploadingPhotos: form.uploadingPhotos,
      existingPhotos: form.existingPhotos
    }
  
    const v = validateRestaurant(preDto)
    if (Object.keys(v).length > 0) {
      setErrors(v)
      enqueueSnackbar('Revisá los campos marcados en rojo', { variant: 'warning' })
      return
    }
  
    try {
      setSaving(true)
      const dto: any = {
        name: preDto.name,
        description: preDto.description,
        location: preDto.location,
        phoneNumber: preDto.phoneNumber,
        publicEmail: form.publicEmail.trim() || undefined,
        openingDays: form.openingDays,
        attentionSchedule: scheduleFromInput(form.openingHours), // ← usa las líneas
        averagePrice: form.averagePrice,                         // categórico, opcional
        restaurantType: form.restaurantType || undefined,
      }
      if (toDelete.length > 0) dto.imageUrlsToDelete = toDelete
  
      const avatarFile = form.avatar ? dataURLtoFile(form.avatar, 'avatar.jpg') : null
      const galleryFiles = form.uploadingPhotos.map((p, i) => dataURLtoFile(p, `photo_${i+1}.jpg`))
  
      await updateBusinessUser(dto as any, avatarFile, galleryFiles, accessToken)
      await refreshProfile()
      await refreshUser()
      enqueueSnackbar('Cambios guardados', { variant: 'success' })
      onClose()
    } catch (e:any) {
      enqueueSnackbar(e?.message || 'Error al guardar', { variant: 'error' })
    } finally {
      setSaving(false)
    }
  }
  return (
    <>
      <Backdrop open={saving} sx={{ color:'#fff', zIndex:(t)=>t.zIndex.drawer+1 }}>
        <CircularProgress />
      </Backdrop>

      <Dialog
        open={open}
        onClose={onClose}
        maxWidth={false} // desactiva los límites predefinidos
        fullWidth
        PaperProps={{
          sx: {
            width: "60vw",   // ocupa el 80% del ancho de la ventana
            maxWidth: "1200px",
            height: "80vh",  // opcional: limita también la altura
            borderRadius: 1.2,
          },
        }}
      >
        <DialogTitle>Editar restaurante</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={3} sx={{ mt:1 }}>
            <BusinessCommonFields
              name={form.name} 
              description={form.description} 
              location={typeof form.location === 'string' 
                ? { address: form.location, latitude: 0, longitude: 0 }
                : form.location}
              phoneNumber={form.phoneNumber} 
              publicEmail={form.publicEmail}
              onChange={(field, value) => {
              if (field === 'location') {
                setForm(prev => ({
                  ...prev,
                  location: typeof value === 'string' 
                    ? { address: value, latitude: 0, longitude: 0 }
                    : value
                }));
              } else {
                setForm(prev => ({ ...prev, [field]: value }));
              }
            }}
              avatarUrl={form.avatarUrl} 
              onAvatarSelected={(b64) => setForm(prev => ({...prev, avatar: b64, avatarUrl: b64}))}
              disabled={saving}
              errors={{
                name: errors.name,
                description: errors.description,
                location: (() => {
                  if (!errors.location) return undefined;
                  if (typeof errors.location === 'string') {
                    return { 
                      address: errors.location, 
                      latitude: 0, 
                      longitude: 0 
                    };
                  }
                  return {
                    address: errors.location.address || '',
                    latitude: typeof errors.location.latitude === 'number' ? errors.location.latitude : 0,
                    longitude: typeof errors.location.longitude === 'number' ? errors.location.longitude : 0
                  };
                })(),
                phoneNumber: errors.phoneNumber,
                publicEmail: errors.publicEmail
              }}
            />

            <RestaurantFields
              openingDays={form.openingDays} setOpeningDays={(v)=> setField('openingDays', v)}
              openingHours={form.openingHours} setOpeningHours={(v)=> setField('openingHours', v)}
              averagePrice={form.averagePrice} setAveragePrice={(v)=> setField('averagePrice', v)}
              restaurantType={form.restaurantType} setRestaurantType={(v)=> setField('restaurantType', v)}
              disabled={saving}
              errors={{
                openingDays: errors.openingDays,
                openingHours: errors.openingHours,
                averagePrice: errors.averagePrice,
                restaurantType: errors.restaurantType
              }}
            />

            <GalleryManager
              existing={form.existingPhotos}
              toDelete={toDelete}
              setToDelete={setToDelete}
              newOnes={form.uploadingPhotos}
              setNewOnes={(v)=> setField('uploadingPhotos', v)}
              disabled={saving}
            />
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose} disabled={saving}>Cancelar</Button>
          <Button variant="contained" onClick={onSave} disabled={saving}>
            {saving ? 'Guardando…' : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}