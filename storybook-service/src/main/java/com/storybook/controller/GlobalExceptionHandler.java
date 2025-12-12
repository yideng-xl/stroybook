package com.storybook.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<?> handleRuntimeException(RuntimeException e) {
        Map<String, String> response = new HashMap<>();
        response.put("message", e.getMessage() != null ? e.getMessage() : "An unexpected error occurred");
        // Use 400 Bad Request or 500 Internal Server Error?
        // Logic errors like "Limit reached" are often 400 or 403, but here the service
        // throws RuntimeException which usually maps to 500.
        // We keep 500 but provide the message.
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }
}
