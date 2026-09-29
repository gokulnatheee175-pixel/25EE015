package com.example.attendease.service;

import com.example.attendease.dto.DashboardDTO;
import com.example.attendease.dto.ShortageStudentDTO;
import com.example.attendease.repository.AttendanceRecordRepository;
import com.example.attendease.repository.SessionRepository;
import com.example.attendease.repository.StudentRepository;
import com.example.attendease.repository.SubjectRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class DashboardService {

    private final StudentRepository studentRepository;
    private final SubjectRepository subjectRepository;
    private final SessionRepository sessionRepository;
    private final AttendanceRecordRepository attendanceRecordRepository;
    private final AttendanceService attendanceService;

    public DashboardService(StudentRepository studentRepository,
                            SubjectRepository subjectRepository,
                            SessionRepository sessionRepository,
                            AttendanceRecordRepository attendanceRecordRepository,
                            AttendanceService attendanceService) {
        this.studentRepository = studentRepository;
        this.subjectRepository = subjectRepository;
        this.sessionRepository = sessionRepository;
        this.attendanceRecordRepository = attendanceRecordRepository;
        this.attendanceService = attendanceService;
    }

    public DashboardDTO getDashboardStats() {
        long totalStudents = studentRepository.count();
        long totalSubjects = subjectRepository.count();
        long totalSessions = sessionRepository.count();
        long totalAttendanceRecords = attendanceRecordRepository.count();

        List<ShortageStudentDTO> shortageList = attendanceService.getShortageStudents(null);
        // Unique student count with shortage in at least one subject
        long shortageStudents = shortageList.stream()
                .map(ShortageStudentDTO::getStudentId)
                .distinct()
                .count();

        return new DashboardDTO(
                totalStudents,
                totalSubjects,
                totalSessions,
                totalAttendanceRecords,
                shortageStudents
        );
    }
}
