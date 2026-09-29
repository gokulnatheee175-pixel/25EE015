package com.example.attendease.dto;

import com.example.attendease.entity.AttendanceStatus;
import jakarta.validation.constraints.NotNull;

public class AttendanceRequestDTO {

    @NotNull(message = "Student ID is required")
    private Long studentId;

    @NotNull(message = "Session ID is required")
    private Long sessionId;

    @NotNull(message = "Attendance status is required (PRESENT or ABSENT)")
    private AttendanceStatus status;

    public AttendanceRequestDTO() {
    }

    public AttendanceRequestDTO(Long studentId, Long sessionId, AttendanceStatus status) {
        this.studentId = studentId;
        this.sessionId = sessionId;
        this.status = status;
    }

    public Long getStudentId() {
        return studentId;
    }

    public void setStudentId(Long studentId) {
        this.studentId = studentId;
    }

    public Long getSessionId() {
        return sessionId;
    }

    public void setSessionId(Long sessionId) {
        this.sessionId = sessionId;
    }

    public AttendanceStatus getStatus() {
        return status;
    }

    public void setStatus(AttendanceStatus status) {
        this.status = status;
    }
}
