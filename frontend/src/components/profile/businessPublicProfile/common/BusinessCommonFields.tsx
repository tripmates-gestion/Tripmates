import { Stack, TextField } from '@mui/material';
import ImageUploader from '../../../ui/ImageUploader';

export type BusinessCommonErrors = Partial<{
  name: string
  description: string
  location: string
  phoneNumber: string
  publicEmail: string
}>

export default function BusinessCommonFields({
  name, description, location, phoneNumber, publicEmail,
  onChange, avatarUrl, onAvatarSelected, disabled, errors,
}: {
  name: string
  description: string
  location: string
  phoneNumber: string
  publicEmail: string
  onChange: (k: 'name'|'description'|'location'|'phoneNumber'|'publicEmail', v: string)=>void
  avatarUrl?: string
  onAvatarSelected: (base64:string)=>void
  disabled?: boolean
  errors?: BusinessCommonErrors
}) {
  return (
    <Stack spacing={3}>
      <TextField
        label="Nombre"
        fullWidth
        value={name}
        onChange={e=>onChange('name', e.target.value)}
        disabled={disabled}
        error={Boolean(errors?.name)}
        helperText={errors?.name || 'Ej: Parrilla Don Julio'}
      />
      <TextField
        label="Descripción"
        fullWidth
        multiline
        minRows={3}
        value={description}
        onChange={e=>onChange('description', e.target.value)}
        disabled={disabled}
        error={Boolean(errors?.description)}
        helperText={errors?.description || 'Breve descripción del negocio'}
      />
      <TextField
        label="Ubicación"
        fullWidth
        value={location}
        onChange={e=>onChange('location', e.target.value)}
        disabled={disabled}
        error={Boolean(errors?.location)}
        helperText={errors?.location || 'Ej: Buenos Aires, Palermo'}
      />
      <TextField
        label="Teléfono"
        fullWidth
        value={phoneNumber}
        onChange={e=>onChange('phoneNumber', e.target.value)}
        disabled={disabled}
        error={Boolean(errors?.phoneNumber)}
        helperText={errors?.phoneNumber || 'Ej: +54 9 11 5555-5555'}
      />
      <TextField
        label="Email público (opcional)"
        fullWidth
        value={publicEmail}
        onChange={e=>onChange('publicEmail', e.target.value)}
        disabled={disabled}
        error={Boolean(errors?.publicEmail)}
        helperText={errors?.publicEmail || 'Ej: contacto@mail.com'}
      />
      <ImageUploader label="Foto de perfil" imageUrl={avatarUrl} onChange={onAvatarSelected} variant="circular" />
    </Stack>
  )
}
