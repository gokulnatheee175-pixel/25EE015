package com.example.attendease.exception;

public class InvalidAttendanceException extends RuntimeException {
    public InvalidAttendanceException(String message) {
        super(message);
    }
}
