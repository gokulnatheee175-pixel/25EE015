package com.example.attendease.service;

import com.example.attendease.dto.StudentDTO;
import com.example.attendease.entity.Student;
import com.example.attendease.exception.ResourceNotFoundException;
import com.example.attendease.repository.StudentRepository;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class StudentService {

    private final StudentRepository studentRepository;

    public StudentService(StudentRepository studentRepository) {
        this.studentRepository = studentRepository;
    }

    public StudentDTO createStudent(StudentDTO dto) {
        if (studentRepository.existsByRollNumber(dto.getRollNumber().trim())) {
            throw new IllegalArgumentException("Student with roll number '" + dto.getRollNumber() + "' already exists");
        }
        Student student = new Student(
                dto.getRollNumber().trim(),
                dto.getName().trim(),
                dto.getEmail().trim(),
                dto.getDepartment().trim(),
                dto.getYear()
        );
        Student saved = studentRepository.save(student);
        return mapToDTO(saved);
    }

    @Transactional(readOnly = true)
    public List<StudentDTO> getAllStudents() {
        return studentRepository.findAll(Sort.by(Sort.Direction.ASC, "rollNumber"))
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public StudentDTO getStudentById(Long id) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + id));
        return mapToDTO(student);
    }

    public StudentDTO updateStudent(Long id, StudentDTO dto) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + id));

        if (studentRepository.existsByRollNumberAndIdNot(dto.getRollNumber().trim(), id)) {
            throw new IllegalArgumentException("Another student with roll number '" + dto.getRollNumber() + "' already exists");
        }

        student.setRollNumber(dto.getRollNumber().trim());
        student.setName(dto.getName().trim());
        student.setEmail(dto.getEmail().trim());
        student.setDepartment(dto.getDepartment().trim());
        student.setYear(dto.getYear());

        Student updated = studentRepository.save(student);
        return mapToDTO(updated);
    }

    public void deleteStudent(Long id) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + id));
        studentRepository.delete(student);
    }

    private StudentDTO mapToDTO(Student student) {
        return new StudentDTO(
                student.getId(),
                student.getRollNumber(),
                student.getName(),
                student.getEmail(),
                student.getDepartment(),
                student.getYear()
        );
    }
}
