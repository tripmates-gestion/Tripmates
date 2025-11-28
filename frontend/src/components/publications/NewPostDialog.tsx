/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo, useState, useEffect, useRef } from 'react'
import {
  Autocomplete,
  Box,
  Button,
  Card,
  CardMedia,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import Grid from '@mui/material/Grid'
import { Search } from '@mui/icons-material'
import ImageUploader from '../ui/ImageUploader'
import OpenStreetMapPicker from '../map/OpenStreetMapPicker'
import { useAuth } from '../../hooks/useAuth'
import { usePostValidation } from '../../hooks/usePostValidation'
import { createBusinessPublication, updateBusinessPublication } from '../../services/businessPublications'
import { validateFile } from './utils/imageHelpers'
import { dataURLtoFile } from '../../components/GeneralHelpers';
import type {
  BusinessPost,
  BusinessPublicationRequestDTO,
  BusinessPublicationResponseDTO,
  PublicationUpdateRequestDTO,
  FormState,
} from '../../types/Business'
import { initialFormState, DEFAULT_OPENING_DAYS } from '../../types/Business'
import { parseHours } from '../GeneralHelpers'
import { useSnackbar } from 'notistack';
import { isValidLocation } from './utils/validators'
import { useGeocodeAddress } from '../../hooks/useGeocodeAddress'

// ---------------------- Props ----------------------
type NewPostDialogProps = {
  open: boolean
  onClose: () => void
  onCreated: () => void
  publicationToEdit?: BusinessPublicationResponseDTO | null
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
export function NewPostDialog({ open, onClose, onCreated, publicationToEdit }: NewPostDialogProps) {
  const { accessToken } = useAuth()
  const [form, setForm] = useState<FormState>(initialFormState)
  const [submitting, setSubmitting] = useState(false)
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const { enqueueSnackbar } = useSnackbar();
  const { geocodeAddress, loading: geocoding, error: geoError, setError: setGeoError } = useGeocodeAddress()
  
  // Estado para rastrear imágenes a eliminar (índices)
  const [imagesToDelete, setImagesToDelete] = useState<number[]>([])

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
  
  // Cargar datos de publicación a editar
  useEffect(() => {
    if (open && publicationToEdit) {
      const hours = publicationToEdit.attentionSchedule 
        ? `${publicationToEdit.attentionSchedule.openingTime}–${publicationToEdit.attentionSchedule.closingTime}`
        : '';
      
      setForm({
        title: publicationToEdit.title || '',
        description: publicationToEdit.description || '',
        tags: publicationToEdit.tags || [],
        openingDays: publicationToEdit.openingDays || DEFAULT_OPENING_DAYS,
        hours: hours,
        contact: publicationToEdit.phoneNumber || '',
        location: publicationToEdit.location || initialFormState.location,
        photos: publicationToEdit.imageUrls || [],
      });
      setImagesToDelete([]); // Resetear imágenes a eliminar
    } else if (open && !publicationToEdit) {
      // Si no hay publicación a editar, resetear el formulario
      setForm(initialFormState);
      setImagesToDelete([]);
    }
  }, [open, publicationToEdit]);

  // ---------------------- Helpers ----------------------
  const hasError = (key: keyof FormState) => Boolean(touched[key] && errors[key])
  const helper = (key: keyof FormState) => {
    if (!touched[key]) return ''
    if (key === 'location') {
      const locError = errors.location
      return locError?.address || locError?.latitude || locError?.longitude || ''
    }
    return errors[key as Exclude<keyof FormState, 'location'>] || ''
  }

  const addPhoto = (base64: string) => {
    setForm((prev) => ({ ...prev, photos: [...prev.photos, base64] }))
  }

  const handleSearchInMap = async () => {
    const result = await geocodeAddress(form.location.address)
    if (result) {
      setForm((prev) => ({ ...prev, location: { ...prev.location, ...result } }))
      setTouched((prev) => ({ ...prev, location: true }))
    }
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
      const isEditing = Boolean(publicationToEdit)

      // Convertir imágenes nuevas (base64) a File y validar
      const files: File[] = form.photos
        .map((photo, index) => photo.startsWith('data:') ? dataURLtoFile(photo, `photo-${index}.png`) : null)
        .filter((file): file is File => Boolean(file))

      files.forEach(validateFile)

      let response: BusinessPublicationResponseDTO

      if (isEditing && publicationToEdit) {
        const existingPhotoCount = publicationToEdit.imageUrls?.length ?? 0
        const deletePhotoIndexes = imagesToDelete
          .filter((idx) => idx < existingPhotoCount)

        const updateDto: PublicationUpdateRequestDTO = {
          title: form.title.trim() || undefined,
          description: form.description.trim() || undefined,
          phoneNumber: form.contact.trim() || undefined,
          email: undefined,
          location: isValidLocation(form.location) ? form.location : undefined,
          openingDays: form.openingDays.length ? form.openingDays : undefined,
          attentionSchedule: form.hours ? parseHours(form.hours) : undefined,
          exceptionalClosingDays: undefined,
          tags: form.tags.length ? form.tags : undefined,
          deletePhotoIndexes: deletePhotoIndexes.length ? deletePhotoIndexes : undefined,
        }

        response = await updateBusinessPublication(publicationToEdit.id, updateDto, files, accessToken)
      } else {
        const createDto: BusinessPublicationRequestDTO = {
          title: form.title.trim(),
          description: form.description.trim(),
          phoneNumber: form.contact.trim(),
          email: '',
          location: form.location,
          openingDays: form.openingDays.length > 0 ? form.openingDays : DEFAULT_OPENING_DAYS,
          attentionSchedule: parseHours(form.hours),
          exceptionalClosingDays: [],
          tags: form.tags.length > 0 ? form.tags : ['Otros:'],
        }

        response = await createBusinessPublication(createDto, files, accessToken)
      }

      if (!mountedRef.current) return

      const savedPost: BusinessPost = {
        id: response.id || crypto.randomUUID(),
        title: response.title,
        description: response.description,
        hours: `${response.attentionSchedule.openingTime}–${response.attentionSchedule.closingTime}`,
        contact: response.phoneNumber,
        location: response.location,
        photos: response.imageUrls ?? [],
        createdAt: response.createdAt,
        tags: response.tags,
        openingDays: response.openingDays,
      }

      console.log(isEditing ? 'Publicación actualizada:' : 'Publicación creada:', savedPost)

      enqueueSnackbar(
        isEditing ? '¡Publicación actualizada!' : '¡Publicación creada!',
        { variant: 'success' }
      );
      onCreated()
      handleClose()
    } catch (error: any) {
      console.error('Error al guardar publicación:', error)
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
        <DialogTitle>
          {publicationToEdit ? 'Editar publicación' : 'Nueva publicación de negocio'}
        </DialogTitle>

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

            {/* Tags (multiple + freeSolo) - Solo en modo creación */}
            {!publicationToEdit && (
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
            )}

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
                
            {/* Ubicación */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems="flex-start">
              <TextField
                label="Ubicación"
                placeholder="Ciudad, provincia / Dirección"
                value={form.location.address}
                onChange={(e) => {
                  setForm((prev) => ({ ...prev, location: { ...prev.location, address: e.target.value } }))
                  if (geoError) setGeoError(null)
                }}
                onBlur={() => setTouched((prev) => ({ ...prev, location: true }))}
                error={hasError('location') || Boolean(geoError)}
                helperText={helper('location') || geoError || 'Ej: Buenos Aires, Palermo'}
              />
              <Button
                variant="outlined"
                startIcon={<Search />}
                onClick={handleSearchInMap}
                disabled={submitting || geocoding}
                sx={{ whiteSpace: 'nowrap' }}
              >
                {geocoding ? 'Buscando...' : 'Buscar en mapa'}
              </Button>
            </Stack>
            <OpenStreetMapPicker
              location={form.location}
              onChange={(value) => {
                setForm((prev) => ({ ...prev, location: value }))
                setTouched((prev) => ({ ...prev, location: true }))
              }}
              disabled={submitting}
            />
            <Typography variant="body2" color="text.secondary">
              {Number.isFinite(form.location.latitude) && Number.isFinite(form.location.longitude) &&
                !(form.location.latitude === 0 && form.location.longitude === 0)
                ? `Coordenadas seleccionadas: ${form.location.latitude.toFixed(5)}, ${form.location.longitude.toFixed(5)}`
                : 'Elegí la ubicación en el mapa para completar latitud y longitud'}
            </Typography>

            </Stack>
            <Divider />

            {/* Fotos */}
            <Stack spacing={1}>
              <Typography variant="subtitle1" fontWeight={700}>
                Fotos {publicationToEdit ? '' : '(opcional)'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {publicationToEdit 
                  ? 'Seleccioná las imágenes que querés eliminar' 
                  : 'Hasta 6 imágenes. Formato: JPG/PNG/WebP.'
                }
              </Typography>

              <Grid container spacing={2}>
                {form.photos.map((photo, i) => {
                  const isSelected = imagesToDelete.includes(i);
                  return (
                    <Grid item key={i} xs={12} sm={6} md={4}>
                      <Card 
                        variant="outlined"
                        sx={{
                          position: 'relative',
                          opacity: isSelected ? 0.5 : 1,
                          border: isSelected ? '2px solid red' : undefined,
                        }}
                      >
                        <CardMedia component="img" image={photo} height={160} />
                        <Box sx={{ px: 1, py: 1, display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                          {publicationToEdit ? (
                            <Button 
                              size="small" 
                              color={isSelected ? 'error' : 'primary'}
                              onClick={() => {
                                if (isSelected) {
                                  setImagesToDelete(prev => prev.filter(idx => idx !== i));
                                } else {
                                  setImagesToDelete(prev => [...prev, i]);
                                }
                              }}
                            >
                              {isSelected ? 'Cancelar' : 'Eliminar'}
                            </Button>
                          ) : (
                            <Button size="small" onClick={() => removePhotoAt(i)}>
                              Quitar
                            </Button>
                          )}
                        </Box>
                      </Card>
                    </Grid>
                  );
                })}
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
            {submitting 
              ? (publicationToEdit ? 'Guardando...' : 'Publicando...') 
              : (publicationToEdit ? 'Guardar cambios' : 'Publicar')
            }
          </Button>
        </DialogActions>
      </Dialog>

    </>
  )
}
