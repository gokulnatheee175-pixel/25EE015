package com.example.attendease.repository;

import com.example.attendease.entity.Session;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface SessionRepository extends JpaRepository<Session, Long> {
    List<Session> findBySubjectId(Long subjectId);
    List<Session> findBySessionDate(LocalDate sessionDate);
    List<Session> findBySubjectIdOrderBySessionDateDescStartTimeDesc(Long subjectId);
    List<Session> findAllByOrderBySessionDateDescStartTimeDesc();
}
