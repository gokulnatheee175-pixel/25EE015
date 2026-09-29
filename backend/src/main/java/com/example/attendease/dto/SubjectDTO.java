package com.example.attendease.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class SubjectDTO {

    private Long id;

    @NotBlank(message = "Subject code is required")
    @Size(max = 30, message = "Subject code cannot exceed 30 characters")
    private String subjectCode;

    @NotBlank(message = "Subject name is required")
    @Size(max = 120, message = "Subject name cannot exceed 120 characters")
    private String subjectName;

    @NotBlank(message = "Department is required")
    @Size(max = 80, message = "Department cannot exceed 80 characters")
    private String department;

    public SubjectDTO() {
    }

    public SubjectDTO(Long id, String subjectCode, String subjectName, String department) {
        this.id = id;
        this.subjectCode = subjectCode;
        this.subjectName = subjectName;
        this.department = department;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getSubjectCode() {
        return subjectCode;
    }

    public void setSubjectCode(String subjectCode) {
        this.subjectCode = subjectCode;
    }

    public String getSubjectName() {
        return subjectName;
    }

    public void setSubjectName(String subjectName) {
        this.subjectName = subjectName;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }
}
