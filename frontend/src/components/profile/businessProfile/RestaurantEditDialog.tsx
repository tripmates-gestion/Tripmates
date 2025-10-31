import * as React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Stack, Typography, Chip, Grid, Card, CardMedia, Box, TextField, MenuItem
} from '@mui/material';
import { useAuth } from '../../../hooks/useAuth';
import { useBusinessProfile } from '../../../hooks/useBusinessProfile';
import { BUSINESS_TYPES } from '../../../constants/Rol';
import { parseHours, dataURLtoFile } from './Utils';
import { updateBusinessUser } from '../../../services/userService';

type Props = { open: boolean; onClose: () => void };

const PRICE_OPTIONS = ['$', '$$', '$$$'] as const;

// Estado del formulario
type RestaurantFormState = {
  name: string;
  description: string;
  openingDays: string[];         // ["MONDAY", ...]
  openingHours: string;          // "09:00–18:00"
  location: string;
  phoneNumber: string;
  publicEmail: string;
  averagePrice?: '$' | '$$' | '$$$';
  restaurantType?: string;

  avatarUrl?: string;            // preview
  avatar?: string | null;        // base64 para envío
  uploadingPhotos: string[];     // base64 para galería
};

export default function RestaurantEditDialog({ open, onClose }: Props) {
  const { accessToken, updateUser } = useAuth();
  const { business, refreshProfile } = useBusinessProfile();

  // Guard: solo para restaurantes
  if (!business || business.businessType !== BUSINESS_TYPES.restaurant) return null;

  const initial: RestaurantFormState = {
    name: business.name ?? '',
    description: business.description ?? '',
    openingDays: business.openingDays ?? [],
    openingHours: business.attentionSchedule
      ? `${String(business.attentionSchedule.openingTime?.hour ?? 9).padStart(2,'0')}:${String(business.attentionSchedule.openingTime?.minute ?? 0).padStart(2,'0')}` +
        '–' +
        `${String(business.attentionSchedule.closingTime?.hour ?? 18).padStart(2,'0')}:${String(business.attentionSchedule.closingTime?.minute ?? 0).padStart(2,'0')}`
      : '',
    location: business.location ?? '',
    phoneNumber: business.phoneNumber ?? '',
    publicEmail: business.publicEmail ?? '',
    averagePrice: business.averagePrice ?? undefined,
    restaurantType: business.restaurantType ?? '',
    avatarUrl: business.avatarURL ?? '',
    avatar: null,
    uploadingPhotos: [],
  };

  const [form, setForm] = React.useState<RestaurantFormState>(initial);
  React.useEffect(() => { if (open) setForm(initial); /* reset al abrir */ }, [open]);

  const handleChange = (k: keyof RestaurantFormState, v: any) =>
    setForm(prev => ({ ...prev, [k]: v }));

  const toggleDay = (value: string) => {
    setForm(prev => ({
      ...prev,
      openingDays: prev.openingDays.includes(value)
        ? prev.openingDays.filter(d => d !== value)
        : [...prev.openingDays, value],
    }));
  };

  const onAvatarSelected = (dataUrl: string) => {
    setForm(prev => ({ ...prev, avatar: dataUrl, avatarUrl: dataUrl }));
  };

  const onAddPhoto = (dataUrl: string) => {
    setForm(prev => ({ ...prev, uploadingPhotos: [...prev.uploadingPhotos, dataUrl] }));
  };

  const onRemovePhotoAt = (i: number) => {
    setForm(prev => ({ ...prev, uploadingPhotos: prev.uploadingPhotos.filter((_, idx) => idx !== i) }));
  };

  const DAYS = [
    { value: 'MONDAY', label: 'Lun' },
    { value: 'TUESDAY', label: 'Mar' },
    { value: 'WEDNESDAY', label: 'Mié' },
    { value: 'THURSDAY', label: 'Jue' },
    { value: 'FRIDAY', label: 'Vie' },
    { value: 'SATURDAY', label: 'Sáb' },
    { value: 'SUNDAY', label: 'Dom' },
  ];

  const onSave = async () => {
    if (!accessToken) return;

    const dto = {
      // comunes
      name: form.name.trim(),
      description: form.description,
      openingDays: form.openingDays,
      attentionSchedule: parseHours(form.openingHours),
      location: form.location.trim(),
      phoneNumber: form.phoneNumber.trim(),
      publicEmail: form.publicEmail.trim() || undefined,

      // específicos restaurante
      averagePrice: form.averagePrice,
      restaurantType: form.restaurantType?.trim() || undefined,
    };

    const avatarFile = form.avatar ? dataURLtoFile(form.avatar, 'avatar.jpg') : null;
    const galleryFiles = form.uploadingPhotos.map((p, i) => dataURLtoFile(p, `photo_${i + 1}.jpg`));

    await updateBusinessUser(dto as any, avatarFile, galleryFiles, accessToken);
    await refreshProfile();

    // mantener Auth minimal al día (navbar, etc.)
    updateUser(dto.name, dto.description ?? null, form.avatar ? form.avatarUrl ?? null : null);

    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Editar restaurante</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={3} sx={{ mt: 1 }}>
          <TextField label="Nombre" fullWidth value={form.name} onChange={e => handleChange('name', e.target.value)} />
          <TextField
            label="Descripción"
            fullWidth multiline minRows={3}
            value={form.description}
            onChange={e => handleChange('description', e.target.value)}
          />

          <TextField
            label="Horario (HH:mm–HH:mm)"
            placeholder="09:00–18:00"
            fullWidth
            value={form.openingHours}
            onChange={e => handleChange('openingHours', e.target.value)}
          />

          <Stack spacing={1}>
            <Typography variant="subtitle2" fontWeight={700}>Días de atención</Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {DAYS.map(d => {
                const selected = form.openingDays.includes(d.value);
                return (
                  <Chip
                    key={d.value}
                    label={d.label}
                    color={selected ? 'primary' : 'default'}
                    variant={selected ? 'filled' : 'outlined'}
                    onClick={() => toggleDay(d.value)}
                    sx={{ mb: 1 }}
                  />
                );
              })}
            </Stack>
          </Stack>

          <TextField label="Ubicación" fullWidth value={form.location} onChange={e => handleChange('location', e.target.value)} />
          <TextField label="Teléfono" fullWidth value={form.phoneNumber} onChange={e => handleChange('phoneNumber', e.target.value)} />
          <TextField label="Email público (opcional)" fullWidth value={form.publicEmail} onChange={e => handleChange('publicEmail', e.target.value)} />

          <TextField
            label="Rango de precio"
            select
            fullWidth
            value={form.averagePrice ?? ''}
            onChange={(e) => handleChange('averagePrice', e.target.value as RestaurantFormState['averagePrice'])}
          >
            <MenuItem value="">—</MenuItem>
            {PRICE_OPTIONS.map(p => <MenuItem value={p} key={p}>{p}</MenuItem>)}
          </TextField>

          <TextField label="Tipo de restaurante (opcional)" fullWidth value={form.restaurantType ?? ''} onChange={e => handleChange('restaurantType', e.target.value)} />

          {/* Avatar + Galería simple (usá tus componentes si ya los tenés) */}
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
