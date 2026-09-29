// AttendEase - Session Management JavaScript
let allSessions = [];
let allSubjects = [];
let sessionModal;

document.addEventListener('DOMContentLoaded', () => {
    sessionModal = new bootstrap.Modal(document.getElementById('sessionModal'));
    loadSubjectsDropdown();
    
    // Check URL parameters for subjectId
    const urlParams = new URLSearchParams(window.location.search);
    const filterSubjectId = urlParams.get('subjectId');
    loadSessions(filterSubjectId);

    const subjectFilter = document.getElementById('subjectFilterSelect');
    if (subjectFilter) {
        subjectFilter.addEventListener('change', (e) => {
            loadSessions(e.target.value);
        });
    }

    const sessionForm = document.getElementById('sessionForm');
    if (sessionForm) {
        sessionForm.addEventListener('submit', handleSessionSubmit);
    }
});

async function loadSubjectsDropdown() {
    try {
        const response = await fetch(`${API_BASE}/subjects`);
        if (!response.ok) throw new Error('Failed to load subjects');
        allSubjects = await response.json();

        // Populate filter dropdown
        const filterSelect = document.getElementById('subjectFilterSelect');
        const modalSelect = document.getElementById('sessionSubjectId');

        filterSelect.innerHTML = '<option value="">All Subjects</option>';
        modalSelect.innerHTML = '<option value="">Select Subject</option>';

        const urlParams = new URLSearchParams(window.location.search);
        const selectedSubjectId = urlParams.get('subjectId');

        allSubjects.forEach(sub => {
            const isSelected = selectedSubjectId && selectedSubjectId === sub.id.toString();
            filterSelect.innerHTML += `<option value="${sub.id}" ${isSelected ? 'selected' : ''}>${sub.subjectCode} - ${sub.subjectName}</option>`;
            modalSelect.innerHTML += `<option value="${sub.id}">${sub.subjectCode} - ${sub.subjectName}</option>`;
        });
    } catch (error) {
        console.error('Error loading subjects:', error);
    }
}

async function loadSessions(subjectId) {
    const tableBody = document.getElementById('sessions-table-body');
    let url = `${API_BASE}/sessions`;
    if (subjectId) {
        url = `${API_BASE}/sessions/subject/${subjectId}`;
    }

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to load sessions');
        allSessions = await response.json();
        renderSessions(allSessions);
    } catch (error) {
        console.error('Error fetching sessions:', error);
        tableBody.innerHTML = '<tr><td colspan="7" class="text-center text-danger py-4">Failed to load sessions list</td></tr>';
        showNotification('Failed to load sessions list', 'danger');
    }
}

function renderSessions(sessions) {
    const tableBody = document.getElementById('sessions-table-body');
    tableBody.innerHTML = '';

    if (sessions.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="7" class="text-center text-muted py-4">No sessions found for this selection</td></tr>';
        return;
    }

    sessions.forEach((session, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${index + 1}</td>
            <td><span class="badge bg-primary-subtle text-primary border">${session.subjectCode}</span></td>
            <td><strong>${session.subjectName}</strong></td>
            <td>${formatDate(session.sessionDate)}</td>
            <td><i class="bi bi-clock me-1 text-muted"></i>${formatTime(session.startTime)} - ${formatTime(session.endTime)}</td>
            <td>
                <a href="attendance.html?sessionId=${session.id}&subjectId=${session.subjectId}" class="btn btn-sm btn-primary">
                    <i class="bi bi-check2-square me-1"></i>Mark / View Attendance
                </a>
            </td>
            <td>
                <div class="btn-group btn-group-sm">
                    <button class="btn btn-outline-primary" onclick="openEditSessionModal(${session.id})" title="Edit Session">
                        <i class="bi bi-pencil-square"></i>
                    </button>
                    <button class="btn btn-outline-danger" onclick="confirmDeleteSession(${session.id})" title="Delete Session">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </td>
        `;
        tableBody.appendChild(tr);
    });
}

function openAddSessionModal() {
    document.getElementById('sessionModalTitle').textContent = 'Create Classroom Session';
    document.getElementById('sessionForm').reset();
    document.getElementById('sessionId').value = '';

    // Default to today's date
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('sessionDate').value = today;

    sessionModal.show();
}

function openEditSessionModal(id) {
    const session = allSessions.find(s => s.id === id);
    if (!session) return;

    document.getElementById('sessionModalTitle').textContent = 'Edit Session';
    document.getElementById('sessionId').value = session.id;
    document.getElementById('sessionSubjectId').value = session.subjectId;
    document.getElementById('sessionDate').value = session.sessionDate;
    document.getElementById('startTime').value = session.startTime.substring(0, 5);
    document.getElementById('endTime').value = session.endTime.substring(0, 5);

    sessionModal.show();
}

async function handleSessionSubmit(e) {
    e.preventDefault();

    const startTime = document.getElementById('startTime').value;
    const endTime = document.getElementById('endTime').value;

    if (endTime <= startTime) {
        showNotification('End time must be after start time', 'danger');
        return;
    }

    const id = document.getElementById('sessionId').value;
    const payload = {
        subjectId: parseInt(document.getElementById('sessionSubjectId').value, 10),
        sessionDate: document.getElementById('sessionDate').value,
        startTime: startTime.length === 5 ? `${startTime}:00` : startTime,
        endTime: endTime.length === 5 ? `${endTime}:00` : endTime
    };

    const isEdit = !!id;
    const url = isEdit ? `${API_BASE}/sessions/${id}` : `${API_BASE}/sessions`;
    const method = isEdit ? 'PUT' : 'POST';

    try {
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorMsg = await handleApiError(response);
            showNotification(errorMsg, 'danger');
            return;
        }

        sessionModal.hide();
        showNotification(isEdit ? 'Session updated successfully!' : 'Session created successfully!', 'success');
        const filterVal = document.getElementById('subjectFilterSelect').value;
        loadSessions(filterVal);
    } catch (error) {
        console.error('Error saving session:', error);
        showNotification('Failed to save session', 'danger');
    }
}

async function confirmDeleteSession(id) {
    if (!confirm('Are you sure you want to delete this session? All marked attendance records for this session will also be removed.')) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/sessions/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            const errorMsg = await handleApiError(response);
            showNotification(errorMsg, 'danger');
            return;
        }

        showNotification('Session deleted successfully', 'success');
        const filterVal = document.getElementById('subjectFilterSelect').value;
        loadSessions(filterVal);
    } catch (error) {
        console.error('Error deleting session:', error);
        showNotification('Failed to delete session', 'danger');
    }
}
