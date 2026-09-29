package com.example.attendease.config;

import com.example.attendease.entity.*;
import com.example.attendease.repository.AttendanceRecordRepository;
import com.example.attendease.repository.SessionRepository;
import com.example.attendease.repository.StudentRepository;
import com.example.attendease.repository.SubjectRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    private final StudentRepository studentRepository;
    private final SubjectRepository subjectRepository;
    private final SessionRepository sessionRepository;
    private final AttendanceRecordRepository attendanceRecordRepository;

    public DataInitializer(StudentRepository studentRepository,
                           SubjectRepository subjectRepository,
                           SessionRepository sessionRepository,
                           AttendanceRecordRepository attendanceRecordRepository) {
        this.studentRepository = studentRepository;
        this.subjectRepository = subjectRepository;
        this.sessionRepository = sessionRepository;
        this.attendanceRecordRepository = attendanceRecordRepository;
    }

    @Override
    public void run(String... args) {
        if (studentRepository.count() > 0) {
            logger.info("Database already initialized with data. Skipping seed.");
            return;
        }

        logger.info("Initializing AttendEase sample data...");

        // 1. Seed 10 Students
        List<Student> students = Arrays.asList(
                new Student("23CS001", "Arun Kumar", "arun.k@college.edu", "Computer Science", 3),
                new Student("23CS002", "Priya Sharma", "priya.s@college.edu", "Computer Science", 3),
                new Student("23CS003", "Rahul Verma", "rahul.v@college.edu", "Computer Science", 3),
                new Student("23CS004", "Ananya Roy", "ananya.r@college.edu", "Computer Science", 3),
                new Student("23CS005", "Sneha Patil", "sneha.p@college.edu", "Computer Science", 3),
                new Student("23IT001", "Karthik Nair", "karthik.n@college.edu", "Information Technology", 3),
                new Student("23IT002", "Divya Krishnan", "divya.k@college.edu", "Information Technology", 3),
                new Student("23EC001", "Vikram Singh", "vikram.s@college.edu", "Electronics", 2),
                new Student("23EC002", "Pooja Patel", "pooja.p@college.edu", "Electronics", 2),
                new Student("23ME001", "Rohan Mehta", "rohan.m@college.edu", "Mechanical", 2)
        );
        students = studentRepository.saveAll(students);

        // 2. Seed 3 Subjects
        Subject javaSub = new Subject("CS301", "Java Programming", "Computer Science");
        Subject dbmsSub = new Subject("CS302", "Database Management Systems", "Computer Science");
        Subject webSub = new Subject("IT301", "Web Technologies", "Information Technology");
        List<Subject> subjects = subjectRepository.saveAll(Arrays.asList(javaSub, dbmsSub, webSub));
        Subject javaSubject = subjects.get(0);
        Subject dbmsSubject = subjects.get(1);

        // 3. Seed 6 Sessions (5 for Java, 1 for DBMS)
        LocalDate baseDate = LocalDate.now().minusDays(7);
        List<Session> sessions = Arrays.asList(
                new Session(baseDate.plusDays(1), LocalTime.of(9, 0), LocalTime.of(10, 0), javaSubject),
                new Session(baseDate.plusDays(2), LocalTime.of(10, 0), LocalTime.of(11, 0), javaSubject),
                new Session(baseDate.plusDays(3), LocalTime.of(9, 0), LocalTime.of(10, 0), javaSubject),
                new Session(baseDate.plusDays(4), LocalTime.of(11, 0), LocalTime.of(12, 0), javaSubject),
                new Session(baseDate.plusDays(5), LocalTime.of(14, 0), LocalTime.of(15, 0), javaSubject),
                new Session(baseDate.plusDays(6), LocalTime.of(10, 0), LocalTime.of(11, 0), dbmsSubject)
        );
        sessions = sessionRepository.saveAll(sessions);

        // 4. Seed Attendance Records for Java sessions (5 sessions)
        // Presence pattern for the 10 students across 5 sessions:
        // Student 0: 5/5 = 100% -> No shortage
        // Student 1: 4/5 = 80%  -> No shortage
        // Student 2: 3/5 = 60%  -> Shortage!
        // Student 3: 2/5 = 40%  -> Shortage!
        // Student 4: 4/5 = 80%  -> No shortage
        // Student 5: 1/5 = 20%  -> Shortage!
        // Student 6: 5/5 = 100% -> No shortage
        // Student 7: 3/5 = 60%  -> Shortage!
        // Student 8: 4/5 = 80%  -> No shortage
        // Student 9: 0/5 = 0%   -> Shortage!
        int[] presentCounts = {5, 4, 3, 2, 4, 1, 5, 3, 4, 0};

        List<AttendanceRecord> records = new ArrayList<>();
        LocalDateTime markedTime = LocalDateTime.now().minusDays(1);

        for (int sIndex = 0; sIndex < 5; sIndex++) {
            Session currentSession = sessions.get(sIndex);
            for (int studIndex = 0; studIndex < students.size(); studIndex++) {
                Student currentStudent = students.get(studIndex);
                int countNeeded = presentCounts[studIndex];
                AttendanceStatus status = (sIndex < countNeeded) ? AttendanceStatus.PRESENT : AttendanceStatus.ABSENT;
                records.add(new AttendanceRecord(currentStudent, currentSession, status, markedTime));
            }
        }

        // Also mark session 6 (DBMS) for first 5 students (all present)
        Session dbmsSession = sessions.get(5);
        for (int studIndex = 0; studIndex < 5; studIndex++) {
            records.add(new AttendanceRecord(students.get(studIndex), dbmsSession, AttendanceStatus.PRESENT, markedTime));
        }

        attendanceRecordRepository.saveAll(records);
        logger.info("Sample data initialized successfully with {} students, {} subjects, {} sessions, and {} attendance records.",
                students.size(), subjects.size(), sessions.size(), records.size());
    }
}
