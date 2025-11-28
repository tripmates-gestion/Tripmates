import { Stack, TextField, MenuItem, FormControl, FormHelperText } from '@mui/material'
import DaysSelector from '../common/DaysSelector'
import BusinessTimeRangeField from '../common/BusinessTimeRangeField'
import { PRICE_OPTIONS, RESTAURANT_TYPE_OPTIONS } from '../common/types'
import { type RestaurantType } from '../../../../types/Restaurant';

export type RestaurantFieldsErrors = Partial<{
  openingDays: string
  openingHours: string
  averagePrice: string
  restaurantType: string
}>

export default function RestaurantFields({
  openingDays, setOpeningDays,
  openingHours, setOpeningHours,
  averagePrice, setAveragePrice,
  restaurantType, setRestaurantType,
  disabled,
  errors,
}: {
  openingDays: string[]
  setOpeningDays: (v: string[]) => void
  openingHours: string
  setOpeningHours: (v: string) => void
  averagePrice?: '$'|'$$'|'$$$'
  setAveragePrice: (v: '$'|'$$'|'$$$'|undefined) => void
  restaurantType?: RestaurantType
  setRestaurantType: (v: RestaurantType|undefined) => void
  disabled?: boolean
  errors?: RestaurantFieldsErrors
}) {
  return (
    <Stack spacing={3}>
      <BusinessTimeRangeField
        label="Horario"
        value={openingHours}
        onChange={setOpeningHours}
        helperText={errors?.openingHours || 'Ej: 09:00–18:00'}
        error={Boolean(errors?.openingHours)}
        disabled={disabled}
      />

      <FormControl error={Boolean(errors?.openingDays)}>
        <DaysSelector value={openingDays} onChange={setOpeningDays} disabled={disabled}/>
        <FormHelperText>{errors?.openingDays || 'Elegí al menos un día'}</FormHelperText>
      </FormControl>

      <TextField
        label="Rango de precio"
        select
        fullWidth
        disabled={disabled}
        value={averagePrice ?? ''}
        onChange={e=>setAveragePrice((e.target.value || undefined) as any)}
        error={Boolean(errors?.averagePrice)}
        helperText={errors?.averagePrice || 'Opcional: $, $$ o $$$'}
      >
        <MenuItem value="">—</MenuItem>
        {PRICE_OPTIONS.map(p=> <MenuItem key={p} value={p}>{p}</MenuItem>)}
      </TextField>

      <TextField
        label="Tipo de restaurante"
        select
        fullWidth
        disabled={disabled}
        value={restaurantType ?? ''}
        onChange={e=>setRestaurantType((e.target.value || undefined) as RestaurantType | undefined)}
        error={Boolean(errors?.restaurantType)}
        helperText={errors?.restaurantType || 'Seleccioná un tipo'}
      >
        <MenuItem value="">—</MenuItem>
        {RESTAURANT_TYPE_OPTIONS.map(t=> <MenuItem key={t} value={t}>{t}</MenuItem>)}
      </TextField>
    </Stack>
  )
}
