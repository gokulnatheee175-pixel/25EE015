package com.example.attendease.service;

import com.example.attendease.dto.*;
import com.example.attendease.entity.*;
import com.example.attendease.exception.DuplicateAttendanceException;
import com.example.attendease.exception.InvalidAttendanceException;
import com.example.attendease.exception.ResourceNotFoundException;
import com.example.attendease.repository.AttendanceRecordRepository;
import com.example.attendease.repository.SessionRepository;
import com.example.attendease.repository.StudentRepository;
import com.example.attendease.repository.SubjectRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class AttendanceService {

    private final AttendanceRecordRepository attendanceRecordRepository;
    private final StudentRepository studentRepository;
    private final SessionRepository sessionRepository;
    private final SubjectRepository subjectRepository;

    @Value("${attendance.minimum-threshold:75}")
    private double minimumThreshold;

    public AttendanceService(AttendanceRecordRepository attendanceRecordRepository,
                             StudentRepository studentRepository,
                             SessionRepository sessionRepository,
                             SubjectRepository subjectRepository) {
        this.attendanceRecordRepository = attendanceRecordRepository;
        this.studentRepository = studentRepository;
        this.sessionRepository = sessionRepository;
        this.subjectRepository = subjectRepository;
    }

    public double getMinimumThreshold() {
        return minimumThreshold;
    }

    /**
     * Mark single student attendance
     */
    public AttendanceResponseDTO markAttendance(AttendanceRequestDTO request) {
        if (request.getStatus() == null) {
            throw new InvalidAttendanceException("Attendance status is required (PRESENT or ABSENT)");
        }

        Student student = studentRepository.findById(request.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + request.getStudentId()));

        Session session = sessionRepository.findById(request.getSessionId())
                .orElseThrow(() -> new ResourceNotFoundException("Session not found with id: " + request.getSessionId()));

        // Check if attendance already exists for this student and session
        if (attendanceRecordRepository.existsByStudentIdAndSessionId(student.getId(), session.getId())) {
            throw new DuplicateAttendanceException("Attendance already marked for this student in this session");
        }

        AttendanceRecord record = new AttendanceRecord(
                student,
                session,
                request.getStatus(),
                LocalDateTime.now()
        );

        AttendanceRecord saved = attendanceRecordRepository.save(record);
        return mapToDTO(saved);
    }

    /**
     * Mark bulk attendance for an entire session
     */
    public List<AttendanceResponseDTO> markBulkAttendance(Long sessionId, List<BulkAttendanceItemDTO> items) {
        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Session not found with id: " + sessionId));

        if (items == null || items.isEmpty()) {
            throw new InvalidAttendanceException("Attendance list cannot be empty");
        }

        // Validate duplicates within the batch payload itself
        Set<Long> seenStudentIds = new HashSet<>();
        for (BulkAttendanceItemDTO item : items) {
            if (item.getStudentId() == null) {
                throw new InvalidAttendanceException("Student ID cannot be null in attendance list");
            }
            if (item.getStatus() == null) {
                throw new InvalidAttendanceException("Attendance status cannot be null for student ID: " + item.getStudentId());
            }
            if (!seenStudentIds.add(item.getStudentId())) {
                throw new InvalidAttendanceException("Duplicate student ID " + item.getStudentId() + " in bulk request");
            }
        }

        List<AttendanceResponseDTO> results = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();

        for (BulkAttendanceItemDTO item : items) {
            Student student = studentRepository.findById(item.getStudentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + item.getStudentId()));

            Optional<AttendanceRecord> existingOpt = attendanceRecordRepository
                    .findByStudentIdAndSessionId(student.getId(), session.getId());

            AttendanceRecord record;
            if (existingOpt.isPresent()) {
                // If record exists, update status cleanly without creating duplicate
                record = existingOpt.get();
                record.setStatus(item.getStatus());
                record.setMarkedAt(now);
            } else {
                record = new AttendanceRecord(student, session, item.getStatus(), now);
            }

            AttendanceRecord saved = attendanceRecordRepository.save(record);
            results.add(mapToDTO(saved));
        }

        return results;
    }

    /**
     * Faculty correction of an existing attendance record
     */
    public AttendanceResponseDTO updateAttendance(Long attendanceId, AttendanceStatus newStatus) {
        if (newStatus == null) {
            throw new InvalidAttendanceException("Attendance status is required (PRESENT or ABSENT)");
        }

        AttendanceRecord record = attendanceRecordRepository.findById(attendanceId)
                .orElseThrow(() -> new ResourceNotFoundException("Attendance record not found with id: " + attendanceId));

        record.setStatus(newStatus);
        record.setMarkedAt(LocalDateTime.now());

        AttendanceRecord updated = attendanceRecordRepository.save(record);
        return mapToDTO(updated);
    }

    /**
     * Delete attendance record
     */
    public void deleteAttendance(Long attendanceId) {
        AttendanceRecord record = attendanceRecordRepository.findById(attendanceId)
                .orElseThrow(() -> new ResourceNotFoundException("Attendance record not found with id: " + attendanceId));
        attendanceRecordRepository.delete(record);
    }

    /**
     * Get attendance records for a specific session
     */
    @Transactional(readOnly = true)
    public List<AttendanceResponseDTO> getAttendanceBySession(Long sessionId) {
        if (!sessionRepository.existsById(sessionId)) {
            throw new ResourceNotFoundException("Session not found with id: " + sessionId);
        }
        return attendanceRecordRepository.findBySessionIdOrderByStudentRollNumberAsc(sessionId)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get all attendance records for a specific student
     */
    @Transactional(readOnly = true)
    public List<AttendanceResponseDTO> getAttendanceRecordsByStudent(Long studentId) {
        if (!studentRepository.existsById(studentId)) {
            throw new ResourceNotFoundException("Student not found with id: " + studentId);
        }
        return attendanceRecordRepository.findByStudentId(studentId)
                .stream()
                .map(this::mapToDTO)
                .sorted((a, b) -> b.getSessionDate().compareTo(a.getSessionDate()))
                .collect(Collectors.toList());
    }

    /**
     * View attendance summary for a specific student across subjects (or optional subject filter)
     */
    @Transactional(readOnly = true)
    public List<StudentAttendanceSummaryDTO> getStudentAttendance(Long studentId, Long subjectId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + studentId));

        List<Subject> subjects;
        if (subjectId != null) {
            Subject subject = subjectRepository.findById(subjectId)
                    .orElseThrow(() -> new ResourceNotFoundException("Subject not found with id: " + subjectId));
            subjects = Collections.singletonList(subject);
        } else {
            subjects = subjectRepository.findAll();
        }

        List<StudentAttendanceSummaryDTO> summaries = new ArrayList<>();

        for (Subject subject : subjects) {
            List<Session> subjectSessions = sessionRepository.findBySubjectId(subject.getId());
            int totalClasses = subjectSessions.size();

            // Total marked records for this student and subject
            long presentCount = attendanceRecordRepository.countByStudentIdAndSessionSubjectIdAndStatus(
                    student.getId(), subject.getId(), AttendanceStatus.PRESENT);
            long absentCount = attendanceRecordRepository.countByStudentIdAndSessionSubjectIdAndStatus(
                    student.getId(), subject.getId(), AttendanceStatus.ABSENT);

            // If classes were conducted, calculate percentage
            double percentage = 0.0;
            if (totalClasses > 0) {
                percentage = calculatePercentage(presentCount, totalClasses);
            }

            boolean shortage = (totalClasses > 0) && (percentage < minimumThreshold);

            summaries.add(new StudentAttendanceSummaryDTO(
                    student.getId(),
                    student.getName(),
                    student.getRollNumber(),
                    student.getDepartment(),
                    subject.getId(),
                    subject.getSubjectCode(),
                    subject.getSubjectName(),
                    totalClasses,
                    (int) presentCount,
                    (int) absentCount,
                    percentage,
                    shortage
            ));
        }

        return summaries;
    }

    /**
     * Get all students with attendance shortage (< threshold)
     */
    @Transactional(readOnly = true)
    public List<ShortageStudentDTO> getShortageStudents(Long subjectId) {
        List<Student> students = studentRepository.findAll();
        List<Subject> subjects;

        if (subjectId != null) {
            Subject subject = subjectRepository.findById(subjectId)
                    .orElseThrow(() -> new ResourceNotFoundException("Subject not found with id: " + subjectId));
            subjects = Collections.singletonList(subject);
        } else {
            subjects = subjectRepository.findAll();
        }

        List<ShortageStudentDTO> shortageList = new ArrayList<>();

        for (Subject subject : subjects) {
            List<Session> subjectSessions = sessionRepository.findBySubjectId(subject.getId());
            int totalClasses = subjectSessions.size();

            // Only consider subjects where classes have actually been conducted
            if (totalClasses == 0) {
                continue;
            }

            for (Student student : students) {
                long presentCount = attendanceRecordRepository.countByStudentIdAndSessionSubjectIdAndStatus(
                        student.getId(), subject.getId(), AttendanceStatus.PRESENT);
                long absentCount = attendanceRecordRepository.countByStudentIdAndSessionSubjectIdAndStatus(
                        student.getId(), subject.getId(), AttendanceStatus.ABSENT);

                double percentage = calculatePercentage(presentCount, totalClasses);

                if (percentage < minimumThreshold) {
                    shortageList.add(new ShortageStudentDTO(
                            student.getId(),
                            student.getRollNumber(),
                            student.getName(),
                            subject.getId(),
                            subject.getSubjectCode(),
                            subject.getSubjectName(),
                            totalClasses,
                            (int) presentCount,
                            (int) absentCount,
                            percentage,
                            true
                    ));
                }
            }
        }

        // Sort by percentage ascending
        shortageList.sort(Comparator.comparingDouble(ShortageStudentDTO::getPercentage));
        return shortageList;
    }

    /**
     * Helper to round percentage to 2 decimal places
     */
    public double calculatePercentage(long present, long total) {
        if (total == 0) {
            return 0.0;
        }
        double raw = ((double) present / total) * 100.0;
        BigDecimal bd = BigDecimal.valueOf(raw).setScale(2, RoundingMode.HALF_UP);
        return bd.doubleValue();
    }

    public AttendanceResponseDTO mapToDTO(AttendanceRecord record) {
        return new AttendanceResponseDTO(
                record.getId(),
                record.getStudent().getId(),
                record.getStudent().getRollNumber(),
                record.getStudent().getName(),
                record.getSession().getId(),
                record.getSession().getSessionDate(),
                record.getSession().getSubject().getId(),
                record.getSession().getSubject().getSubjectCode(),
                record.getSession().getSubject().getSubjectName(),
                record.getStatus(),
                record.getMarkedAt()
        );
    }
}
