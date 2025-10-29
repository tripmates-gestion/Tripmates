/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from 'react';
import {
    Box,
    Card,
    CardMedia,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Stack,
    Typography,
    Grid,
} from '@mui/material';
import { PROFILE_LIMITS } from '../../../constants/UserProfile';
import CountedTextField from '../../ui/CountedTextField';
import ImageUploader from '../../ui/ImageUploader';
import type { CompleteBusinessProfile ,UpdateProfileFormState} from '../../../types/business';
import { useSnackbar } from 'notistack';
import { useUpdateBusinessUserValidation } from '../../../hooks/useUpdateBusinessUserValidation';
import { mapDayToSpanish } from '../../../types/business';
// ---------------------- Props ----------------------
type Props = {
  open: boolean;
  onClose: () => void;
  completeProfile: CompleteBusinessProfile;
  onSave: (updatedForm: UpdateProfileFormState) => Promise<void> | void;
};

// ---------------------- Mapeo inicial ----------------------
function mapCompleteProfileToFormState(
  completeProfile: CompleteBusinessProfile
): UpdateProfileFormState {
  return {
    name: completeProfile.name ?? '',
    description: completeProfile.description ?? '',
    openningDays: completeProfile.openningDays.map(mapDayToSpanish).join(', '),
    openingHours: completeProfile.openingHours
      ? `${completeProfile.openingHours.openingTime}–${completeProfile.openingHours.closingTime}`
      : '',
    location: completeProfile.location ?? '',
    phone: completeProfile.phone ?? '',
    avatarUrl: completeProfile.avatarUrl ?? '',
    uploadingPhotos: [],
  };
}

// ---------------------- Componente principal ----------------------
export default function ComplementBusinessProfileDialog({
  open,
  onClose,
  completeProfile,
  onSave,
}: Props) {
  const initialFormState = React.useMemo(
    () => mapCompleteProfileToFormState(completeProfile),
    [completeProfile]
  );

  const [form, setForm] = React.useState<UpdateProfileFormState>(initialFormState);
  const [touched, setTouched] = React.useState<Record<string, boolean>>({});
  const [saving, setSaving] = React.useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const validate = useUpdateBusinessUserValidation();
  const errors = React.useMemo(() => validate(form), [form, validate]);
  const mountedRef = React.useRef(false);

  // ---------------------- Efectos ----------------------
  React.useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  React.useEffect(() => {
    if (open) {
      setForm(mapCompleteProfileToFormState(completeProfile));
      setTouched({});
    }
  }, [open, completeProfile]);

  // ---------------------- Helpers ----------------------
  const hasError = (key: keyof UpdateProfileFormState) =>
    Boolean(touched[key] && errors[key]);
  const helper = (key: keyof UpdateProfileFormState) =>
    touched[key] ? errors[key] : '';

  const addPhoto = (base64: string) => {
    setForm((prev) => ({ ...prev, uploadingPhotos: [...prev.uploadingPhotos, base64] }))
  }

  const removePhotoAt = (index: number) => {
    setForm((prev) => ({ ...prev, uploadingPhotos: prev.uploadingPhotos.filter((_, i) => i !== index) }))
  }

  const handleChange = (key: keyof UpdateProfileFormState, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleBlur = (key: keyof UpdateProfileFormState) => {
    setTouched((prev) => ({ ...prev, [key]: true }));
  };

  const handleClose = () => {
    setForm(initialFormState);
    setTouched({});
    onClose();
  };

  const handleSave = async () => {
    // Marcar campos relevantes como tocados
    setTouched({
      name: true,
      description: true,
      openningDays: true,
      openingHours: true,
      location: true,
      phone: true,
    });

    if (Object.keys(errors).length > 0) {
      enqueueSnackbar('Completá correctamente los campos.', { variant: 'error' });
      return;
    }
    
    try {
      setSaving(true);

      await onSave(form);
      enqueueSnackbar('Perfil actualizado correctamente.', { variant: 'success' });
      handleClose();
      
    } catch (error: any) {
      console.error('Error al actualizar perfil:', error);
      enqueueSnackbar('Error al guardar cambios. Intentá nuevamente.', { variant: 'error' });
    } finally {
      if (mountedRef.current) setSaving(false);
    }
  };

  // ---------------------- Render ----------------------
  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Información de tu negocio</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={3} sx={{ mt: 1 }}>
          <CountedTextField
            label="Nombre de tu negocio"
            value={form.name}
            onChange={(v) => handleChange('name', v)}
            onBlur={() => handleBlur('name')}
            error={hasError('name')}
            helperText={helper('name')}
            maxLength={PROFILE_LIMITS.name}
            fullWidth
          />

          <CountedTextField
            label="Descripción del negocio"
            value={form.description}
            onChange={(v) => handleChange('description', v)}
            onBlur={() => handleBlur('description')}
            error={hasError('description')}
            helperText={helper('description')}
            maxLength={PROFILE_LIMITS.description}
            fullWidth
            multiline
            minRows={3}
          />

          <CountedTextField
            label="Días de apertura"
            placeholder="Ej: Lunes, Martes, Viernes"
            value={form.openningDays}
            onChange={(v) => handleChange('openningDays', v)}
            onBlur={() => handleBlur('openningDays')}
            error={hasError('openningDays')}
            helperText={helper('openningDays')}
            fullWidth
            maxLength={PROFILE_LIMITS.openningDays}
          />

          <CountedTextField
            label="Horario de atención"
            placeholder="Ej: 09:00–18:00"
            value={form.openingHours}
            onChange={(v) => handleChange('openingHours', v)}
            onBlur={() => handleBlur('openingHours')}
            error={hasError('openingHours')}
            helperText={helper('openingHours')}
            fullWidth
            maxLength={PROFILE_LIMITS.openingHours}
          />

          <CountedTextField
            label="Ubicación"
            value={form.location}
            onChange={(v) => handleChange('location', v)}
            onBlur={() => handleBlur('location')}
            error={hasError('location')}
            helperText={helper('location')}
            fullWidth
            maxLength={PROFILE_LIMITS.location}
          />

          <CountedTextField
            label="Teléfono de contacto"
            value={form.phone}
            onChange={(v) => handleChange('phone', v)}
            onBlur={() => handleBlur('phone')}
            error={hasError('phone')}
            helperText={helper('phone')}
            fullWidth
            maxLength={PROFILE_LIMITS.phone}
          />

          <Typography variant="subtitle1" fontWeight={700}>
            Imagen del negocio
          </Typography>

          <ImageUploader
            label="Foto de perfil"
            imageUrl={form.avatarUrl}
            variant="circular"
            onChange={(img) => {
              // img es dataURL (base64)
              handleChange('avatar', img);      // para subir
              handleChange('avatarUrl', img);   // para preview inmediato
            }}
          />
        </Stack>
        {/* Fotos */}
        <Stack spacing={1}>
              <Typography variant="subtitle1" fontWeight={700}>
                Fotos (opcional)
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Hasta 6 imágenes. Formato: JPG/PNG/WebP.
              </Typography>

              <Grid container spacing={2}>
                {form.uploadingPhotos.map((photo, i) => (
                  <Grid item key={i} xs={12} sm={6} md={4}>
                    <Card variant="outlined">
                      <CardMedia component="img" image={photo} height={160} />
                      <Box sx={{ px: 1, py: 1, display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                        <Button size="small" onClick={() => removePhotoAt(i)}>
                          Quitar
                        </Button>
                      </Box>
                    </Card>
                  </Grid>
                ))}
                {form.uploadingPhotos.length < 6 && (
                  <Grid item xs={12} md={6}>
                    <Box sx={{ p: 1 }}>
                      <ImageUploader
                        label="Agregar imagen"
                        onChange={addPhoto}
                        variant="rectangular"
                      />
                    </Box>
                  </Grid>
                )}
              </Grid>
            </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={saving}>
          Cancelar
        </Button>
        <Button variant="contained" onClick={handleSave} disabled={saving}>
          {saving ? 'Guardando...' : 'Guardar cambios'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
