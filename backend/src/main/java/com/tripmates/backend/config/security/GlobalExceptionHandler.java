package com.tripmates.backend.config.security;

import com.tripmates.backend.auth.dto.AuthLoginRequestErrorDTO;
import com.tripmates.backend.auth.exception.IncorrectPasswordException;
import com.tripmates.backend.auth.exception.UserNotFoundException;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<AuthLoginRequestErrorDTO> handleUserNotFoundException(UserNotFoundException e) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                new AuthLoginRequestErrorDTO(
                        "about:blank",
                        "Invalid Credentials",
                        HttpStatus.NOT_FOUND.value(),
                        e.getMessage(),
                        "auth/login"
                )
        );
    }

    @ExceptionHandler(IncorrectPasswordException.class)
    public ResponseEntity<AuthLoginRequestErrorDTO> handleIncorrectPasswordException(IncorrectPasswordException e) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                new AuthLoginRequestErrorDTO(
                        "about:blank",
                        "Invalid Credentials",
                        HttpStatus.UNAUTHORIZED.value(),
                        e.getMessage(),
                        "auth/login"
                )
        );
    }

}
