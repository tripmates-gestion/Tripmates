import { Search } from '@mui/icons-material'
import { Button, Stack, TextField, Typography } from '@mui/material'
import ImageUploader from '../../../ui/ImageUploader'
import OpenStreetMapPicker from '../../../map/OpenStreetMapPicker'
import type { LocationDTO } from '../../../../types/Location'
import { useGeocodeAddress } from '../../../../hooks/useGeocodeAddress'
import { useReverseGeocode } from '../../../../hooks/useReverseGeocode'
import { useCallback, useEffect, useState } from 'react'

export type BusinessCommonErrors = Partial<{
  name: string
  description: string
  location: Partial<Record<keyof LocationDTO, string>>
  phoneNumber: string
  publicEmail: string
}>

export default function BusinessCommonFields({
  name, description, location, phoneNumber, publicEmail,
  onChange, avatarUrl, onAvatarSelected, disabled, errors,
}: {
  name: string
  description: string
  location: LocationDTO
  phoneNumber: string
  publicEmail: string
  onChange: (k: 'name'|'description'|'location'|'phoneNumber'|'publicEmail', v: string | LocationDTO)=>void
  avatarUrl?: string
  onAvatarSelected: (base64:string)=>void
  disabled?: boolean
  errors?: BusinessCommonErrors
}) {
  const { geocodeAddress, loading: geocoding, error: geoError, setError: setGeoError } = useGeocodeAddress()
  const { reverseGeocode, loading: reverseLoading, error: reverseError, setError: setReverseError } = useReverseGeocode()

  const [addressInput, setAddressInput] = useState(location?.address || '')

  useEffect(() => {
    setAddressInput(location?.address || '')
  }, [location?.address])

  const handleSearchInMap = async () => {
    const result = await geocodeAddress(addressInput || '')
    if (result) {
      onChange('location', {
        ...(location || {}),
        address: addressInput,
        latitude: result.latitude,
        longitude: result.longitude,
      })
    }
  }

  const handleMapChange = useCallback(async (value: LocationDTO) => {
    const updatedLocation = {
      ...(location || {}),
      latitude: value.latitude,
      longitude: value.longitude,
    }

    onChange('location', updatedLocation)

    if (geoError) setGeoError(null)
    if (reverseError) setReverseError(null)

    const suggestedAddress = await reverseGeocode(value.latitude, value.longitude)

    if (suggestedAddress) {
      setAddressInput(suggestedAddress)
      onChange('location', {
        ...updatedLocation,
        address: suggestedAddress,
      })
    }
  }, [geoError, location, onChange, reverseError, reverseGeocode, setGeoError, setReverseError])

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
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ xs: 'stretch', sm: 'flex-start' }}>
        <TextField
          label="Ubicación"
          fullWidth
          value={addressInput}
          onChange={e => {
            setAddressInput(e.target.value)
            if (geoError) setGeoError(null)
            if (reverseError) setReverseError(null)
          }}
          disabled={disabled}
          error={Boolean(errors?.location?.address) || Boolean(geoError) || Boolean(reverseError)}
          helperText={errors?.location?.address || geoError || reverseError || 'Ej: Av. Paseo Colón 850, Buenos Aires, Argentina'}
        />
        <Button
          variant="outlined"
          startIcon={<Search />}
          onClick={handleSearchInMap}
          disabled={disabled || geocoding || reverseLoading}
          sx={{
            whiteSpace: 'nowrap',
            height: { sm: 56 },
            alignSelf: { xs: 'stretch', sm: 'flex-start' },
            width: { xs: '100%', sm: 'auto' },
          }}
        >
          {geocoding ? 'Buscando...' : 'Buscar en mapa'}
        </Button>
      </Stack>

      <OpenStreetMapPicker location={location} onChange={handleMapChange} disabled={disabled} />
      <Typography variant="body2" color="text.secondary">
        {Number.isFinite(location.latitude) && Number.isFinite(location.longitude) && !(location.latitude === 0 && location.longitude === 0)
          ? `Coordenadas seleccionadas: ${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}`
          : 'Hacé clic en el mapa para fijar la ubicación exacta'}
      </Typography>
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
