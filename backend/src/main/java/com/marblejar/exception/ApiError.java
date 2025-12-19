package com.marblejar.exception;

import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.Instant;
import java.util.Map;

public class ApiError {

    private int status;
    private String error;
    private String message;

    @JsonFormat(shape = JsonFormat.Shape.STRING)
    private Instant timestamp = Instant.now();

    private Map<String, Object> details;

    public ApiError() {}

    public ApiError(int status, String error, String message, Map<String, Object> details) {
        this.status = status;
        this.error = error;
        this.message = message;
        this.timestamp = Instant.now();
        this.details = details;
    }

    // getters / setters
    public int getStatus() { return status; }
    public void setStatus(int status) { this.status = status; }

    public String getError() { return error; }
    public void setError(String error) { this.error = error; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public Instant getTimestamp() { return timestamp; }
    public void setTimestamp(Instant timestamp) { this.timestamp = timestamp; }

    public Map<String, Object> getDetails() { return details; }
    public void setDetails(Map<String, Object> details) { this.details = details; }
}
