import { useMemo, useState, useEffect, useRef } from 'react'
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
  Card,
  CardMedia,
} from '@mui/material'
import Grid from '@mui/material/Grid2'
import ImageUploader from '../ui/ImageUploader'
import { useAuth } from '../../hooks/useAuth'
import { usePostValidation } from '../../hooks/usePostValidation'
import { createBusinessPublication } from '../../services/businessPublications'
import { dataURLtoFile, validateFile } from './utils/imageHelpers'
import type {
  BusinessType,
  BusinessPost,
  BusinessPublicationRequestDTO,
  FormState,
} from '../../types/business'
import { initialFormState, DEFAULT_OPENING_DAYS } from '../../types/business'
import { type AttentionSchedule } from '../../types/business'
import { useSnackbar } from 'notistack';

// ---------------------- Props ----------------------
type NewPostDialogProps = {
  open: boolean
  onClose: () => void
  onCreated: () => void
}


// ---------------------- Utils ----------------------

/**
 * Parsea string de horario "09:00–18:00" o "09:00-18:00" a AttentionSchedule
 */
export function parseHours(scheduleString: string): AttentionSchedule {
  const match = scheduleString.match(/([01]?\d|2[0-3]):[0-5]\d\s*[–-]\s*([01]?\d|2[0-3]):[0-5]\d/)
  if (!match) {
    // Fallback por defecto
    return { openingTime: '09:00', closingTime: '18:00' }
  }
  const [opening, closing] = match[0].split(/[–-]/).map((x) => x.trim())
  return { openingTime: opening, closingTime: closing }
}

// ---------------------- Componente ----------------------
export function NewPostDialog({ open, onClose, onCreated }: NewPostDialogProps) {
  const { token: accessToken } = useAuth()
  const [form, setForm] = useState<FormState>(initialFormState)
  const [submitting, setSubmitting] = useState(false)
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const { enqueueSnackbar } = useSnackbar();

  const validate = usePostValidation()
  const errors = useMemo(() => validate(form), [form, validate])
  const mountedRef = useRef(false)

  // Track mounting state para prevenir memory leaks
  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  // Limpiar validación al abrir el diálogo
  useEffect(() => {
    if (open) setTouched({})
  }, [open])

  // ---------------------- Helpers ----------------------
  const hasError = (key: keyof FormState) => Boolean(touched[key] && errors[key])
  const helper = (key: keyof FormState) => (touched[key] ? errors[key] : '')

  const addPhoto = (base64: string) => {
    setForm((prev) => ({ ...prev, photos: [...prev.photos, base64] }))
  }

  const removePhotoAt = (index: number) => {
    setForm((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index),
    }))
  }

  const handleClose = () => {
    setForm(initialFormState)
    setTouched({})
    onClose()
  }

  // ---------------------- Submit ----------------------
  const onSubmit = async () => {
    // Marcar todos los campos como tocados
    setTouched({
      title: true,
      type: true,
      description: true,
      hours: true,
      contact: true,
      location: true,
    })

    // Validar
    if (Object.keys(errors).length > 0) {
      enqueueSnackbar('Completá correctamente los campos.', { variant: 'error' });
      return
    }

    setSubmitting(true)
    try {
      // Armar DTO para el backend
      const dto: BusinessPublicationRequestDTO = {
        title: form.title.trim(),
        description: form.description.trim(),
        phoneNumber: form.contact.trim(),
        email: '', // Agregar campo si lo necesitas
        location: form.location.trim(),
        openingDays: DEFAULT_OPENING_DAYS,
        attentionSchedule: parseHours(form.hours),
        exceptionalClosingDays: [],
        tags: []
      }

      // Convertir base64 a Files
      const files: File[] = form.photos.map((photo, i) =>
        dataURLtoFile(photo, `photo_${i + 1}.jpg`)
      )

      // Validar tamaño/tipo de archivos
      files.forEach(validateFile)

      // Llamada al backend
      const response = await createBusinessPublication(dto, files, accessToken)

      // Si el componente fue desmontado, salir
      if (!mountedRef.current) return

      // Crear objeto de publicación (para uso interno si lo necesitas)
      const savedPost: BusinessPost = {
        id: crypto.randomUUID(),
        title: response.title,
        type: form.type as BusinessType,
        description: response.description,
        hours: `${response.attentionSchedule.openingTime}–${response.attentionSchedule.closingTime}`,
        contact: response.phoneNumber,
        location: response.location,
        photos: response.imageUrls ?? [],
        createdAt: response.createdAt,

      }

      console.log('Publicación creada:', savedPost)

      // Notificar éxito
      if (mountedRef.current) {
        enqueueSnackbar('¡Publicación creada!', { variant: 'success' });
        onCreated()
        handleClose()
      }
    } catch (error: any) {
      console.error('Error al crear publicación:', error)
      enqueueSnackbar('Error al publicar. Intentá nuevamente.', { variant: 'error' });
      
    } finally {
      if (mountedRef.current) {
        setSubmitting(false)
      }
    }
  }

  // ---------------------- Render ----------------------
  return (
    <>
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
        <DialogTitle>Nueva publicación de negocio</DialogTitle>

        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            {/* Título */}
            <TextField
              label="Título"
              value={form.title}
              onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
              onBlur={() => setTouched((prev) => ({ ...prev, title: true }))}
              error={hasError('title')}
              helperText={helper('title')}
              required
            />

            {/* Tipo */}
            <FormControl error={hasError('type')} required>
              <InputLabel id="bp-type">Tipo de publicación</InputLabel>
              <Select
                labelId="bp-type"
                label="Tipo de publicación"
                value={form.type}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, type: e.target.value as BusinessType }))
                }
                onBlur={() => setTouched((prev) => ({ ...prev, type: true }))}
              >
                <MenuItem value="alojamiento">Alojamiento</MenuItem>
                <MenuItem value="servicio">Servicio</MenuItem>
              </Select>
              <FormHelperText>{helper('type')}</FormHelperText>
            </FormControl>

            {/* Descripción */}
            <TextField
              label="Descripción / Detalles"
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              onBlur={() => setTouched((prev) => ({ ...prev, description: true }))}
              error={hasError('description')}
              helperText={helper('description')}
              multiline
              minRows={4}
              required
            />

            {/* Horario y Contacto */}
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label="Horario de atención"
                  placeholder="Ej: 09:00–18:00"
                  value={form.hours}
                  onChange={(e) => setForm((prev) => ({ ...prev, hours: e.target.value }))}
                  onBlur={() => setTouched((prev) => ({ ...prev, hours: true }))}
                  error={hasError('hours')}
                  helperText={helper('hours')}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label="Información de contacto"
                  placeholder="Teléfono o email"
                  value={form.contact}
                  onChange={(e) => setForm((prev) => ({ ...prev, contact: e.target.value }))}
                  onBlur={() => setTouched((prev) => ({ ...prev, contact: true }))}
                  error={hasError('contact')}
                  helperText={helper('contact')}
                  required
                />
              </Grid>
            </Grid>

            {/* Ubicación */}
            <TextField
              label="Ubicación"
              placeholder="Ciudad, provincia / Dirección"
              value={form.location}
              onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))}
              onBlur={() => setTouched((prev) => ({ ...prev, location: true }))}
              error={hasError('location')}
              helperText={helper('location')}
              required
            />

            <Divider />

            {/* Fotos */}
            <Stack spacing={1}>
              <Typography variant="subtitle1" fontWeight={700}>
                Fotos (opcional)
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Hasta 6 imágenes. Formato: JPG/PNG/WebP.
              </Typography>

              <Grid container spacing={2}>
                {form.photos.map((photo, i) => (
                  <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}>
                    <Card variant="outlined">
                      <CardMedia component="img" image={photo} height={160} />
                      <Box
                        sx={{
                          px: 1,
                          py: 1,
                          display: 'flex',
                          gap: 1,
                          justifyContent: 'flex-end',
                        }}
                      >
                        <Button size="small" onClick={() => removePhotoAt(i)}>
                          Quitar
                        </Button>
                      </Box>
                    </Card>
                  </Grid>
                ))}
                {form.photos.length < 6 && (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
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
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} disabled={submitting}>
            Cancelar
          </Button>
          <Button variant="contained" onClick={onSubmit} disabled={submitting}>
            {submitting ? 'Publicando...' : 'Publicar'}
          </Button>
        </DialogActions>
      </Dialog>

    </>
  )
}
