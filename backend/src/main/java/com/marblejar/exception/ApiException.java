package com.marblejar.exception;

public class ApiException extends RuntimeException {
    public ApiException(String msg) { super(msg); }
}
