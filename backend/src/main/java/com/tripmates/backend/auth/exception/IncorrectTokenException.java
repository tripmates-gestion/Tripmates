package com.tripmates.backend.auth.exception;

public class IncorrectTokenException extends RuntimeException {
    public IncorrectTokenException(String message) { super(message); }
}
