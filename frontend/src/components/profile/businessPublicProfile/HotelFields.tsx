import { Stack, TextField, MenuItem } from '@mui/material'
import { HOTEL_TYPE_OPTIONS, HOTEL_TYPE_LABEL } from './common/types'
import { type HotelType } from '../../../types/Hotel';

export type HotelFieldsErrors = Partial<{ hotelType: string }>

export default function HotelFields({
  hotelType,
  setHotelType,
  disabled,
  errors,
}: {
  hotelType?: HotelType
  setHotelType: (v: HotelType | undefined) => void
  disabled?: boolean
  errors?: HotelFieldsErrors
}) {
  return (
    <Stack spacing={3}>
      <TextField
        label="Tipo de hotel"
        select
        fullWidth
        value={hotelType ?? ''}
        onChange={(e) => setHotelType((e.target.value || undefined) as HotelType | undefined)}
        disabled={disabled}
        error={Boolean(errors?.hotelType)}
        helperText={errors?.hotelType || 'Ej: HOSTEL, RESORT, APART, SPA, BOUTIQUE'}
      >
        <MenuItem value="">—</MenuItem>
        {HOTEL_TYPE_OPTIONS.map((t) => (
          <MenuItem key={t} value={t}>
            {HOTEL_TYPE_LABEL[t]}
          </MenuItem>
        ))}
      </TextField>
    </Stack>
  )
}
