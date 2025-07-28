package com.taskmanager.handler;

import com.taskmanager.exception.BaseException;
import com.taskmanager.exception.MessageType;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.exception.ConstraintViolationException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(BaseException.class)
    public ResponseEntity<ApiError<String>> handleBaseException(BaseException ex, WebRequest request) {
        ApiError<String> apiError = createApiError(ex.getMessage(), request, HttpStatus.BAD_REQUEST);
        return new ResponseEntity<>(apiError, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiError<String>> handleDataIntegrityViolation(DataIntegrityViolationException ex, WebRequest request) {
        String message;
        if (ex.getCause() instanceof ConstraintViolationException) {
            String constraintName = ((ConstraintViolationException) ex.getCause()).getConstraintName();
            if (constraintName != null && constraintName.contains("email")) {
                message = MessageType.EMAIL_IN_USE.getMessage();
            } else {
                message = MessageType.DATABASE_ERROR.getMessage();
            }
        } else {
            message = MessageType.DATABASE_ERROR.getMessage();
        }

        ApiError<String> apiError = createApiError(message, request, HttpStatus.BAD_REQUEST);
        return new ResponseEntity<>(apiError, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError<Map<String, String>>> handleValidationExceptions(
            MethodArgumentNotValidException ex, WebRequest request) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(error -> {
            String message = error.getDefaultMessage();
            if (message == null || message.isEmpty()) {
                message = MessageType.VALIDATION_ERROR.getMessage();
            }
            errors.put(error.getField(), message);
        });

        ApiError<Map<String, String>> apiError = createApiError(errors, request, HttpStatus.BAD_REQUEST);
        return new ResponseEntity<>(apiError, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError<String>> handleGeneralException(Exception ex, WebRequest request) {
        String message = MessageType.GENERAL_EXCEPTION.getMessage();
        ApiError<String> apiError = createApiError(message, request, HttpStatus.INTERNAL_SERVER_ERROR);
        return new ResponseEntity<>(apiError, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    private <E> ApiError<E> createApiError(E message, WebRequest request, HttpStatus status) {
        ApiError<E> apiError = new ApiError<>();
        apiError.setStatus(status.value());

        ExceptionDetail<E> exceptionDetail = new ExceptionDetail<>();
        exceptionDetail.setMessage(message);
        exceptionDetail.setPath(request.getDescription(false).replace("uri=", ""));
        exceptionDetail.setTimestamp(new Date());

        apiError.setException(exceptionDetail);
        return apiError;
    }

    @Getter
    @Setter
    private static class ApiError<T> {
        private int status;
        private ExceptionDetail<T> exception;
    }

    @Getter
    @Setter
    private static class ExceptionDetail<T> {
        private String path;
        private Date timestamp;
        private T message;
    }
}
