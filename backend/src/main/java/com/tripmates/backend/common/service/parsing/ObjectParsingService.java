package com.tripmates.backend.common.service.parsing;

import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import jakarta.validation.Validator;
import com.tripmates.backend.common.exception.BadRequestException;

import java.util.Set;

@Service
public class ObjectParsingService {

	private final ObjectMapper mapper;

	private final Validator validator;

	public ObjectParsingService(ObjectMapper mapper, Validator validator) {
		this.mapper = mapper;
		this.validator = validator;
	}

	/**
	 * Deserializa un JSON en un DTO y valida sus constraints.
	 * @param json JSON a deserializar
	 * @param clazz Clase del DTO
	 * @param <T> Tipo del DTO
	 * @return DTO deserializado y validado
	 * @throws ConstraintViolationException si hay errores de validación
	 */
	public <T> T parseAndValidate(String json, Class<T> clazz) {
		T object;
		try {
			object = mapper.readValue(json, clazz);
		}
		catch (Exception e) {
			throw new BadRequestException("Error parsing JSON: " + e.getMessage());
		}

		Set<ConstraintViolation<T>> violations = validator.validate(object);
		if (!violations.isEmpty())
			throw new ConstraintViolationException(violations);

		return object;
	}

}
