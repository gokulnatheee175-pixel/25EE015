// AttendEase - Dashboard JavaScript
document.addEventListener('DOMContentLoaded', () => {
    loadDashboardStats();
    loadRecentSessions();
    loadShortagePreview();
});

async function loadDashboardStats() {
    try {
        const response = await fetch(`${API_BASE}/dashboard`);
        if (!response.ok) throw new Error('Failed to load dashboard metrics');
        const stats = await response.json();

        document.getElementById('stat-students').textContent = stats.totalStudents;
        document.getElementById('stat-subjects').textContent = stats.totalSubjects;
        document.getElementById('stat-sessions').textContent = stats.totalSessions;
        document.getElementById('stat-records').textContent = stats.totalAttendanceRecords;
        document.getElementById('stat-shortage').textContent = stats.shortageStudents;
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        showNotification('Failed to load dashboard statistics', 'danger');
    }
}

async function loadRecentSessions() {
    const tableBody = document.getElementById('recent-sessions-body');
    if (!tableBody) return;

    try {
        const response = await fetch(`${API_BASE}/sessions`);
        if (!response.ok) throw new Error('Failed to load sessions');
        const sessions = await response.json();

        tableBody.innerHTML = '';
        if (sessions.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="5" class="text-center text-muted py-3">No sessions conducted yet</td></tr>';
            return;
        }

        // Show up to 5 recent sessions
        sessions.slice(0, 5).forEach(session => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><span class="badge bg-primary-subtle text-primary border">${session.subjectCode}</span></td>
                <td><strong>${session.subjectName}</strong></td>
                <td>${formatDate(session.sessionDate)}</td>
                <td>${formatTime(session.startTime)} - ${formatTime(session.endTime)}</td>
                <td>
                    <a href="attendance.html?sessionId=${session.id}&subjectId=${session.subjectId}" class="btn btn-sm btn-outline-primary">
                        <i class="bi bi-card-checklist me-1"></i>Mark / View
                    </a>
                </td>
            `;
            tableBody.appendChild(tr);
        });
    } catch (error) {
        console.error('Error fetching sessions:', error);
        tableBody.innerHTML = '<tr><td colspan="5" class="text-center text-danger py-3">Could not load recent sessions</td></tr>';
    }
}

async function loadShortagePreview() {
    const tableBody = document.getElementById('shortage-preview-body');
    if (!tableBody) return;

    try {
        const response = await fetch(`${API_BASE}/attendance/shortage`);
        if (!response.ok) throw new Error('Failed to load shortage students');
        const list = await response.json();

        tableBody.innerHTML = '';
        if (list.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="5" class="text-center text-success py-3"><i class="bi bi-shield-check me-1"></i>Great news! No students currently have attendance shortage.</td></tr>';
            return;
        }

        // Show top 5 shortage students
        list.slice(0, 5).forEach(item => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><code>${item.rollNumber}</code></td>
                <td>${item.studentName}</td>
                <td>${item.subjectName}</td>
                <td>
                    <div class="d-flex align-items-center gap-2">
                        <div class="progress flex-grow-1 progress-attendance">
                            <div class="progress-bar bg-danger" style="width: ${Math.min(item.percentage, 100)}%"></div>
                        </div>
                        <span class="fw-bold text-danger">${item.percentage}%</span>
                    </div>
                </td>
                <td><span class="badge-shortage"><i class="bi bi-exclamation-triangle-fill me-1"></i>SHORTAGE</span></td>
            `;
            tableBody.appendChild(tr);
        });
    } catch (error) {
        console.error('Error loading shortage preview:', error);
        tableBody.innerHTML = '<tr><td colspan="5" class="text-center text-danger py-3">Could not load shortage records</td></tr>';
    }
}
