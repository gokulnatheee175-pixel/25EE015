package com.example.attendease.service;

import com.example.attendease.dto.SessionDTO;
import com.example.attendease.entity.Session;
import com.example.attendease.entity.Subject;
import com.example.attendease.exception.InvalidAttendanceException;
import com.example.attendease.exception.ResourceNotFoundException;
import com.example.attendease.repository.SessionRepository;
import com.example.attendease.repository.SubjectRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class SessionService {

    private final SessionRepository sessionRepository;
    private final SubjectRepository subjectRepository;

    public SessionService(SessionRepository sessionRepository, SubjectRepository subjectRepository) {
        this.sessionRepository = sessionRepository;
        this.subjectRepository = subjectRepository;
    }

    public SessionDTO createSession(SessionDTO dto) {
        validateSessionTiming(dto);

        Subject subject = subjectRepository.findById(dto.getSubjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found with id: " + dto.getSubjectId()));

        Session session = new Session(
                dto.getSessionDate(),
                dto.getStartTime(),
                dto.getEndTime(),
                subject
        );

        Session saved = sessionRepository.save(session);
        return mapToDTO(saved);
    }

    @Transactional(readOnly = true)
    public List<SessionDTO> getAllSessions() {
        return sessionRepository.findAllByOrderBySessionDateDescStartTimeDesc()
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public SessionDTO getSessionById(Long id) {
        Session session = sessionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Session not found with id: " + id));
        return mapToDTO(session);
    }

    @Transactional(readOnly = true)
    public List<SessionDTO> getSessionsBySubjectId(Long subjectId) {
        if (!subjectRepository.existsById(subjectId)) {
            throw new ResourceNotFoundException("Subject not found with id: " + subjectId);
        }
        return sessionRepository.findBySubjectIdOrderBySessionDateDescStartTimeDesc(subjectId)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public SessionDTO updateSession(Long id, SessionDTO dto) {
        Session session = sessionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Session not found with id: " + id));

        validateSessionTiming(dto);

        Subject subject = subjectRepository.findById(dto.getSubjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found with id: " + dto.getSubjectId()));

        session.setSessionDate(dto.getSessionDate());
        session.setStartTime(dto.getStartTime());
        session.setEndTime(dto.getEndTime());
        session.setSubject(subject);

        Session updated = sessionRepository.save(session);
        return mapToDTO(updated);
    }

    public void deleteSession(Long id) {
        Session session = sessionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Session not found with id: " + id));
        sessionRepository.delete(session);
    }

    private void validateSessionTiming(SessionDTO dto) {
        if (dto.getSessionDate() == null) {
            throw new InvalidAttendanceException("Session date is required");
        }
        if (dto.getStartTime() == null) {
            throw new InvalidAttendanceException("Start time is required");
        }
        if (dto.getEndTime() == null) {
            throw new InvalidAttendanceException("End time is required");
        }
        if (!dto.getEndTime().isAfter(dto.getStartTime())) {
            throw new InvalidAttendanceException("End time must be after start time");
        }
    }

    private SessionDTO mapToDTO(Session session) {
        return new SessionDTO(
                session.getId(),
                session.getSubject().getId(),
                session.getSubject().getSubjectCode(),
                session.getSubject().getSubjectName(),
                session.getSubject().getDepartment(),
                session.getSessionDate(),
                session.getStartTime(),
                session.getEndTime()
        );
    }
}
