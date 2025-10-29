package com.tripmates.backend.auth.exception;

public class ValidationErrorException extends RuntimeException {

	public ValidationErrorException(String message) {
		super(message);
	}

}
