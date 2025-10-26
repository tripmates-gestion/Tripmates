package com.tripmates.backend.config.security;

import com.tripmates.backend.auth.exception.IncorrectPasswordException;
import com.tripmates.backend.auth.exception.IncorrectTokenException;
import com.tripmates.backend.auth.exception.UserAlreadyExistsException;
import com.tripmates.backend.auth.exception.UserNotFoundException;
import com.tripmates.backend.common.dto.ErrorDTO;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@ControllerAdvice
public class GlobalExceptionHandler {

        @ExceptionHandler(UserAlreadyExistsException.class)
        public ResponseEntity<ErrorDTO> handleUserAlreadyExistingException(UserAlreadyExistsException e) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                                new ErrorDTO(
                                                "about:blank",
                                                "User already ",
                                                HttpStatus.BAD_REQUEST.value(),
                                                e.getMessage(),
                                                "auth/register"));
        }

        @ExceptionHandler(UserNotFoundException.class)
        public ResponseEntity<ErrorDTO> handleUserNotFoundException(UserNotFoundException e) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                                new ErrorDTO(
                                                "about:blank",
                                                "Invalid Credentials",
                                                HttpStatus.NOT_FOUND.value(),
                                                e.getMessage(),
                                                "auth/login"));
        }

        @ExceptionHandler(IncorrectPasswordException.class)
        public ResponseEntity<ErrorDTO> handleIncorrectPasswordException(IncorrectPasswordException e) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                                new ErrorDTO(
                                                "about:blank",
                                                "Invalid Credentials",
                                                HttpStatus.UNAUTHORIZED.value(),
                                                e.getMessage(),
                                                "auth/login"));
        }

        @ExceptionHandler(IncorrectTokenException.class)
        public ResponseEntity<ErrorDTO> handleIncorrectTokenException(IncorrectTokenException e) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                                new ErrorDTO(
                                                "about:blank",
                                                "Invalid Credentials",
                                                HttpStatus.UNAUTHORIZED.value(),
                                                e.getMessage(),
                                                "auth/refresh"));
        }

}
