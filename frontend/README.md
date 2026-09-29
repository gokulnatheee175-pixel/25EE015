# AttendEase – Frontend Client

> **Independent, decoupled frontend application for the AttendEase Classroom Attendance Marking System.**

---

## 🎨 Tech Stack
- **HTML5 & CSS3**
- **Bootstrap 5.3.3 & Bootstrap Icons 1.11.3**
- **Vanilla JavaScript (ES6+) with Fetch API**
- **Zero Build Tools Required** (Runs in any browser directly, or on any static HTTP web server)

---

## 📂 Frontend Directory Structure
```text
frontend/
├── index.html                  # Role Gateway Portal (Admin vs Student selector)
├── admin.html                  # Admin & Faculty Command Center
├── user.html                   # Student / User Attendance Portal
├── dashboard.html              # Global classroom metrics & shortage radar
├── students.html               # Student directory (Add, Edit, Search, Delete)
├── subjects.html               # Course subjects management
├── sessions.html               # Class session scheduling
├── attendance.html             # Daily & bulk class attendance marking + corrections
├── student-attendance.html     # Student performance and subject compliance view
├── shortage.html               # Defaulters list (< 75% attendance)
├── css/
│   └── style.css               # Clean academic dashboard theme
└── js/
    ├── app.js                  # Shared utilities, toast alerts, and dynamic API_BASE
    ├── admin.js                # Admin Command Center operations
    ├── user.js                 # Student attendance calculations & target advisor
    ├── dashboard.js            # System metrics & analytics
    ├── students.js             # Student CRUD operations
    ├── subjects.js             # Subject CRUD operations
    ├── sessions.js             # Session scheduling operations
    ├── attendance.js           # Single & bulk marking + correction desk
    ├── student-attendance.js   # Student lookup & percentage rendering
    └── shortage.js             # Defaulter report table
```

---

## 🔌 Connecting to Backend API

The frontend automatically detects whether it is running on a standalone server (e.g. port 3000, Live Server) or opened via `file://`, and routes all REST requests to the backend:

```javascript
// frontend/js/app.js
const API_BASE = (window.location.protocol === 'file:' || (window.location.port !== '8080' && window.location.port !== ''))
    ? 'http://localhost:8080/api'
    : '/api';
```

Ensure the Spring Boot backend is running on `http://localhost:8080`.

---

## 🚀 How to Run the Frontend

### Option 1: Direct Browser Opening (No Server Needed)
Simply double-click `index.html` in File Explorer, or run:
```powershell
Start-Process "d:\frontend\index.html"
```

### Option 2: Using VS Code Live Server
1. Open the `frontend` folder in VS Code.
2. Right-click `index.html` and select **"Open with Live Server"**.

### Option 3: Using Python HTTP Server (Port 3000)
```powershell
cd d:\frontend
python -m http.server 3000
```
Then visit **[http://localhost:3000](http://localhost:3000)**.

### Option 4: Using Node.js (npx serve / http-server)
```powershell
cd d:\frontend
npx serve -l 3000
```
