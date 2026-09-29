// AttendEase - Student Attendance Portal JavaScript
let allStudents = [];

document.addEventListener('DOMContentLoaded', () => {
    loadStudentsDropdown();

    document.getElementById('studentSelect').addEventListener('change', (e) => {
        const studentId = e.target.value;
        if (studentId) {
            loadStudentAttendance(studentId);
        } else {
            document.getElementById('attendance-report-container').classList.add('d-none');
        }
    });

    // Check if query param exists
    const urlParams = new URLSearchParams(window.location.search);
    const paramStudentId = urlParams.get('studentId');
    if (paramStudentId) {
        // Will be triggered once dropdown loads
    }
});

async function loadStudentsDropdown() {
    try {
        const response = await fetch(`${API_BASE}/students`);
        if (!response.ok) throw new Error('Failed to load students');
        allStudents = await response.json();

        const select = document.getElementById('studentSelect');
        select.innerHTML = '<option value="">-- Select a Student to View Attendance --</option>';

        const urlParams = new URLSearchParams(window.location.search);
        const paramStudentId = urlParams.get('studentId');

        allStudents.forEach(st => {
            const isSelected = paramStudentId && paramStudentId === st.id.toString();
            select.innerHTML += `<option value="${st.id}" ${isSelected ? 'selected' : ''}>${st.rollNumber} - ${st.name} (${st.department})</option>`;
        });

        if (paramStudentId) {
            loadStudentAttendance(paramStudentId);
        }
    } catch (e) {
        console.error(e);
        showNotification('Failed to load student list', 'danger');
    }
}

async function loadStudentAttendance(studentId) {
    const container = document.getElementById('attendance-report-container');
    const tableBody = document.getElementById('student-subjects-body');

    try {
        const response = await fetch(`${API_BASE}/attendance/student/${studentId}`);
        if (!response.ok) throw new Error('Failed to load student attendance');
        const summaries = await response.json();

        if (summaries.length === 0) {
            container.classList.add('d-none');
            showNotification('No attendance records found for this student', 'warning');
            return;
        }

        // Student details from first entry
        const student = summaries[0];
        document.getElementById('report-student-name').textContent = student.studentName;
        document.getElementById('report-roll-number').textContent = student.rollNumber;
        document.getElementById('report-department').textContent = student.department;

        // Calculate overall metrics across all subjects
        let totalClassesAll = 0;
        let totalPresentAll = 0;
        let totalAbsentAll = 0;

        tableBody.innerHTML = '';
        summaries.forEach(s => {
            totalClassesAll += s.totalClasses;
            totalPresentAll += s.present;
            totalAbsentAll += s.absent;

            const isShort = s.shortage;
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><code>${s.subjectCode}</code></td>
                <td><strong>${s.subjectName}</strong></td>
                <td>${s.totalClasses}</td>
                <td><span class="text-success fw-bold">${s.present}</span></td>
                <td><span class="text-danger fw-bold">${s.absent}</span></td>
                <td style="min-width: 180px;">
                    <div class="d-flex align-items-center gap-2">
                        <div class="progress flex-grow-1 progress-attendance">
                            <div class="progress-bar ${isShort ? 'bg-danger' : 'bg-success'}" style="width: ${Math.min(s.percentage, 100)}%"></div>
                        </div>
                        <span class="fw-bold ${isShort ? 'text-danger' : 'text-success'}">${s.percentage}%</span>
                    </div>
                </td>
                <td>
                    <span class="${isShort ? 'badge-shortage' : 'badge-safe'}">
                        <i class="bi ${isShort ? 'bi-exclamation-triangle-fill' : 'bi-check-circle-fill'} me-1"></i>
                        ${isShort ? 'SHORTAGE' : 'ELIGIBLE'}
                    </span>
                </td>
            `;
            tableBody.appendChild(tr);
        });

        // Overall stats
        const overallPercentage = totalClassesAll > 0 ? ((totalPresentAll / totalClassesAll) * 100).toFixed(2) : 0.0;
        const overallShortage = totalClassesAll > 0 && overallPercentage < 75.0;

        document.getElementById('overall-total').textContent = totalClassesAll;
        document.getElementById('overall-present').textContent = totalPresentAll;
        document.getElementById('overall-absent').textContent = totalAbsentAll;
        document.getElementById('overall-percentage').textContent = `${overallPercentage}%`;

        const overallStatusBadge = document.getElementById('overall-status');
        overallStatusBadge.className = overallShortage ? 'badge-shortage' : 'badge-safe';
        overallStatusBadge.innerHTML = overallShortage ?
            '<i class="bi bi-exclamation-triangle-fill me-1"></i>ATTENDANCE SHORTAGE (< 75%)' :
            '<i class="bi bi-check-circle-fill me-1"></i>ATTENDANCE SATISFACTORY (>= 75%)';

        const overallBar = document.getElementById('overall-progress-bar');
        overallBar.style.width = `${Math.min(overallPercentage, 100)}%`;
        overallBar.className = `progress-bar ${overallShortage ? 'bg-danger' : 'bg-success'}`;

        container.classList.remove('d-none');
    } catch (e) {
        console.error(e);
        container.classList.add('d-none');
        showNotification('Failed to load student attendance', 'danger');
    }
}
