/* eslint-disable @typescript-eslint/no-explicit-any */
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
  Stack,
  TextField,
  Typography,
  Card,
  CardMedia,
  Chip, Autocomplete,
} from '@mui/material'
import Grid from '@mui/material/Grid'
import ImageUploader from '../ui/ImageUploader'
import { useAuth } from '../../hooks/useAuth'
import { usePostValidation } from '../../hooks/usePostValidation'
import { createBusinessPublication } from '../../services/businessPublications'
import { validateFile } from './utils/imageHelpers'
import { dataURLtoFile } from '../../components/GeneralHelpers';
import type {
  BusinessPost,
  BusinessPublicationRequestDTO,
  FormState,
} from '../../types/Business'
import { initialFormState, DEFAULT_OPENING_DAYS } from '../../types/Business'
import { parseHours } from '../GeneralHelpers'
import { useSnackbar } from 'notistack';

// ---------------------- Props ----------------------
type NewPostDialogProps = {
  open: boolean
  onClose: () => void
  onCreated: () => void
}


// --- poné esto arriba del componente (fuera del return) ---
const TAG_OPTIONS = [
  "Apto para niños",
  "Aventura",
  "Cerca del centro",
  "Cultural",
  "Deportes",
  "Desayuno incluido",
  "Económico",
  "Familiar",
  "Gastronómico",
  "Ideal para grupos",
  "Lujo",
  "Naturaleza",
  "Negocios",
  "Pet-friendly",
  "Relax",
  "Romántico",
  "Spa",
  "Vida nocturna",
  "Vista al mar",
  "Otros:",
];

export const DAYS: { label: string; value: typeof DEFAULT_OPENING_DAYS[number] }[] = [
  { label: "Lunes",      value: "MONDAY" },
  { label: "Martes",     value: "TUESDAY" },
  { label: "Miércoles",  value: "WEDNESDAY" },
  { label: "Jueves",     value: "THURSDAY" },
  { label: "Viernes",    value: "FRIDAY" },
  { label: "Sábado",     value: "SATURDAY" },
  { label: "Domingo",    value: "SUNDAY" },
] as const satisfies Array<{ label: string; value: typeof DEFAULT_OPENING_DAYS[number] }>;



// ---------------------- Componente ----------------------
export function NewPostDialog({ open, onClose, onCreated }: NewPostDialogProps) {
  const { accessToken } = useAuth()
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
        openingDays: form.openingDays.length > 0 ? form.openingDays : DEFAULT_OPENING_DAYS,
        attentionSchedule: parseHours(form.hours),
        exceptionalClosingDays: [],
        tags: form.tags.length > 0 ? form.tags : ["Otros:"],
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
        id: response.id || crypto.randomUUID(),
        title: response.title,
        // type: form.type as BusinessType,
        description: response.description,
        hours: `${response.attentionSchedule.openingTime}–${response.attentionSchedule.closingTime}`,
        contact: response.phoneNumber,
        location: response.location,
        photos: response.imageUrls ?? [],
        createdAt: response.createdAt,
        tags: response.tags,
        openingDays: response.openingDays,
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
            {/* Título (obligatorio) */}
            <TextField
              label="Título"
              value={form.title}
              onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
              onBlur={() => setTouched((prev) => ({ ...prev, title: true }))}
              error={hasError('title')}
              helperText={helper('title')}
              required
            />

            {/* Descripción (obligatorio) */}
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

            {/* Tags (multiple + freeSolo) */}
            <Autocomplete
              multiple
              freeSolo
              options={TAG_OPTIONS}
              value={form.tags}
              onChange={(_, newValue) => setForm((prev) => ({ ...prev, tags: newValue }))}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip variant="outlined" label={option} {...getTagProps({ index })} key={`${option}-${index}`} />
                ))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Etiquetas (tags)"
                  placeholder="Ej: Familiar, Romántico, Pet-friendly…"
                />
              )}
            />

            {/* Días de apertura (opcional: si no elige, usás tu default en el DTO) */}

            <FormControl component="fieldset">
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
                Días disponibles (opcional)
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {DAYS.map((d) => {
                  const selected = form.openingDays.includes(d.value);
                  return (
                    <Chip
                      key={d.value}
                      label={d.label}
                      color={selected ? "primary" : "default"}
                      variant={selected ? "filled" : "outlined"}
                      onClick={() =>
                        setForm((prev) => ({
                          ...prev,
                          openingDays: selected
                            ? prev.openingDays.filter((x) => x !== d.value)
                            : [...prev.openingDays, d.value],
                        }))
                      }
                    />
                  );
                })}
              </Box>
            </FormControl>

            {/* Horario y Contacto (ambos opcionales) */}
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Horario de atención (opcional)"
                  placeholder="Ej: 09:00–18:00"
                  value={form.hours}
                  onChange={(e) => setForm((prev) => ({ ...prev, hours: e.target.value }))}
                  onBlur={() => setTouched((prev) => ({ ...prev, hours: true }))}
                  error={hasError('hours')}
                  helperText={helper('hours')}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label="Información de contacto (opcional)"
                  placeholder="Teléfono o email"
                  value={form.contact}
                  onChange={(e) => setForm((prev) => ({ ...prev, contact: e.target.value }))}
                  onBlur={() => setTouched((prev) => ({ ...prev, contact: true }))}
                  error={hasError('contact')}
                  helperText={helper('contact')}
                />
              </Grid>
            </Grid>
                
            {/* Ubicación (opcional) */}
            <TextField
              label="Ubicación (opcional)"
              placeholder="Ciudad, provincia / Dirección"
              value={form.location}
              onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))}
              onBlur={() => setTouched((prev) => ({ ...prev, location: true }))}
              error={hasError('location')}
              helperText={helper('location')}
            />

              </Stack>
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
                {form.photos.length < 6 && (
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
