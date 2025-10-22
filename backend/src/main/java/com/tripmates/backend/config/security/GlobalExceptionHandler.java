package com.tripmates.backend.config.security;

import com.tripmates.backend.auth.dto.AuthErrorDTO;
import com.tripmates.backend.auth.exception.IncorrectPasswordException;
import com.tripmates.backend.auth.exception.IncorrectTokenException;
import com.tripmates.backend.auth.exception.UserAlreadyExistsException;
import com.tripmates.backend.auth.exception.UserNotFoundException;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@ControllerAdvice
public class GlobalExceptionHandler {

        @ExceptionHandler(UserAlreadyExistsException.class)
        public ResponseEntity<AuthErrorDTO> handleUserAlreadyExistingException(UserAlreadyExistsException e) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                                new AuthErrorDTO(
                                                "about:blank",
                                                "User already existing",
                                                HttpStatus.BAD_REQUEST.value(),
                                                e.getMessage(),
                                                "auth/register"));
        }

        @ExceptionHandler(UserNotFoundException.class)
        public ResponseEntity<AuthErrorDTO> handleUserNotFoundException(UserNotFoundException e) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                                new AuthErrorDTO(
                                                "about:blank",
                                                "Invalid Credentials",
                                                HttpStatus.NOT_FOUND.value(),
                                                e.getMessage(),
                                                "auth/login"));
        }

        @ExceptionHandler(IncorrectPasswordException.class)
        public ResponseEntity<AuthErrorDTO> handleIncorrectPasswordException(IncorrectPasswordException e) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                                new AuthErrorDTO(
                                                "about:blank",
                                                "Invalid Credentials",
                                                HttpStatus.UNAUTHORIZED.value(),
                                                e.getMessage(),
                                                "auth/login"));
        }

        @ExceptionHandler(IncorrectTokenException.class)
        public ResponseEntity<AuthErrorDTO> handleIncorrectTokenException(IncorrectTokenException e) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                                new AuthErrorDTO(
                                                "about:blank",
                                                "Invalid Credentials",
                                                HttpStatus.UNAUTHORIZED.value(),
                                                e.getMessage(),
                                                "auth/refresh"));
        }

}
