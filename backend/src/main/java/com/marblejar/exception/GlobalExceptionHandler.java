package com.marblejar.exception;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.util.Map;

@ControllerAdvice
public class GlobalExceptionHandler {

    private final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);
    private final ObjectMapper mapper;

    public GlobalExceptionHandler(ObjectMapper mapper) {
        this.mapper = mapper;
    }

    @ExceptionHandler(NotFoundException.class)
    public void handleNotFound(NotFoundException ex, HttpServletRequest request, HttpServletResponse response) throws IOException {
        ApiError err = new ApiError(
                HttpStatus.NOT_FOUND.value(),
                HttpStatus.NOT_FOUND.getReasonPhrase(),
                ex.getMessage(),
                Map.of("path", request.getRequestURI())
        );
        writeResponse(response, HttpStatus.NOT_FOUND.value(), err);
    }

    @ExceptionHandler(BadRequestException.class)
    public void handleBadRequest(BadRequestException ex, HttpServletRequest request, HttpServletResponse response) throws IOException {
        ApiError err = new ApiError(
                HttpStatus.BAD_REQUEST.value(),
                HttpStatus.BAD_REQUEST.getReasonPhrase(),
                ex.getMessage(),
                Map.of("path", request.getRequestURI())
        );
        writeResponse(response, HttpStatus.BAD_REQUEST.value(), err);
    }

    @ExceptionHandler(UnauthorizedException.class)
    public void handleUnauthorized(UnauthorizedException ex, HttpServletRequest request, HttpServletResponse response) throws IOException {
        ApiError err = new ApiError(
                HttpStatus.UNAUTHORIZED.value(),
                HttpStatus.UNAUTHORIZED.getReasonPhrase(),
                ex.getMessage(),
                Map.of("path", request.getRequestURI())
        );
        writeResponse(response, HttpStatus.UNAUTHORIZED.value(), err);
    }

    // handle ResponseStatusException (e.g., thrown with 409)
    @ExceptionHandler(ResponseStatusException.class)
    public void handleResponseStatusException(ResponseStatusException ex,
                                              HttpServletRequest request, HttpServletResponse response) throws IOException {
        int status = ex.getStatusCode().value();
        // Convert numeric status to HttpStatus to get reason phrase
        String reason = HttpStatus.valueOf(status).getReasonPhrase();

        ApiError err = new ApiError(
                status,
                reason,
                ex.getReason(),
                Map.of("path", request.getRequestURI())
        );
        writeResponse(response, status, err);
    }

    @ExceptionHandler(Exception.class)
    public void handleAll(Exception ex, HttpServletRequest request, HttpServletResponse response) throws IOException {
        log.error("Unhandled exception", ex);
        ApiError err = new ApiError(
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                HttpStatus.INTERNAL_SERVER_ERROR.getReasonPhrase(),
                ex.getMessage() == null ? "An unexpected error occurred" : ex.getMessage(),
                Map.of("path", request.getRequestURI())
        );
        writeResponse(response, HttpStatus.INTERNAL_SERVER_ERROR.value(), err);
    }

    private void writeResponse(HttpServletResponse response, int status, ApiError err) throws IOException {
        response.setStatus(status);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.getWriter().write(mapper.writeValueAsString(err));
    }
}
