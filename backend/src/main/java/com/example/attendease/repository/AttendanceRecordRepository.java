package com.example.attendease.repository;

import com.example.attendease.entity.AttendanceRecord;
import com.example.attendease.entity.AttendanceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRecordRepository extends JpaRepository<AttendanceRecord, Long> {
    boolean existsByStudentIdAndSessionId(Long studentId, Long sessionId);
    List<AttendanceRecord> findByStudentId(Long studentId);
    List<AttendanceRecord> findBySessionId(Long sessionId);
    Optional<AttendanceRecord> findByStudentIdAndSessionId(Long studentId, Long sessionId);
    long countByStudentIdAndStatus(Long studentId, AttendanceStatus status);
    long countByStudentId(Long studentId);
    long countByStudentIdAndSessionSubjectId(Long studentId, Long subjectId);
    long countByStudentIdAndSessionSubjectIdAndStatus(Long studentId, Long subjectId, AttendanceStatus status);
    List<AttendanceRecord> findByStudentIdAndSessionSubjectId(Long studentId, Long subjectId);
    List<AttendanceRecord> findBySessionIdOrderByStudentRollNumberAsc(Long sessionId);
}
