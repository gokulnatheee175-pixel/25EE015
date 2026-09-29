package com.example.attendease;

import com.example.attendease.dto.AttendanceRequestDTO;
import com.example.attendease.dto.AttendanceResponseDTO;
import com.example.attendease.dto.SessionDTO;
import com.example.attendease.entity.*;
import com.example.attendease.exception.DuplicateAttendanceException;
import com.example.attendease.exception.InvalidAttendanceException;
import com.example.attendease.exception.ResourceNotFoundException;
import com.example.attendease.repository.AttendanceRecordRepository;
import com.example.attendease.repository.SessionRepository;
import com.example.attendease.repository.StudentRepository;
import com.example.attendease.repository.SubjectRepository;
import com.example.attendease.service.AttendanceService;
import com.example.attendease.service.SessionService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
class AttendEaseApplicationTests {

    @Autowired
    private AttendanceService attendanceService;

    @Autowired
    private SessionService sessionService;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private SubjectRepository subjectRepository;

    @Autowired
    private SessionRepository sessionRepository;

    @Autowired
    private AttendanceRecordRepository attendanceRecordRepository;

    @Test
    @DisplayName("Context loads successfully")
    void contextLoads() {
        assertNotNull(attendanceService);
        assertNotNull(studentRepository);
        assertNotNull(subjectRepository);
    }

    @Test
    @DisplayName("TEST 1: Mark attendance once - Success 201 Created")
    void test1_markAttendanceOnce() {
        Student student = studentRepository.save(new Student("TEST001", "Test Student", "test@test.com", "CS", 1));
        Subject subject = subjectRepository.save(new Subject("TEST101", "Test Subject", "CS"));
        Session session = sessionRepository.save(new Session(LocalDate.now(), LocalTime.of(9, 0), LocalTime.of(10, 0), subject));

        AttendanceRequestDTO request = new AttendanceRequestDTO(student.getId(), session.getId(), AttendanceStatus.PRESENT);
        AttendanceResponseDTO response = attendanceService.markAttendance(request);

        assertNotNull(response);
        assertEquals(AttendanceStatus.PRESENT, response.getStatus());
        assertEquals(student.getId(), response.getStudentId());
        assertEquals(session.getId(), response.getSessionId());
    }

    @Test
    @DisplayName("TEST 2: Mark attendance again for same student + same session - 409 Conflict")
    void test2_duplicateAttendanceThrowsException() {
        Student student = studentRepository.save(new Student("TEST002", "Test Student 2", "test2@test.com", "CS", 1));
        Subject subject = subjectRepository.save(new Subject("TEST102", "Test Subject 2", "CS"));
        Session session = sessionRepository.save(new Session(LocalDate.now(), LocalTime.of(9, 0), LocalTime.of(10, 0), subject));

        AttendanceRequestDTO request1 = new AttendanceRequestDTO(student.getId(), session.getId(), AttendanceStatus.PRESENT);
        attendanceService.markAttendance(request1);

        AttendanceRequestDTO request2 = new AttendanceRequestDTO(student.getId(), session.getId(), AttendanceStatus.ABSENT);
        assertThrows(DuplicateAttendanceException.class, () -> attendanceService.markAttendance(request2));
    }

    @Test
    @DisplayName("TEST 3: Student attendance percentage is below 75% - shortage = true")
    void test3_percentageBelow75ShortageTrue() {
        double percentage = attendanceService.calculatePercentage(2, 5); // 40.0%
        assertEquals(40.0, percentage, 0.001);
        boolean isShortage = percentage < attendanceService.getMinimumThreshold();
        assertTrue(isShortage, "40% should trigger shortage true");
    }

    @Test
    @DisplayName("TEST 4: Student attendance percentage is 75% or above - shortage = false")
    void test4_percentage75OrAboveShortageFalse() {
        double percentage80 = attendanceService.calculatePercentage(4, 5); // 80.0%
        assertEquals(80.0, percentage80, 0.001);
        assertFalse(percentage80 < attendanceService.getMinimumThreshold(), "80% should not trigger shortage");

        double percentage75 = attendanceService.calculatePercentage(3, 4); // 75.0%
        assertEquals(75.0, percentage75, 0.001);
        assertFalse(percentage75 < attendanceService.getMinimumThreshold(), "75% should not trigger shortage");
    }

    @Test
    @DisplayName("TEST 5: Faculty updates old attendance - Existing record is updated")
    void test5_facultyUpdatesAttendance() {
        Student student = studentRepository.save(new Student("TEST005", "Test Student 5", "test5@test.com", "CS", 1));
        Subject subject = subjectRepository.save(new Subject("TEST105", "Test Subject 5", "CS"));
        Session session = sessionRepository.save(new Session(LocalDate.now(), LocalTime.of(9, 0), LocalTime.of(10, 0), subject));

        AttendanceResponseDTO initial = attendanceService.markAttendance(
                new AttendanceRequestDTO(student.getId(), session.getId(), AttendanceStatus.ABSENT));
        assertEquals(AttendanceStatus.ABSENT, initial.getStatus());

        AttendanceResponseDTO updated = attendanceService.updateAttendance(initial.getId(), AttendanceStatus.PRESENT);
        assertEquals(AttendanceStatus.PRESENT, updated.getStatus());
        assertEquals(initial.getId(), updated.getId(), "Record ID must remain identical");
    }

    @Test
    @DisplayName("TEST 6: Invalid student ID - 404 NOT FOUND")
    void test6_invalidStudentIdThrowsResourceNotFound() {
        Subject subject = subjectRepository.save(new Subject("TEST106", "Test Subject 6", "CS"));
        Session session = sessionRepository.save(new Session(LocalDate.now(), LocalTime.of(9, 0), LocalTime.of(10, 0), subject));

        AttendanceRequestDTO request = new AttendanceRequestDTO(999999L, session.getId(), AttendanceStatus.PRESENT);
        assertThrows(ResourceNotFoundException.class, () -> attendanceService.markAttendance(request));
    }

    @Test
    @DisplayName("TEST 7: Invalid session ID - 404 NOT FOUND")
    void test7_invalidSessionIdThrowsResourceNotFound() {
        Student student = studentRepository.save(new Student("TEST007", "Test Student 7", "test7@test.com", "CS", 1));

        AttendanceRequestDTO request = new AttendanceRequestDTO(student.getId(), 999999L, AttendanceStatus.PRESENT);
        assertThrows(ResourceNotFoundException.class, () -> attendanceService.markAttendance(request));
    }

    @Test
    @DisplayName("TEST 8: Invalid attendance status - 400 BAD REQUEST")
    void test8_invalidAttendanceStatusThrowsException() {
        Student student = studentRepository.save(new Student("TEST008", "Test Student 8", "test8@test.com", "CS", 1));
        Subject subject = subjectRepository.save(new Subject("TEST108", "Test Subject 8", "CS"));
        Session session = sessionRepository.save(new Session(LocalDate.now(), LocalTime.of(9, 0), LocalTime.of(10, 0), subject));

        AttendanceRequestDTO request = new AttendanceRequestDTO(student.getId(), session.getId(), null);
        assertThrows(InvalidAttendanceException.class, () -> attendanceService.markAttendance(request));
    }

    @Test
    @DisplayName("TEST 9: End time before start time - 400 BAD REQUEST")
    void test9_endTimeBeforeStartTimeThrowsException() {
        Subject subject = subjectRepository.save(new Subject("TEST109", "Test Subject 9", "CS"));

        SessionDTO invalidSession = new SessionDTO(
                null,
                subject.getId(),
                subject.getSubjectCode(),
                subject.getSubjectName(),
                subject.getDepartment(),
                LocalDate.now(),
                LocalTime.of(11, 0),
                LocalTime.of(10, 0) // End time before start time!
        );

        assertThrows(InvalidAttendanceException.class, () -> sessionService.createSession(invalidSession));
    }
}
