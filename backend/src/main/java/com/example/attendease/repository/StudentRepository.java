package com.example.attendease.repository;

import com.example.attendease.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {
    Optional<Student> findByRollNumber(String rollNumber);
    boolean existsByRollNumber(String rollNumber);
    boolean existsByRollNumberAndIdNot(String rollNumber, Long id);
    Optional<Student> findByEmail(String email);
    boolean existsByEmailAndIdNot(String email, Long id);
}
