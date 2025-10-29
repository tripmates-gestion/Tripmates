import { useCallback } from 'react';
import {
  isValidEmail,
  isValidPhone,
  isValidSchedule,
  isValidLocation,
} from '../components/publications/utils/validators';
import type { UpdateProfileFormState } from '../types/business';

type ValidationErrors = Partial<Record<keyof UpdateProfileFormState, string>>;

/**
 * Hook para validar formularios de edición de perfil de negocio
 */
export function useUpdateBusinessUserValidation() {
  return useCallback((form: UpdateProfileFormState): ValidationErrors => {
    const errors: ValidationErrors = {};

    // Validar nombre
    if (!form.name?.trim()) {
      errors.name = 'La cuenta debe tener un nombre';
    }

    // Validar descripción
    if (!form.description?.trim()) {
      errors.description = 'La descripción es obligatoria';
    }

    // Validar días de apertura (formato: palabra, palabra, ...)
    if (!form.openningDays?.trim()) {
      errors.openningDays = 'Los días de apertura son obligatorios';
    } else {
      const days = form.openningDays
        .split(',')
        .map((d) => d.trim())
        .filter(Boolean);

      const invalid = days.some(
        (d) => !/^[A-Za-zÁÉÍÓÚáéíóúÑñ]+$/.test(d)
      );
      if (invalid) {
        errors.openningDays = 'Formato inválido. Usá nombres de días separados por coma (ej: Lunes, Martes)';
      }
    }

    // Validar horarios
    if (!form.openingHours?.trim()) {
      errors.openingHours = 'El horario es obligatorio';
    } else if (!isValidSchedule(form.openingHours)) {
      errors.openingHours = 'Formato inválido. Ejemplo: 09:00–18:00';
    }

    // Validar ubicación
    if (!form.location?.trim()) {
      errors.location = 'La ubicación es obligatoria';
    } else if (!isValidLocation(form.location)) {
      errors.location = 'Ingresá una ubicación válida (ciudad, provincia o dirección)';
    }

    // Validar contacto
    if (!form.phone?.trim()) {
      errors.phone = 'El teléfono es obligatorio';
    } else if (!isValidEmail(form.phone) && !isValidPhone(form.phone)) {
      errors.phone = 'Debe ser un email o número de teléfono válido';
    }

    return errors;
  }, []);
}
