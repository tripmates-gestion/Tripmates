import { useEffect, useMemo, useState } from 'react'
import { FormControl, FormHelperText, Stack, Typography } from '@mui/material'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { MobileTimePicker } from '@mui/x-date-pickers/MobileTimePicker'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import type { Dayjs } from 'dayjs'
import dayjs from 'dayjs'

const SEPARATOR = '–'

type Props = {
  label: string
  value: string
  onChange: (newValue: string) => void
  helperText?: string
  error?: boolean
  disabled?: boolean
}

function parseTime(value?: string): Dayjs | null {
  if (!value) return null
  const parsed = dayjs(value, 'HH:mm', true)
  return parsed.isValid() ? parsed : null
}

function parseRange(value: string): { start: Dayjs | null; end: Dayjs | null } {
  if (!value) return { start: null, end: null }
  const normalized = value.replace(/\s+/g, '').replace('-', SEPARATOR)
  const [start, end] = normalized.split(SEPARATOR)
  return {
    start: parseTime(start),
    end: parseTime(end),
  }
}

function formatRange(start: Dayjs, end: Dayjs) {
  return `${start.format('HH:mm')}${SEPARATOR}${end.format('HH:mm')}`
}

export default function BusinessTimeRangeField({
  label,
  value,
  onChange,
  helperText,
  error,
  disabled,
}: Props) {
  const { start: initialStart, end: initialEnd } = useMemo(() => parseRange(value), [value])
  const [startTime, setStartTime] = useState<Dayjs | null>(initialStart)
  const [endTime, setEndTime] = useState<Dayjs | null>(initialEnd)
  const [internalError, setInternalError] = useState('')

  useEffect(() => {
    setStartTime(initialStart)
    setEndTime(initialEnd)
    setInternalError('')
  }, [initialStart, initialEnd])

  const validateAndChange = (nextStart: Dayjs | null, nextEnd: Dayjs | null) => {
    setStartTime(nextStart)
    setEndTime(nextEnd)

    if (nextStart && nextEnd && nextEnd.isBefore(nextStart)) {
      setInternalError('La hora de fin debe ser mayor o igual a la de inicio')
      return
    }

    setInternalError('')

    if (nextStart && nextEnd) {
      onChange(formatRange(nextStart, nextEnd))
    } else {
      onChange('')
    }
  }

  const displayError = error || Boolean(internalError)
  const displayHelperText = internalError || helperText || 'Ej: 09:00–18:00'

  return (
    <FormControl fullWidth error={displayError} disabled={disabled}>
      <Stack spacing={1}>
        <Typography variant="subtitle1" fontWeight={700}>
          {label}
        </Typography>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <MobileTimePicker
              ampm={false}
              value={startTime}
              onChange={(newValue) => validateAndChange(newValue, endTime)}
              format="HH:mm"
              slotProps={{
                textField: {
                  fullWidth: true,
                  label: 'Hora de inicio',
                },
              }}
              disabled={disabled}
            />
            <MobileTimePicker
              ampm={false}
              value={endTime}
              onChange={(newValue) => validateAndChange(startTime, newValue)}
              format="HH:mm"
              slotProps={{
                textField: {
                  fullWidth: true,
                  label: 'Hora de cierre',
                },
              }}
              disabled={disabled}
            />
          </Stack>
        </LocalizationProvider>
        <FormHelperText>{displayHelperText}</FormHelperText>
      </Stack>
    </FormControl>
  )
}
