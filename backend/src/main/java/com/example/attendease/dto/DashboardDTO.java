package com.example.attendease.dto;

public class DashboardDTO {

    private long totalStudents;
    private long totalSubjects;
    private long totalSessions;
    private long totalAttendanceRecords;
    private long shortageStudents;

    public DashboardDTO() {
    }

    public DashboardDTO(long totalStudents, long totalSubjects, long totalSessions,
                        long totalAttendanceRecords, long shortageStudents) {
        this.totalStudents = totalStudents;
        this.totalSubjects = totalSubjects;
        this.totalSessions = totalSessions;
        this.totalAttendanceRecords = totalAttendanceRecords;
        this.shortageStudents = shortageStudents;
    }

    public long getTotalStudents() {
        return totalStudents;
    }

    public void setTotalStudents(long totalStudents) {
        this.totalStudents = totalStudents;
    }

    public long getTotalSubjects() {
        return totalSubjects;
    }

    public void setTotalSubjects(long totalSubjects) {
        this.totalSubjects = totalSubjects;
    }

    public long getTotalSessions() {
        return totalSessions;
    }

    public void setTotalSessions(long totalSessions) {
        this.totalSessions = totalSessions;
    }

    public long getTotalAttendanceRecords() {
        return totalAttendanceRecords;
    }

    public void setTotalAttendanceRecords(long totalAttendanceRecords) {
        this.totalAttendanceRecords = totalAttendanceRecords;
    }

    public long getShortageStudents() {
        return shortageStudents;
    }

    public void setShortageStudents(long shortageStudents) {
        this.shortageStudents = shortageStudents;
    }
}
