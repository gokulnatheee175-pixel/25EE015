// AttendEase - Attendance Marking & Correction JavaScript
let subjects = [];
let sessions = [];
let students = [];
let existingRecords = [];
let correctionModal;
let singleMarkModal;

document.addEventListener('DOMContentLoaded', () => {
    correctionModal = new bootstrap.Modal(document.getElementById('correctionModal'));
    singleMarkModal = new bootstrap.Modal(document.getElementById('singleMarkModal'));

    initAttendancePage();

    document.getElementById('subjectSelect').addEventListener('change', onSubjectChange);
    document.getElementById('sessionSelect').addEventListener('change', onSessionChange);
    document.getElementById('attendanceForm').addEventListener('submit', handleBulkAttendanceSubmit);
    document.getElementById('correctionForm').addEventListener('submit', handleCorrectionSubmit);
    document.getElementById('singleMarkForm').addEventListener('submit', handleSingleMarkSubmit);

    document.getElementById('btnAllPresent').addEventListener('click', () => setAllStatus('PRESENT'));
    document.getElementById('btnAllAbsent').addEventListener('click', () => setAllStatus('ABSENT'));
});

async function initAttendancePage() {
    await loadSubjects();
    await loadStudents();

    // Check query params if navigated from sessions or dashboard
    const urlParams = new URLSearchParams(window.location.search);
    const subjectId = urlParams.get('subjectId');
    const sessionId = urlParams.get('sessionId');

    if (subjectId) {
        document.getElementById('subjectSelect').value = subjectId;
        await onSubjectChange();
        if (sessionId) {
            document.getElementById('sessionSelect').value = sessionId;
            await onSessionChange();
        }
    }
}

async function loadSubjects() {
    try {
        const response = await fetch(`${API_BASE}/subjects`);
        if (!response.ok) throw new Error('Failed to load subjects');
        subjects = await response.json();

        const select = document.getElementById('subjectSelect');
        select.innerHTML = '<option value="">-- Choose Subject --</option>';
        subjects.forEach(sub => {
            select.innerHTML += `<option value="${sub.id}">${sub.subjectCode} - ${sub.subjectName}</option>`;
        });
    } catch (e) {
        console.error(e);
        showNotification('Failed to load subjects', 'danger');
    }
}

async function loadStudents() {
    try {
        const response = await fetch(`${API_BASE}/students`);
        if (!response.ok) throw new Error('Failed to load students');
        students = await response.json();
    } catch (e) {
        console.error(e);
        showNotification('Failed to load student roster', 'danger');
    }
}

async function onSubjectChange() {
    const subjectId = document.getElementById('subjectSelect').value;
    const sessionSelect = document.getElementById('sessionSelect');
    sessionSelect.innerHTML = '<option value="">-- Choose Session --</option>';
    document.getElementById('attendance-roster-card').classList.add('d-none');
    document.getElementById('marked-records-card').classList.add('d-none');

    if (!subjectId) {
        sessionSelect.disabled = true;
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/sessions/subject/${subjectId}`);
        if (!response.ok) throw new Error('Failed to load sessions for subject');
        sessions = await response.json();

        if (sessions.length === 0) {
            sessionSelect.innerHTML = '<option value="">No sessions found for this subject</option>';
            sessionSelect.disabled = true;
            showNotification('No class sessions found for the selected subject. Please create a session first.', 'warning');
            return;
        }

        sessions.forEach(sess => {
            sessionSelect.innerHTML += `<option value="${sess.id}">${formatDate(sess.sessionDate)} (${formatTime(sess.startTime)} - ${formatTime(sess.endTime)})</option>`;
        });
        sessionSelect.disabled = false;
    } catch (e) {
        console.error(e);
        showNotification('Failed to load sessions for subject', 'danger');
    }
}

async function onSessionChange() {
    const sessionId = document.getElementById('sessionSelect').value;
    if (!sessionId) {
        document.getElementById('attendance-roster-card').classList.add('d-none');
        document.getElementById('marked-records-card').classList.add('d-none');
        return;
    }

    await loadSessionAttendance(sessionId);
}

async function loadSessionAttendance(sessionId) {
    try {
        const response = await fetch(`${API_BASE}/attendance/session/${sessionId}`);
        if (!response.ok) throw new Error('Failed to load session attendance');
        existingRecords = await response.json();

        renderRoster(existingRecords);
        renderMarkedRecords(existingRecords);

        document.getElementById('attendance-roster-card').classList.remove('d-none');
        document.getElementById('marked-records-card').classList.remove('d-none');
    } catch (e) {
        console.error(e);
        showNotification('Failed to load attendance details', 'danger');
    }
}

function renderRoster(records) {
    const tableBody = document.getElementById('roster-table-body');
    tableBody.innerHTML = '';

    // Create a map of studentId -> status
    const statusMap = new Map();
    records.forEach(r => statusMap.set(r.studentId, r.status));

    students.forEach((student, index) => {
        const tr = document.createElement('tr');
        const currentStatus = statusMap.get(student.id) || 'PRESENT';

        tr.innerHTML = `
            <td>${index + 1}</td>
            <td><code>${student.rollNumber}</code></td>
            <td><strong>${student.name}</strong></td>
            <td>${student.department}</td>
            <td>
                <div class="attendance-toggle">
                    <div class="form-check form-check-inline">
                        <input class="form-check-input attendance-radio" type="radio" 
                               name="status_${student.id}" id="present_${student.id}" 
                               value="PRESENT" ${currentStatus === 'PRESENT' ? 'checked' : ''}>
                        <label class="form-check-label text-success fw-bold" for="present_${student.id}">
                            <i class="bi bi-check-circle me-1"></i>Present
                        </label>
                    </div>
                    <div class="form-check form-check-inline">
                        <input class="form-check-input attendance-radio" type="radio" 
                               name="status_${student.id}" id="absent_${student.id}" 
                               value="ABSENT" ${currentStatus === 'ABSENT' ? 'checked' : ''}>
                        <label class="form-check-label text-danger fw-bold" for="absent_${student.id}">
                            <i class="bi bi-x-circle me-1"></i>Absent
                        </label>
                    </div>
                </div>
            </td>
        `;
        tableBody.appendChild(tr);
    });
}

function renderMarkedRecords(records) {
    const tableBody = document.getElementById('marked-table-body');
    const countBadge = document.getElementById('marked-count');
    tableBody.innerHTML = '';
    countBadge.textContent = `${records.length} Records Marked`;

    if (records.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" class="text-center text-muted py-3">No attendance marked yet for this session</td></tr>';
        return;
    }

    records.forEach((rec, idx) => {
        const isPresent = rec.status === 'PRESENT';
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${idx + 1}</td>
            <td><code>${rec.rollNumber}</code></td>
            <td><strong>${rec.studentName}</strong></td>
            <td>
                <span class="badge ${isPresent ? 'bg-success' : 'bg-danger'}">
                    ${rec.status}
                </span>
            </td>
            <td><small class="text-muted">${rec.markedAt ? rec.markedAt.replace('T', ' ') : '-'}</small></td>
            <td>
                <div class="btn-group btn-group-sm">
                    <button class="btn btn-outline-primary" onclick="openCorrectionModal(${rec.id}, '${rec.studentName}', '${rec.status}')" title="Correct Record">
                        <i class="bi bi-pencil-square me-1"></i>Correct
                    </button>
                    <button class="btn btn-outline-danger" onclick="confirmDeleteAttendance(${rec.id}, '${rec.studentName}')" title="Delete Record">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </td>
        `;
        tableBody.appendChild(tr);
    });
}

function setAllStatus(status) {
    students.forEach(student => {
        const radio = document.querySelector(`input[name="status_${student.id}"][value="${status}"]`);
        if (radio) radio.checked = true;
    });
}

async function handleBulkAttendanceSubmit(e) {
    e.preventDefault();
    const sessionId = document.getElementById('sessionSelect').value;
    if (!sessionId) {
        showNotification('Please select a session first', 'warning');
        return;
    }

    const payload = [];
    students.forEach(student => {
        const selectedRadio = document.querySelector(`input[name="status_${student.id}"]:checked`);
        const status = selectedRadio ? selectedRadio.value : 'PRESENT';
        payload.push({
            studentId: student.id,
            status: status
        });
    });

    const submitBtn = document.getElementById('btnSubmitBulkAttendance');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Submitting...';

    try {
        const response = await fetch(`${API_BASE}/attendance/session/${sessionId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorMsg = await handleApiError(response);
            showNotification(errorMsg, 'danger');
            return;
        }

        showNotification('Attendance marked successfully.', 'success');
        await loadSessionAttendance(sessionId);
    } catch (error) {
        console.error('Error submitting attendance:', error);
        showNotification('Failed to mark attendance', 'danger');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="bi bi-cloud-arrow-up-fill me-1"></i>Save All Attendance';
    }
}

// Single mark attendance modal (used to test single mark & 409 conflict duplicate check)
function openSingleMarkModal() {
    const sessionId = document.getElementById('sessionSelect').value;
    if (!sessionId) {
        showNotification('Please select a session first', 'warning');
        return;
    }

    const studentSelect = document.getElementById('singleStudentSelect');
    studentSelect.innerHTML = '<option value="">-- Select Student --</option>';
    students.forEach(s => {
        studentSelect.innerHTML += `<option value="${s.id}">${s.rollNumber} - ${s.name}</option>`;
    });

    singleMarkModal.show();
}

async function handleSingleMarkSubmit(e) {
    e.preventDefault();
    const sessionId = document.getElementById('sessionSelect').value;
    const studentId = document.getElementById('singleStudentSelect').value;
    const status = document.getElementById('singleStatusSelect').value;

    const payload = {
        sessionId: parseInt(sessionId, 10),
        studentId: parseInt(studentId, 10),
        status: status
    };

    try {
        const response = await fetch(`${API_BASE}/attendance`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (response.status === 409) {
            const err = await response.json();
            showNotification(err.message || 'Attendance already marked for this student in this session', 'warning');
            return;
        }

        if (!response.ok) {
            const errorMsg = await handleApiError(response);
            showNotification(errorMsg, 'danger');
            return;
        }

        singleMarkModal.hide();
        showNotification('Single attendance marked successfully (201 Created)', 'success');
        await loadSessionAttendance(sessionId);
    } catch (e) {
        console.error(e);
        showNotification('Failed to submit attendance', 'danger');
    }
}

// Faculty Correction of existing attendance
function openCorrectionModal(recordId, studentName, currentStatus) {
    document.getElementById('correctionRecordId').value = recordId;
    document.getElementById('correctionStudentName').textContent = studentName;
    document.getElementById('correctionStatusSelect').value = currentStatus;
    correctionModal.show();
}

async function handleCorrectionSubmit(e) {
    e.preventDefault();
    const recordId = document.getElementById('correctionRecordId').value;
    const newStatus = document.getElementById('correctionStatusSelect').value;

    try {
        const response = await fetch(`${API_BASE}/attendance/${recordId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        });

        if (!response.ok) {
            const errorMsg = await handleApiError(response);
            showNotification(errorMsg, 'danger');
            return;
        }

        correctionModal.hide();
        showNotification('Attendance corrected successfully!', 'success');
        const sessionId = document.getElementById('sessionSelect').value;
        await loadSessionAttendance(sessionId);
    } catch (e) {
        console.error(e);
        showNotification('Failed to update attendance record', 'danger');
    }
}

async function confirmDeleteAttendance(recordId, studentName) {
    if (!confirm(`Delete attendance record for "${studentName}"?`)) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/attendance/${recordId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            const errorMsg = await handleApiError(response);
            showNotification(errorMsg, 'danger');
            return;
        }

        showNotification('Attendance record deleted successfully', 'success');
        const sessionId = document.getElementById('sessionSelect').value;
        await loadSessionAttendance(sessionId);
    } catch (e) {
        console.error(e);
        showNotification('Failed to delete attendance record', 'danger');
    }
}
