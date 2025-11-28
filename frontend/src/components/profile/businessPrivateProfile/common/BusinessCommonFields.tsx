import { Search } from '@mui/icons-material'
import { Button, Stack, TextField, Typography } from '@mui/material'
import ImageUploader from '../../../ui/ImageUploader'
import OpenStreetMapPicker from '../../../map/OpenStreetMapPicker'
import type { LocationDTO } from '../../../../types/Location'
import { useGeocodeAddress } from '../../../../hooks/useGeocodeAddress'
import { useEffect, useState } from "react";
import { InputAdornment, IconButton } from "@mui/material";

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

    // NUEVO: estado local solo para lo que escribe el usuario
    const [addressInput, setAddressInput] = useState(location?.address || "");

    // si viene una ubicación precargada (editar negocio), sincronizamos
    useEffect(() => {
      setAddressInput(location?.address || "");
    }, [location?.address]);
  
    const handleSearchInMap = async () => {
      const result = await geocodeAddress(addressInput || "");
      if (result) {
        onChange("location", {
          ...(location || {}),
          address: addressInput,
          latitude: result.latitude,
          longitude: result.longitude,
        });
      }
    };

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
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems="flex-start">
        <TextField
          label="Ubicación"
          fullWidth
          value={addressInput}
          onChange={e => {
            onChange('location', {
              ...(location || { latitude: 0, longitude: 0 }),
              address: e.target.value
            })
            if (geoError) setGeoError(null)
          }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  edge="end"
                  onClick={handleSearchInMap}
                  disabled={disabled || geocoding}
                >
                  <Search />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Stack>

      <OpenStreetMapPicker location={location} onChange={(value)=>onChange('location', value)} disabled={disabled} />
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
