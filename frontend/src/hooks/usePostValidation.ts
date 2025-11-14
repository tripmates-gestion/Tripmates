import { useCallback } from 'react'
import {
  isValidEmail,
  isValidPhone,
  isValidSchedule,
  isValidLocation,
} from '../components/publications/utils/validators'
import type { FormState } from '../types/Business'

type ValidationErrors = Partial<Record<keyof FormState, string>>

/**
 * Hook para validar formularios de publicación de negocios
 * @returns Función de validación que retorna errores por campo
 */
export function usePostValidation() {
  return useCallback((form: FormState): ValidationErrors => {
    const errors: ValidationErrors = {}

    // Validar título
    if (!form.title?.trim()) {
      errors.title = 'El título es obligatorio'
    }

    // Validar tag
    if (!form.tags.length) {
      errors.tags = 'Seleccioná un tipo'
    }

    // Validar descripción
    if (!form.description?.trim()) {
      errors.description = 'La descripción es obligatoria'
    }

    // // Validar horarios
    // if (!form.hours?.trim()) {
    //   errors.hours = 'El horario es obligatorio'
    // } else 
    
    if (!isValidSchedule(form.hours)) {
      errors.hours = 'Formato inválido. Ejemplo: 09:00–18:00'
    }

    // // Validar contacto (email o teléfono)
    // if (!form.contact?.trim()) {
    //   errors.contact = 'La información de contacto es obligatoria'
    // } else 
    
    if (!isValidEmail(form.contact) && !isValidPhone(form.contact)) {
      errors.contact = 'Debe ser un email o número de teléfono válido'
    }

    // // Validar ubicación
    // if (!form.location?.trim()) {
    //   errors.location = 'La ubicación es obligatoria'
    // } else 
    
    if (!isValidLocation(form.location)) {
      errors.location = 'Ingresá una ubicación válida (ciudad, provincia o dirección)'
    }

    return errors
  }, [])
}
