# AttendEase – Backend REST API Service

> **Independent Spring Boot 3 backend service providing RESTful APIs for the AttendEase Classroom Attendance Marking System.**

---

## ☕ Tech Stack
- **Java 17 / 25 LTS**
- **Spring Boot 3.3.4**
  - Spring Web (REST APIs)
  - Spring Data JPA (Hibernate ORM)
  - Spring Validation (Jakarta `@Valid`, `@NotBlank`, `@Email`)
- **MySQL 8** (Database: `attendease_db`)
- **Apache Maven 3.9+** (with bundled `mvnw.cmd` / `mvnw`)

---

## 📂 Backend Directory Structure
```text
backend/
├── pom.xml
├── mvnw / mvnw.cmd
├── start-backend.bat
├── src/
│   ├── main/
│   │   ├── java/com/example/attendease/
│   │   │   ├── AttendEaseApplication.java
│   │   │   ├── config/
│   │   │   │   ├── DataInitializer.java        # Automated seed data (10 students, 3 subjects, 6 sessions)
│   │   │   │   └── WebConfig.java              # CORS configuration (allows all origins)
│   │   │   ├── controller/                     # REST API Controllers (@CrossOrigin)
│   │   │   │   ├── StudentController.java
│   │   │   │   ├── SubjectController.java
│   │   │   │   ├── SessionController.java
│   │   │   │   ├── AttendanceController.java
│   │   │   │   └── DashboardController.java
│   │   │   ├── dto/                            # Data Transfer Objects
│   │   │   ├── entity/                         # JPA Entities (Student, Subject, Session, AttendanceRecord)
│   │   │   ├── exception/                      # 404, 409 Conflict, 400 Bad Request exception handlers
│   │   │   ├── repository/                     # Spring Data JPA Repositories
│   │   │   └── service/                        # Business logic, percentage calculations, shortage checks
│   │   └── resources/
│   │       └── application.properties          # Database credentials & 75% threshold
│   └── test/
│       └── java/com/example/attendease/
│           └── AttendEaseApplicationTests.java # 10 automated integration tests
```

---

## 🌐 CORS (Cross-Origin Resource Sharing)
The backend is configured to accept requests from any frontend client (e.g. `http://localhost:3000`, `http://localhost:5500`, or `file://`):
```java
@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("*")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*");
    }
}
```

---

## 📡 REST API Reference

Base URL: `http://localhost:8080/api`

| Method | Endpoint | Description |
|:---|:---|:---|
| **GET** | `/dashboard` | System overview stats & shortage counts |
| **GET** | `/students` | List all students |
| **POST** | `/students` | Create new student |
| **GET** | `/students/{id}` | Get student by ID |
| **GET** | `/students/roll/{rollNumber}` | Search student by roll number |
| **PUT** | `/students/{id}` | Update student details |
| **DELETE** | `/students/{id}` | Delete student |
| **GET** | `/subjects` | List all subjects |
| **POST** | `/subjects` | Create subject |
| **GET** | `/subjects/{id}` | Get subject by ID |
| **PUT** | `/subjects/{id}` | Update subject |
| **DELETE** | `/subjects/{id}` | Delete subject |
| **GET** | `/sessions` | List sessions (optional `?subjectId=`) |
| **POST** | `/sessions` | Create session (start/end time validation) |
| **GET** | `/sessions/{id}` | Get session by ID |
| **POST** | `/attendance` | Mark single attendance (`HTTP 409` on duplicate) |
| **POST** | `/attendance/session/{sessionId}` | Mark bulk attendance for class |
| **GET** | `/attendance/session/{sessionId}` | Get attendance list for session |
| **PUT** | `/attendance/{attendanceId}` | Faculty correction: update status |
| **DELETE** | `/attendance/{attendanceId}` | Delete attendance record |
| **GET** | `/attendance/student/{studentId}` | Student subject breakdown & percentage |
| **GET** | `/attendance/records/student/{studentId}` | Chronological attendance logs for student |
| **GET** | `/attendance/shortage` | Shortage defaulters list (< 75%) |

---

## 🚀 How to Run the Backend

```powershell
cd d:\backend
.\mvnw.cmd spring-boot:run
```
Or double-click `start-backend.bat`.

The server will start on **`http://localhost:8080`**.
