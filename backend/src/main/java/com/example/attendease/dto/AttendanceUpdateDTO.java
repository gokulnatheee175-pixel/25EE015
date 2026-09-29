package com.example.attendease.dto;

import com.example.attendease.entity.AttendanceStatus;
import jakarta.validation.constraints.NotNull;

public class AttendanceUpdateDTO {

    @NotNull(message = "Attendance status is required (PRESENT or ABSENT)")
    private AttendanceStatus status;

    public AttendanceUpdateDTO() {
    }

    public AttendanceUpdateDTO(AttendanceStatus status) {
        this.status = status;
    }

    public AttendanceStatus getStatus() {
        return status;
    }

    public void setStatus(AttendanceStatus status) {
        this.status = status;
    }
}
