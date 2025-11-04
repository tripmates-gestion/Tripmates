import * as React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Stack, Backdrop, CircularProgress
} from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import { useAuth } from '../../../hooks/useAuth';
import { useBusinessProfile } from '../../../hooks/useBusinessProfile';
import { BUSINESS_TYPES } from '../../../constants/Rol';
import { dataURLtoFile } from './common/Utils';
import { updateBusinessUser } from '../../../services/userService';
import BusinessCommonFields from './common/BusinessCommonFields';
import GalleryManager from './common/GalleryManager';
import HotelFields from './HotelFields';
import { type HotelType } from '../../../types/Hotel';
import { validateHotel, type HotelErrors } from '../../../hooks/useUpdateBusinessUserValidation';

type Props = { open: boolean; onClose: () => void };

type HotelForm = {
  name: string;
  description: string;
  location: string;
  phoneNumber: string;
  publicEmail: string;
  hotelType?: HotelType;
  avatarUrl?: string;
  avatar?: string | null;
  existingPhotos: string[];
  uploadingPhotos: string[];
};

export default function HotelEditDialog({ open, onClose }: Props) {
  const { accessToken, updateUser } = useAuth();
  const { business, refreshProfile } = useBusinessProfile();

  if (!business || business.businessType !== BUSINESS_TYPES.hotel) return null;

  const initialExisting =
    business.profileImageUrls?.length
      ? business.profileImageUrls
      : [];

  const initial: HotelForm = {
    name: business.name ?? '',
    description: business.description ?? '',
    location: business.location ?? '',
    phoneNumber: business.phoneNumber ?? '',
    publicEmail: business.publicEmail ?? '',
    hotelType: (business as any).hotelType as HotelType | undefined,
    avatarUrl: business.avatarURL ?? '',
    avatar: null,
    existingPhotos: initialExisting,
    uploadingPhotos: [],
  };

  const [form, setForm] = React.useState<HotelForm>(initial);
  const [saving, setSaving] = React.useState(false);
  const [toDelete, setToDelete] = React.useState<string[]>([]);

  const [errors, setErrors] = React.useState<HotelErrors>({})

  React.useEffect(() => {
    if (open) {
      setForm(initial)
      setToDelete([])
      setErrors({})
    }
  }, [open])

  const setField = <K extends keyof HotelForm>(k: K, v: HotelForm[K]) => {
    setForm(p => ({ ...p, [k]: v }))
    setErrors(e => ({ ...e, [k]: undefined }))
  }

  const onSave = async () => {
    if (!accessToken || saving) return
    const preDto = {
      name: form.name.trim(),
      description: form.description,
      location: form.location.trim(),
      phoneNumber: form.phoneNumber.trim(),
      publicEmail: form.publicEmail.trim(),
      hotelType: form.hotelType,
      existingPhotos: form.existingPhotos,
      uploadingPhotos: form.uploadingPhotos,
    }
    const v = validateHotel(preDto)
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
        publicEmail: preDto.publicEmail || undefined,
        hotelType: preDto.hotelType || undefined,
      }
      if (toDelete.length > 0) dto.imageUrlsToDelete = toDelete

      const avatarFile = form.avatar ? dataURLtoFile(form.avatar, 'avatar.jpg') : null
      const galleryFiles = form.uploadingPhotos.map((p, i) =>
        dataURLtoFile(p, `photo_${i + 1}.jpg`)
      )

      await updateBusinessUser(dto as any, avatarFile, galleryFiles, accessToken)
      await refreshProfile()
      updateUser(dto.name, dto.description ?? null, form.avatar ? form.avatarUrl ?? null : null)
      enqueueSnackbar('¡Los cambios se guardaron correctamente!', { variant: 'success' })
      onClose()
    } catch (err: any) {
      enqueueSnackbar(err?.message || 'Error al guardar los cambios.', { variant: 'error' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <Backdrop open={saving} sx={{ color: '#fff', zIndex: (t) => t.zIndex.drawer + 1 }}>
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
        <DialogTitle>Editar hotel</DialogTitle>
        <DialogContent dividers>
        <Stack spacing={3} sx={{ mt: 1 }}>
          <BusinessCommonFields
            name={form.name}
            description={form.description}
            location={form.location}
            phoneNumber={form.phoneNumber}
            publicEmail={form.publicEmail}
            avatarUrl={form.avatarUrl}
            onAvatarSelected={(b64)=> setForm(prev=>({...prev, avatar:b64, avatarUrl:b64}))}
            onChange={(k, v) => setField(k as keyof HotelForm, v as any)}
            disabled={saving}
            errors={{
              name: errors.name,
              description: errors.description,
              location: errors.location,
              phoneNumber: errors.phoneNumber,
              publicEmail: errors.publicEmail,
            }}
          />

          <HotelFields
            hotelType={form.hotelType}
            setHotelType={(v) => setField('hotelType', v)}
            disabled={saving}
            errors={{ hotelType: errors.hotelType }}
          />

          <GalleryManager
            existing={form.existingPhotos}
            toDelete={toDelete}
            setToDelete={setToDelete}
            newOnes={form.uploadingPhotos}
            setNewOnes={(v) => setField('uploadingPhotos', v)}
            disabled={saving}
          />
        </Stack>
      </DialogContent>

        <DialogActions>
          <Button onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={onSave}
            disabled={saving}
            startIcon={saving ? <CircularProgress size={18} /> : undefined}
          >
            {saving ? 'Guardando…' : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
