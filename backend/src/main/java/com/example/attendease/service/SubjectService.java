package com.example.attendease.service;

import com.example.attendease.dto.SubjectDTO;
import com.example.attendease.entity.Subject;
import com.example.attendease.exception.ResourceNotFoundException;
import com.example.attendease.repository.SubjectRepository;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class SubjectService {

    private final SubjectRepository subjectRepository;

    public SubjectService(SubjectRepository subjectRepository) {
        this.subjectRepository = subjectRepository;
    }

    public SubjectDTO createSubject(SubjectDTO dto) {
        if (subjectRepository.existsBySubjectCode(dto.getSubjectCode().trim().toUpperCase())) {
            throw new IllegalArgumentException("Subject with code '" + dto.getSubjectCode() + "' already exists");
        }
        Subject subject = new Subject(
                dto.getSubjectCode().trim().toUpperCase(),
                dto.getSubjectName().trim(),
                dto.getDepartment().trim()
        );
        Subject saved = subjectRepository.save(subject);
        return mapToDTO(saved);
    }

    @Transactional(readOnly = true)
    public List<SubjectDTO> getAllSubjects() {
        return subjectRepository.findAll(Sort.by(Sort.Direction.ASC, "subjectCode"))
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public SubjectDTO getSubjectById(Long id) {
        Subject subject = subjectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found with id: " + id));
        return mapToDTO(subject);
    }

    public SubjectDTO updateSubject(Long id, SubjectDTO dto) {
        Subject subject = subjectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found with id: " + id));

        String upperCode = dto.getSubjectCode().trim().toUpperCase();
        if (subjectRepository.existsBySubjectCodeAndIdNot(upperCode, id)) {
            throw new IllegalArgumentException("Another subject with code '" + dto.getSubjectCode() + "' already exists");
        }

        subject.setSubjectCode(upperCode);
        subject.setSubjectName(dto.getSubjectName().trim());
        subject.setDepartment(dto.getDepartment().trim());

        Subject updated = subjectRepository.save(subject);
        return mapToDTO(updated);
    }

    public void deleteSubject(Long id) {
        Subject subject = subjectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found with id: " + id));
        subjectRepository.delete(subject);
    }

    private SubjectDTO mapToDTO(Subject subject) {
        return new SubjectDTO(
                subject.getId(),
                subject.getSubjectCode(),
                subject.getSubjectName(),
                subject.getDepartment()
        );
    }
}
