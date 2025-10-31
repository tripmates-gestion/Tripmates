import * as React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Stack, TextField, Grid, Card, CardMedia, Typography, Box
} from '@mui/material';
import { useAuth } from '../../../hooks/useAuth';
import { useBusinessProfile } from '../../../hooks/useBusinessProfile';
import { BUSINESS_TYPES } from '../../../constants/Rol';
import { dataURLtoFile } from './Utils';
import { updateBusinessUser } from '../../../services/userService';

type Props = { open: boolean; onClose: () => void };

type HotelFormState = {
  name: string;
  description: string;
  location: string;
  phoneNumber: string;
  publicEmail: string;
  hotelType?: string;

  avatarUrl?: string;
  avatar?: string | null;
  uploadingPhotos: string[];
};

export default function HotelEditDialog({ open, onClose }: Props) {
  const { accessToken, updateUser } = useAuth();
  const { business, refreshProfile } = useBusinessProfile();

  if (!business || business.businessType !== BUSINESS_TYPES.hotel) return null;

  const initial: HotelFormState = {
    name: business.name ?? '',
    description: business.description ?? '',
    location: business.location ?? '',
    phoneNumber: business.phoneNumber ?? '',
    publicEmail: business.publicEmail ?? '',
    hotelType: business.hotelType ?? '',
    avatarUrl: business.avatarURL ?? '',
    avatar: null,
    uploadingPhotos: [],
  };

  const [form, setForm] = React.useState<HotelFormState>(initial);
  React.useEffect(() => { if (open) setForm(initial); }, [open]);

  const handleChange = (k: keyof HotelFormState, v: any) =>
    setForm(prev => ({ ...prev, [k]: v }));

  const onAvatarSelected = (dataUrl: string) => {
    setForm(prev => ({ ...prev, avatar: dataUrl, avatarUrl: dataUrl }));
  };

  const onAddPhoto = (dataUrl: string) => {
    setForm(prev => ({ ...prev, uploadingPhotos: [...prev.uploadingPhotos, dataUrl] }));
  };

  const onRemovePhotoAt = (i: number) => {
    setForm(prev => ({ ...prev, uploadingPhotos: prev.uploadingPhotos.filter((_, idx) => idx !== i) }));
  };

  const onSave = async () => {
    if (!accessToken) return;

    const dto = {
      name: form.name.trim(),
      description: form.description,
      location: form.location.trim(),
      phoneNumber: form.phoneNumber.trim(),
      publicEmail: form.publicEmail.trim() || undefined,

      // específico hotel
      hotelType: form.hotelType?.trim() || undefined,
    };

    const avatarFile = form.avatar ? dataURLtoFile(form.avatar, 'avatar.jpg') : null;
    const galleryFiles = form.uploadingPhotos.map((p, i) => dataURLtoFile(p, `photo_${i + 1}.jpg`));

    await updateBusinessUser(dto as any, avatarFile, galleryFiles, accessToken);
    await refreshProfile();

    updateUser(dto.name, dto.description ?? null, form.avatar ? form.avatarUrl ?? null : null);

    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Editar hotel</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={3} sx={{ mt: 1 }}>
          <TextField label="Nombre" fullWidth value={form.name} onChange={e => handleChange('name', e.target.value)} />
          <TextField
            label="Descripción"
            fullWidth multiline minRows={3}
            value={form.description}
            onChange={e => handleChange('description', e.target.value)}
          />

          <TextField label="Ubicación" fullWidth value={form.location} onChange={e => handleChange('location', e.target.value)} />
          <TextField label="Teléfono" fullWidth value={form.phoneNumber} onChange={e => handleChange('phoneNumber', e.target.value)} />
          <TextField label="Email público (opcional)" fullWidth value={form.publicEmail} onChange={e => handleChange('publicEmail', e.target.value)} />
          <TextField label="Tipo de hotel (opcional)" fullWidth value={form.hotelType ?? ''} onChange={e => handleChange('hotelType', e.target.value)} />

          {/* Avatar + Galería */}
          <Stack spacing={1}>
            <Typography variant="subtitle2" fontWeight={700}>Foto de perfil</Typography>
            <input type="file" accept="image/*"
              onChange={(e) => {
                const f = e.target.files?.[0]; if (!f) return;
                const reader = new FileReader();
                reader.onload = ev => onAvatarSelected(String(ev.target?.result));
                reader.readAsDataURL(f);
              }}
            />
            {form.avatarUrl && (
              <Card variant="outlined"><CardMedia component="img" image={form.avatarUrl} height={160} /></Card>
            )}
          </Stack>

          <Stack spacing={1}>
            <Typography variant="subtitle2" fontWeight={700}>Fotos (galería)</Typography>
            <input type="file" accept="image/*" multiple
              onChange={(e) => {
                const files = Array.from(e.target.files ?? []);
                files.forEach(f => {
                  const reader = new FileReader();
                  reader.onload = ev => onAddPhoto(String(ev.target?.result));
                  reader.readAsDataURL(f);
                });
              }}
            />
            <Grid container spacing={2}>
              {form.uploadingPhotos.map((p, i) => (
                <Grid item xs={6} key={i}>
                  <Card variant="outlined">
                    <CardMedia component="img" image={p} height={120} />
                    <Box sx={{ p: 1, textAlign: 'right' }}>
                      <Button size="small" onClick={() => onRemovePhotoAt(i)}>Quitar</Button>
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Stack>
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" onClick={onSave}>Guardar</Button>
      </DialogActions>
    </Dialog>
  );
}
