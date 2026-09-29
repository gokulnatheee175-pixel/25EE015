package com.example.attendease.controller;

import com.example.attendease.dto.*;
import com.example.attendease.service.AttendanceService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/attendance")
@CrossOrigin(origins = "*")
public class AttendanceController {

    private final AttendanceService attendanceService;

    public AttendanceController(AttendanceService attendanceService) {
        this.attendanceService = attendanceService;
    }

    /**
     * Mark single student attendance
     * POST /api/attendance
     */
    @PostMapping
    public ResponseEntity<AttendanceResponseDTO> markAttendance(@Valid @RequestBody AttendanceRequestDTO request) {
        AttendanceResponseDTO response = attendanceService.markAttendance(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    /**
     * Mark bulk attendance for an entire session
     * POST /api/attendance/session/{sessionId}
     */
    @PostMapping("/session/{sessionId}")
    public ResponseEntity<List<AttendanceResponseDTO>> markBulkAttendance(
            @PathVariable Long sessionId,
            @Valid @RequestBody List<BulkAttendanceItemDTO> items) {
        List<AttendanceResponseDTO> responses = attendanceService.markBulkAttendance(sessionId, items);
        return new ResponseEntity<>(responses, HttpStatus.CREATED);
    }

    /**
     * Get attendance records for a session
     * GET /api/attendance/session/{sessionId}
     */
    @GetMapping("/session/{sessionId}")
    public ResponseEntity<List<AttendanceResponseDTO>> getAttendanceBySession(@PathVariable Long sessionId) {
        List<AttendanceResponseDTO> responses = attendanceService.getAttendanceBySession(sessionId);
        return ResponseEntity.ok(responses);
    }

    /**
     * View attendance summary for a student across subjects (or by subject)
     * GET /api/attendance/student/{studentId}
     */
    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<StudentAttendanceSummaryDTO>> getStudentAttendance(
            @PathVariable Long studentId,
            @RequestParam(required = false) Long subjectId) {
        List<StudentAttendanceSummaryDTO> summaries = attendanceService.getStudentAttendance(studentId, subjectId);
        return ResponseEntity.ok(summaries);
    }

    /**
     * Get all attendance logs/history for a student
     * GET /api/attendance/records/student/{studentId}
     */
    @GetMapping("/records/student/{studentId}")
    public ResponseEntity<List<AttendanceResponseDTO>> getAttendanceRecordsByStudent(@PathVariable Long studentId) {
        List<AttendanceResponseDTO> records = attendanceService.getAttendanceRecordsByStudent(studentId);
        return ResponseEntity.ok(records);
    }

    /**
     * Get shortage students (< threshold)
     * GET /api/attendance/shortage
     */
    @GetMapping("/shortage")
    public ResponseEntity<List<ShortageStudentDTO>> getShortageStudents(
            @RequestParam(required = false) Long subjectId) {
        List<ShortageStudentDTO> shortageList = attendanceService.getShortageStudents(subjectId);
        return ResponseEntity.ok(shortageList);
    }

    /**
     * Faculty correction of an existing attendance record
     * PUT /api/attendance/{attendanceId}
     */
    @PutMapping("/{attendanceId}")
    public ResponseEntity<AttendanceResponseDTO> updateAttendance(
            @PathVariable Long attendanceId,
            @Valid @RequestBody AttendanceUpdateDTO updateDTO) {
        AttendanceResponseDTO updated = attendanceService.updateAttendance(attendanceId, updateDTO.getStatus());
        return ResponseEntity.ok(updated);
    }

    /**
     * Delete attendance record
     * DELETE /api/attendance/{attendanceId}
     */
    @DeleteMapping("/{attendanceId}")
    public ResponseEntity<Void> deleteAttendance(@PathVariable Long attendanceId) {
        attendanceService.deleteAttendance(attendanceId);
        return ResponseEntity.noContent().build();
    }
}
