package com.example.attendease.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public class StudentDTO {

    private Long id;

    @NotBlank(message = "Roll number is required")
    @Size(max = 50, message = "Roll number cannot exceed 50 characters")
    private String rollNumber;

    @NotBlank(message = "Student name is required")
    @Size(max = 100, message = "Student name cannot exceed 100 characters")
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    @Size(max = 120, message = "Email cannot exceed 120 characters")
    private String email;

    @NotBlank(message = "Department is required")
    @Size(max = 80, message = "Department cannot exceed 80 characters")
    private String department;

    @NotNull(message = "Year is required")
    @Positive(message = "Year must be a positive integer")
    private Integer year;

    public StudentDTO() {
    }

    public StudentDTO(Long id, String rollNumber, String name, String email, String department, Integer year) {
        this.id = id;
        this.rollNumber = rollNumber;
        this.name = name;
        this.email = email;
        this.department = department;
        this.year = year;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getRollNumber() {
        return rollNumber;
    }

    public void setRollNumber(String rollNumber) {
        this.rollNumber = rollNumber;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public Integer getYear() {
        return year;
    }

    public void setYear(Integer year) {
        this.year = year;
    }
}
