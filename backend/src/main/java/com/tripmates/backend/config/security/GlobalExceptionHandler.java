package com.tripmates.backend.config.security;

import com.tripmates.backend.common.exception.ConflictException;
import com.tripmates.backend.auth.exception.ValidationErrorException;
import com.tripmates.backend.common.dto.ErrorDTO;
import com.tripmates.backend.common.exception.BadRequestException;
import com.tripmates.backend.common.exception.FileUploadException;
import com.tripmates.backend.common.exception.NotFoundException;
import com.tripmates.backend.common.exception.UnauthorizedException;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.util.stream.Collectors;

@ControllerAdvice
public class GlobalExceptionHandler {

	@ExceptionHandler(MethodArgumentNotValidException.class)
	public ResponseEntity<?> handleValidationExceptions(MethodArgumentNotValidException ex,
			HttpServletRequest request) {
		String errorMessage = ex.getBindingResult()
				.getFieldErrors()
				.stream()
				.map(FieldError::getDefaultMessage)
				.collect(Collectors.joining("; "));

		return ResponseEntity.status(HttpStatus.BAD_REQUEST)
				.body(new ErrorDTO("about:blank", "Validation Error", HttpStatus.BAD_REQUEST.value(), errorMessage,
						String.valueOf(request.getRequestURI())));
	}

	@ExceptionHandler(ConstraintViolationException.class)
	public ResponseEntity<?> handleConstraintViolation(ConstraintViolationException ex, HttpServletRequest request) {
		String errorMessage = ex.getConstraintViolations()
				.stream()
				.map(violation -> String.format("%s: %s", violation.getPropertyPath(), violation.getMessage()))
				.collect(Collectors.joining("; "));

		return ResponseEntity.status(HttpStatus.BAD_REQUEST)
				.body(new ErrorDTO("about:blank", "Validation Error", HttpStatus.BAD_REQUEST.value(), errorMessage,
						String.valueOf(request.getRequestURI())));
	}

	@ExceptionHandler(UnauthorizedException.class)
	public ResponseEntity<?> handleUnauthorizedException(UnauthorizedException e, HttpServletRequest request) {
		return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
				.body(new ErrorDTO("about:blank", "Unauthorized", HttpStatus.UNAUTHORIZED.value(), e.getMessage(),
						String.valueOf(request.getRequestURI())));
	}

	@ExceptionHandler(ValidationErrorException.class)
	public ResponseEntity<?> handleValidationErrorException(ValidationErrorException e, HttpServletRequest request) {
		return ResponseEntity.status(HttpStatus.BAD_REQUEST)
				.body(new ErrorDTO("about:blank", "Validation Error", HttpStatus.BAD_REQUEST.value(), e.getMessage(),
						String.valueOf(request.getRequestURI())));
	}

	@ExceptionHandler(NotFoundException.class)
	public ResponseEntity<?> handleNotFoundException(NotFoundException e, HttpServletRequest request) {
		return ResponseEntity.status(HttpStatus.NOT_FOUND)
				.body(new ErrorDTO("about:blank", "Not Found Error", HttpStatus.NOT_FOUND.value(), e.getMessage(),
						String.valueOf(request.getRequestURI())));
	}

	@ExceptionHandler(BadRequestException.class)
	public ResponseEntity<?> handleBadRequestException(BadRequestException e, HttpServletRequest request) {
		return ResponseEntity.status(HttpStatus.BAD_REQUEST)
				.body(new ErrorDTO("about:blank", "Bad Request", HttpStatus.BAD_REQUEST.value(), e.getMessage(),
						String.valueOf(request.getRequestURI())));
	}

	@ExceptionHandler(FileUploadException.class)
	public ResponseEntity<?> handleFileUploadException(FileUploadException e, HttpServletRequest request) {
		return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
				.body(new ErrorDTO("about:blank", "File Upload Error", HttpStatus.INTERNAL_SERVER_ERROR.value(),
						e.getMessage(), String.valueOf(request.getRequestURI())));
	}

	@ExceptionHandler(Exception.class)
	public ResponseEntity<?> handleException(Exception e, HttpServletRequest request) {
		return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
				.body(new ErrorDTO("about:blank", "Internal Server Error", HttpStatus.INTERNAL_SERVER_ERROR.value(),
						e.getMessage(), String.valueOf(request.getRequestURI())));
	}

	@ExceptionHandler(ConflictException.class)
	public ResponseEntity<?> handleConflictException(ConflictException e, HttpServletRequest request) {
		return ResponseEntity.status(HttpStatus.CONFLICT)
				.body(new ErrorDTO("about:blank", "Conflict", HttpStatus.CONFLICT.value(), e.getMessage(),
						String.valueOf(request.getRequestURI())));
	}

}
