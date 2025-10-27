import { useMemo, useState } from 'react'
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
  Snackbar,
  Alert,
  Card,
  CardMedia,
  Grid2 as Grid,
} from '@mui/material'
import ImageUploader from '../../components/ui/ImageUploader'
import { ACCOUNT_TYPES } from '../../constants/Rol'
import {useAuth} from "../../hooks/useAuth"
import PlaceCard from './PlaceCard'
import { useEffect } from 'react'

type BusinessType = 'alojamiento' | 'servicio'

type BusinessPost = {
  id: string
  title: string
  type: BusinessType
  description: string
  hours: string
  contact: string
  location: string
  photos: string[]
  createdAt: string
}

async function saveBusinessPostMock(post: Omit<BusinessPost, 'id' | 'createdAt'>): Promise<BusinessPost> {
  await new Promise((r) => setTimeout(r, 500))
  return {
    ...post,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  }
}

function usePostValidation() {
  return (draft: Partial<BusinessPost>) => {
    const errors: Record<string, string> = {}
    if (!draft.title?.trim()) errors.title = 'El título es obligatorio'
    if (!draft.type) errors.type = 'Seleccioná un tipo'
    if (!draft.description?.trim()) errors.description = 'La descripción es obligatoria'
    if (!draft.hours?.trim()) errors.hours = 'El horario es obligatorio'
    if (!draft.contact?.trim()) errors.contact = 'La información de contacto es obligatoria'
    if (!draft.location?.trim()) errors.location = 'La ubicación es obligatoria'
    return errors
  }
}

type FormState = {
  title: string
  type: BusinessType | ''
  description: string
  hours: string
  contact: string
  location: string
  photos: string[]
}

const initialForm: FormState = {
  title: '',
  type: '',
  description: '',
  hours: '',
  contact: '',
  location: '',
  photos: [],
}

function NewPostDialog({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: (post: BusinessPost) => void }) {
  const [form, setForm] = useState<FormState>(initialForm)
  const [submitting, setSubmitting] = useState(false)
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const validate = usePostValidation()
  const errors = useMemo(() => validate(form as any), [form])

  const hasError = (k: keyof FormState) => Boolean(touched[k] && (errors as any)[k])
  const helper = (k: keyof FormState) => (touched[k] ? (errors as any)[k] : '')

  const addPhoto = (b64: string) => {
    setForm((f) => ({ ...f, photos: [...f.photos, b64] }))
  }

  const removePhotoAt = (idx: number) => {
    setForm((f) => ({ ...f, photos: f.photos.filter((_, i) => i !== idx) }))
  }

  const onSubmit = async () => {
    setTouched({ title: true, type: true, description: true, hours: true, contact: true, location: true })
    if (Object.keys(errors).length) return
    setSubmitting(true)
    try {
      const saved = await saveBusinessPostMock({
        title: form.title.trim(),
        type: form.type as BusinessType,
        description: form.description.trim(),
        hours: form.hours.trim(),
        contact: form.contact.trim(),
        location: form.location.trim(),
        photos: form.photos,
      })
      onCreated(saved)
      setForm(initialForm)
      onClose()
    } finally {
      setSubmitting(false)
    }
  }

  useEffect(() => {
    if (open) setTouched({})
  }, [open])
  

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Nueva publicación de negocio</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <TextField
            label="Título"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            onBlur={() => setTouched((t) => ({ ...t, title: true }))}
            error={hasError('title')}
            helperText={helper('title')}
            required
          />

          <FormControl error={hasError('type')} required>
            <InputLabel id="bp-type">Tipo de publicación</InputLabel>
            <Select
              labelId="bp-type"
              label="Tipo de publicación"
              value={form.type}
              onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as BusinessType }))}
              onBlur={() => setTouched((t) => ({ ...t, type: true }))}
            >
              <MenuItem value={'alojamiento'}>Alojamiento</MenuItem>
              <MenuItem value={'servicio'}>Servicio</MenuItem>
            </Select>
            <FormHelperText>{helper('type')}</FormHelperText>
          </FormControl>

          <TextField
            label="Descripción / Detalles"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            onBlur={() => setTouched((t) => ({ ...t, description: true }))}
            error={hasError('description')}
            helperText={helper('description')}
            multiline
            minRows={4}
            required
          />

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Horario de atención"
                placeholder="Ej: Lun a Vie 9:00–18:00"
                value={form.hours}
                onChange={(e) => setForm((f) => ({ ...f, hours: e.target.value }))}
                onBlur={() => setTouched((t) => ({ ...t, hours: true }))}
                error={hasError('hours')}
                helperText={helper('hours')}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Información de contacto"
                placeholder="Teléfono, email o sitio web"
                value={form.contact}
                onChange={(e) => setForm((f) => ({ ...f, contact: e.target.value }))}
                onBlur={() => setTouched((t) => ({ ...t, contact: true }))}
                error={hasError('contact')}
                helperText={helper('contact')}
                required
              />
            </Grid>
          </Grid>

          <TextField
            label="Ubicación"
            placeholder="Ciudad, provincia / Dirección"
            value={form.location}
            onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
            onBlur={() => setTouched((t) => ({ ...t, location: true }))}
            error={hasError('location')}
            helperText={helper('location')}
            required
          />

          <Divider />

          <Stack spacing={1}>
            <Typography variant="subtitle1" fontWeight={700}>Fotos (opcional)</Typography>
            <Typography variant="body2" color="text.secondary">Hasta 6 imágenes. Formato: JPG/PNG/WebP.</Typography>
            <Grid container spacing={2}>
              {form.photos.map((p, i) => (
                <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}>
                  <Card variant="outlined">
                    <CardMedia component="img" image={p} height={160} />
                    <CardActionsX>
                      <Button size="small" onClick={() => removePhotoAt(i)}>Quitar</Button>
                    </CardActionsX>
                  </Card>
                </Grid>
              ))}
              {form.photos.length < 6 && (
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <Box sx={{ p: 1 }}>
                    <ImageUploader label="Agregar imagen" onChange={addPhoto} variant="rectangular" />
                  </Box>
                </Grid>
              )}
            </Grid>
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={submitting}>Cancelar</Button>
        <Button variant="contained" onClick={onSubmit} disabled={submitting}>Publicar</Button>
      </DialogActions>
    </Dialog>
  )
}

function CardActionsX({ children }: { children: React.ReactNode }) {
  return (
    <Box sx={{ px: 1, py: 1, display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
      {children}
    </Box>
  )
}

function BusinessOnly({ children }: { children: React.ReactNode}) {
  const {user} = useAuth()

  if (user?.role !== ACCOUNT_TYPES.business) {
    return (
      <Stack spacing={2} alignItems="center" textAlign="center" sx={{ py: 6 }}>
        <Typography variant="h5" fontWeight={800}>Función exclusiva para cuentas de negocio</Typography>
        <Typography color="text.secondary" maxWidth={560}>
          Para crear publicaciones de negocio, convertí tu cuenta a <strong>BUSINESS</strong>.
        </Typography>
      </Stack>
    )
  }
  return <>{children}</>
}

export default function BusinessPostsPage() {
  const [posts, setPosts] = useState<BusinessPost[]>([])
  const [open, setOpen] = useState(false)
  const [toast, setToast] = useState<{ open: boolean; msg: string; sev: 'success' | 'error' }>({ open: false, msg: '', sev: 'success' })

  const handleCreated = (post: BusinessPost) => {
    setPosts((p) => [post, ...p])
    setToast({ open: true, msg: '¡Publicación creada!', sev: 'success' })
  }

  return (
    <BusinessOnly>
      <Stack spacing={3}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h5" fontWeight={800}>Publicaciones de tu negocio</Typography>
          <Button variant="contained" onClick={() => setOpen(true)}>Crear publicación</Button>
        </Stack>

        {posts.length === 0 ? (
          <Box sx={{ p: 4, border: '1px dashed', borderColor: 'divider', borderRadius: 2, textAlign: 'center' }}>
            <Typography color="text.secondary">Aún no tenés publicaciones. Creá la primera.</Typography>
          </Box>
        ) : (
          <Box
          display="grid"
          gridTemplateColumns={{
            xs: '1fr',          // 1 por fila en móviles
            sm: 'repeat(2, 1fr)', // 2 por fila en tablets
            md: 'repeat(3, 1fr)', // 3 por fila en escritorio
          }}
          gap={4} // espacio entre PlaceCards
        >
            {posts.map((p) => (
              <Grid key={p.id} size={{ xs: 12, md: 6 }}>
                <PlaceCard post={p} />
              </Grid>
            ))}
          </Box>
        )}
      </Stack>

      <NewPostDialog open={open} onClose={() => setOpen(false)} onCreated={handleCreated} />

      <Snackbar
        open={toast.open}
        autoHideDuration={2500}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={toast.sev} variant="filled">{toast.msg}</Alert>
      </Snackbar>
    </BusinessOnly>
  )
}