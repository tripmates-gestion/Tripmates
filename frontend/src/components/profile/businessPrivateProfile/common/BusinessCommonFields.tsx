import { Stack, TextField, Typography } from '@mui/material';
import ImageUploader from '../../../ui/ImageUploader';
import BusinessLocationPicker from '../../../BusinessLocationPicker';
import type { LocationDTO } from '../../../../types/Location';

export type BusinessCommonErrors = Partial<{
  name: string
  description: string
  location: string
  phoneNumber: string
  publicEmail: string
}>

export default function BusinessCommonFields({
  name,
  description,
  location,
  phoneNumber,
  publicEmail,
  onChange,
  onLocationChange,
  onLocationSave,
  avatarUrl,
  onAvatarSelected,
  disabled,
  errors,
}: {
  name: string
  description: string
  location: LocationDTO
  phoneNumber: string
  publicEmail: string
  onChange: (k: 'name'|'description'|'location'|'phoneNumber'|'publicEmail', v: string)=>void
  onLocationChange: (location: LocationDTO) => void
  onLocationSave?: (location: LocationDTO) => Promise<void> | void
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
      <Stack spacing={1.5}>
        <Typography variant="subtitle2" fontWeight={700}>
          Ubicación
        </Typography>
        <BusinessLocationPicker
          initialLocation={location}
          onLocationChange={(loc) => {
            onLocationChange(loc);
            onChange("location", loc.address);
          }}
          onSave={onLocationSave ?? (() => undefined)}
          showSaveButton={Boolean(onLocationSave)}
        />
        {errors?.location && (
          <Typography variant="caption" color="error">
            {errors.location}
          </Typography>
        )}
      </Stack>
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
