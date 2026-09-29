package com.example.attendease.dto;

public class ShortageStudentDTO {

    private Long studentId;
    private String rollNumber;
    private String studentName;
    private Long subjectId;
    private String subjectCode;
    private String subjectName;
    private int totalClasses;
    private int present;
    private int absent;
    private double percentage;
    private boolean shortage;

    public ShortageStudentDTO() {
    }

    public ShortageStudentDTO(Long studentId, String rollNumber, String studentName, Long subjectId,
                              String subjectCode, String subjectName, int totalClasses, int present,
                              int absent, double percentage, boolean shortage) {
        this.studentId = studentId;
        this.rollNumber = rollNumber;
        this.studentName = studentName;
        this.subjectId = subjectId;
        this.subjectCode = subjectCode;
        this.subjectName = subjectName;
        this.totalClasses = totalClasses;
        this.present = present;
        this.absent = absent;
        this.percentage = percentage;
        this.shortage = shortage;
    }

    public Long getStudentId() {
        return studentId;
    }

    public void setStudentId(Long studentId) {
        this.studentId = studentId;
    }

    public String getRollNumber() {
        return rollNumber;
    }

    public void setRollNumber(String rollNumber) {
        this.rollNumber = rollNumber;
    }

    public String getStudentName() {
        return studentName;
    }

    public void setStudentName(String studentName) {
        this.studentName = studentName;
    }

    public Long getSubjectId() {
        return subjectId;
    }

    public void setSubjectId(Long subjectId) {
        this.subjectId = subjectId;
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

    public int getTotalClasses() {
        return totalClasses;
    }

    public void setTotalClasses(int totalClasses) {
        this.totalClasses = totalClasses;
    }

    public int getPresent() {
        return present;
    }

    public void setPresent(int present) {
        this.present = present;
    }

    public int getAbsent() {
        return absent;
    }

    public void setAbsent(int absent) {
        this.absent = absent;
    }

    public double getPercentage() {
        return percentage;
    }

    public void setPercentage(double percentage) {
        this.percentage = percentage;
    }

    public boolean isShortage() {
        return shortage;
    }

    public void setShortage(boolean shortage) {
        this.shortage = shortage;
    }
}
