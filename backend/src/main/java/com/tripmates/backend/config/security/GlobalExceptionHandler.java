package com.tripmates.backend.config.security;

import com.tripmates.backend.auth.exception.IncorrectPasswordException;
import com.tripmates.backend.auth.exception.IncorrectTokenException;
import com.tripmates.backend.auth.exception.UserAlreadyExistsException;
import com.tripmates.backend.auth.exception.UserNotFoundException;
import com.tripmates.backend.common.dto.ErrorDTO;
import com.tripmates.backend.common.exception.FileUploadException;
import com.tripmates.backend.common.exception.BadRequestException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import jakarta.servlet.http.HttpServletRequest;

@ControllerAdvice
public class GlobalExceptionHandler {

        @ExceptionHandler(UserAlreadyExistsException.class)
        public ResponseEntity<?> handleUserAlreadyExistsException(UserAlreadyExistsException e) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body(
                                new ErrorDTO(
                                                "about:blank",
                                                "User already exists",
                                                HttpStatus.CONFLICT.value(),
                                                e.getMessage(),
                                                "auth/register"));
        }

        @ExceptionHandler(UserNotFoundException.class)
        public ResponseEntity<?> handleUserNotFoundException(UserNotFoundException e) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                                new ErrorDTO(
                                                "about:blank",
                                                "Invalid Credentials",
                                                HttpStatus.NOT_FOUND.value(),
                                                e.getMessage(),
                                                "auth/login"));
        }

        @ExceptionHandler(BadRequestException.class)
        public ResponseEntity<?> handleBadRequestException(BadRequestException e, HttpServletRequest request) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                                new ErrorDTO(
                                                "about:blank",
                                                "Bad Request",
                                                HttpStatus.BAD_REQUEST.value(),
                                                e.getMessage(),
                                                String.valueOf(request.getRequestURI())));
        }

        @ExceptionHandler(IncorrectPasswordException.class)
        public ResponseEntity<?> handleIncorrectPasswordException(IncorrectPasswordException e) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                                new ErrorDTO(
                                                "about:blank",
                                                "Invalid Credentials",
                                                HttpStatus.UNAUTHORIZED.value(),
                                                e.getMessage(),
                                                "auth/login"));
        }

        @ExceptionHandler(FileUploadException.class)
        public ResponseEntity<?> handleFileUploadException(FileUploadException e, HttpServletRequest request) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                                new ErrorDTO(
                                                "about:blank",
                                                "File Upload Error",
                                                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                                                e.getMessage(),
                                                String.valueOf(request.getRequestURI())));
        }

        @ExceptionHandler(IncorrectTokenException.class)
        public ResponseEntity<?> handleIncorrectTokenException(IncorrectTokenException e) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                                new ErrorDTO(
                                                "about:blank",
                                                "Invalid Credentials",
                                                HttpStatus.UNAUTHORIZED.value(),
                                                e.getMessage(),
                                                "auth/refresh"));
        }

}
