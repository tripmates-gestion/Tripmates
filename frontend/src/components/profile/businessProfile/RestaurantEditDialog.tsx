import * as React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Stack, Typography, Chip, Grid, Card, CardMedia, Box, TextField, MenuItem,
  Backdrop, CircularProgress
} from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import { useAuth } from '../../../hooks/useAuth';
import { useBusinessProfile } from '../../../hooks/useBusinessProfile';
import { BUSINESS_TYPES } from '../../../constants/Rol';
import { parseHours, dataURLtoFile } from './Utils';
import { updateBusinessUser } from '../../../services/userService';
import ImageUploader from '../../ui/ImageUploader';

export type RestaurantTypes = 'CAFE'|'VEGANO'|'VEGETARIANO'|'PERUANO'|'ARGENTINO'|'ITALIANO';
const RESTAURANT_TYPE_OPTIONS: RestaurantTypes[] = [
  'CAFE','VEGANO','VEGETARIANO','PERUANO','ARGENTINO','ITALIANO'
];

type Props = { open: boolean; onClose: () => void };
const PRICE_OPTIONS = ['$', '$$', '$$$'] as const;

type TimeLike = string | { hour?: number; minute?: number | null } | null | undefined;

function parseTimeLike(t: TimeLike): { h: number; m: number } | null {
  if (!t) return null;
  if (typeof t === 'string') {
    const m = t.match(/^(\d{1,2}):(\d{2})$/);
    if (!m) return null;
    return { h: Number(m[1]), m: Number(m[2]) };
  }
  if (typeof t === 'object') {
    return { h: Number(t.hour ?? 0), m: Number(t.minute ?? 0) };
  }
  return null;
}

function formatScheduleForInput(att?: { openingTime?: TimeLike; closingTime?: TimeLike }) {
  if (!att) return '';
  const o = parseTimeLike(att.openingTime);
  const c = parseTimeLike(att.closingTime);
  if (!o || !c) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(o.h)}:${pad(o.m)}–${pad(c.h)}:${pad(c.m)}`;
}

type RestaurantFormState = {
  name: string;
  description: string;
  openingDays: string[];
  openingHours: string;
  location: string;
  phoneNumber: string;
  publicEmail: string;
  averagePrice?: '$' | '$$' | '$$$';
  restaurantType?: RestaurantTypes;
  avatarUrl?: string;
  avatar?: string | null;
  existingPhotos: string[];
  uploadingPhotos: string[];
};

export default function RestaurantEditDialog({ open, onClose }: Props) {
  const { accessToken, updateUser, user } = useAuth();
  const { business, refreshProfile } = useBusinessProfile();

  if (!business || business.businessType !== BUSINESS_TYPES.restaurant) return null;

  const initialExisting = business.profileImageUrls && business.profileImageUrls.length > 0
    ? business.profileImageUrls
    // @ts-ignore si tu user context expone algo similar
    : (user?.profileImageUrls ?? []);

  const initial: RestaurantFormState = {
    name: business.name ?? '',
    description: business.description ?? '',
    openingDays: business.openingDays ?? [],
    openingHours: formatScheduleForInput(business.attentionSchedule as any),
    location: business.location ?? '',
    phoneNumber: business.phoneNumber ?? '',
    publicEmail: business.publicEmail ?? '',
    averagePrice: business.averagePrice ?? undefined,
    restaurantType: (business.restaurantType as RestaurantTypes) ?? undefined,
    avatarUrl: business.avatarURL ?? '',
    avatar: null,
    existingPhotos: initialExisting,
    uploadingPhotos: [],
  };

  const [form, setForm] = React.useState<RestaurantFormState>(initial);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => { if (open) setForm(initial); }, [open]);

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

  const onAvatarSelected = (dataUrl: string) =>
    setForm(prev => ({ ...prev, avatar: dataUrl, avatarUrl: dataUrl }));

  const onAddPhoto = (dataUrl: string) =>
    setForm(prev => ({ ...prev, uploadingPhotos: [...prev.uploadingPhotos, dataUrl] }));

  const onRemoveNewPhotoAt = (i: number) =>
    setForm(prev => ({ ...prev, uploadingPhotos: prev.uploadingPhotos.filter((_, idx) => idx !== i) }));

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
    if (!accessToken || saving) return;
    try {
      setSaving(true);

      const dto = {
        name: form.name.trim(),
        description: form.description,
        openingDays: form.openingDays,
        attentionSchedule: parseHours(form.openingHours),
        location: form.location.trim(),
        phoneNumber: form.phoneNumber.trim(),
        publicEmail: form.publicEmail.trim() || undefined,
        averagePrice: form.averagePrice,
        restaurantType: form.restaurantType || undefined,
      };

      const avatarFile = form.avatar ? dataURLtoFile(form.avatar, 'avatar.jpg') : null;
      const galleryFiles = form.uploadingPhotos.map((p, i) => dataURLtoFile(p, `photo_${i + 1}.jpg`));

      await updateBusinessUser(dto as any, avatarFile, galleryFiles, accessToken);
      await refreshProfile();

      updateUser(dto.name, dto.description ?? null, form.avatar ? form.avatarUrl ?? null : null);

      enqueueSnackbar('¡Los cambios se guardaron correctamente!', { variant: 'success' });
      onClose();
    } catch (err: any) {
      enqueueSnackbar(err?.message || 'Error al guardar los cambios.', { variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Backdrop open={saving} sx={{ color: '#fff', zIndex: (t) => t.zIndex.drawer + 1 }}>
        <CircularProgress />
      </Backdrop>

      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>Editar restaurante</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField label="Nombre" fullWidth value={form.name} onChange={e => handleChange('name', e.target.value)} disabled={saving} />
            <TextField
              label="Descripción"
              fullWidth multiline minRows={3}
              value={form.description}
              onChange={e => handleChange('description', e.target.value)}
              disabled={saving}
            />

            <TextField
              label="Horario (HH:mm-HH:mm)"
              placeholder="09:00-18:00"
              fullWidth
              value={form.openingHours}
              onChange={e => handleChange('openingHours', e.target.value)}
              disabled={saving}
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
                      onClick={() => !saving && toggleDay(d.value)}
                      sx={{ mb: 1 }}
                    />
                  );
                })}
              </Stack>
            </Stack>

            <TextField label="Ubicación" fullWidth value={form.location} onChange={e => handleChange('location', e.target.value)} disabled={saving} />
            <TextField label="Teléfono" fullWidth value={form.phoneNumber} onChange={e => handleChange('phoneNumber', e.target.value)} disabled={saving} />
            <TextField label="Email público (opcional)" fullWidth value={form.publicEmail} onChange={e => handleChange('publicEmail', e.target.value)} disabled={saving} />

            <TextField
              label="Rango de precio"
              select
              fullWidth
              value={form.averagePrice ?? ''}
              onChange={(e) => handleChange('averagePrice', e.target.value as RestaurantFormState['averagePrice'])}
              disabled={saving}
            >
              <MenuItem value="">—</MenuItem>
              {PRICE_OPTIONS.map(p => <MenuItem value={p} key={p}>{p}</MenuItem>)}
            </TextField>

            <TextField
              label="Tipo de restaurante"
              select
              fullWidth
              value={form.restaurantType ?? ''}
              onChange={(e) => handleChange('restaurantType', e.target.value as RestaurantTypes)}
              disabled={saving}
            >
              <MenuItem value="">—</MenuItem>
              {RESTAURANT_TYPE_OPTIONS.map(t => (
                <MenuItem key={t} value={t}>{t}</MenuItem>
              ))}
            </TextField>

            <ImageUploader
              label="Foto de perfil"
              imageUrl={form.avatarUrl}
              onChange={(base64) => onAvatarSelected(base64)}
              variant="circular"
            />

            <Stack spacing={1}>
              <Typography variant="subtitle2" fontWeight={700}>Fotos (galería)</Typography>

              {form.existingPhotos.length > 0 && (
                <Grid container spacing={2} sx={{ mb: 0.5 }}>
                  {form.existingPhotos.map((url, i) => (
                    <Grid item xs={6} key={`exist-${i}`}>
                      <Card variant="outlined">
                        <CardMedia component="img" image={url} height={120} sx={{ objectFit: 'cover' }} />
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}

              <ImageUploader
                label="Agregar foto a la galería"
                onChange={(base64) => onAddPhoto(base64)}
                variant="rectangular"
              />

              <Grid container spacing={2}>
                {form.uploadingPhotos.map((p, i) => (
                  <Grid item xs={6} key={`new-${i}`}>
                    <Card variant="outlined">
                      <CardMedia component="img" image={p} height={120} sx={{ objectFit: 'cover' }} />
                      <Box sx={{ p: 1, textAlign: 'right' }}>
                        <Button size="small" onClick={() => onRemoveNewPhotoAt(i)}>Quitar</Button>
                      </Box>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Stack>
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose} disabled={saving}>Cancelar</Button>
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
