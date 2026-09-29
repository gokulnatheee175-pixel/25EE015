/**
 * AttendEase - Admin Command Center JS
 */

document.addEventListener('DOMContentLoaded', () => {
    loadDashboardMetrics();
    loadShortageWatchlist();
    loadRecentSessions();
    loadSubjectsForModal();

    // Event listeners for quick modals
    setupQuickStudentForm();
    setupQuickSubjectForm();
    setupQuickSessionForm();
    setupCorrectionDesk();

    // Set today's date in quick session modal
    const dateInput = document.getElementById('quick-ses-date');
    if (dateInput) {
        dateInput.value = new Date().toISOString().split('T')[0];
    }
});

/**
 * Load system dashboard stats
 */
async function loadDashboardMetrics() {
    try {
        const data = await App.fetchJson(`${App.API_BASE}/dashboard`);
        document.getElementById('admin-total-students').textContent = data.totalStudents || 0;
        document.getElementById('admin-total-subjects').textContent = data.totalSubjects || 0;
        document.getElementById('admin-total-sessions').textContent = data.totalSessions || 0;
        document.getElementById('admin-total-shortage').textContent = data.shortageStudents || 0;
    } catch (err) {
        console.error('Failed to load dashboard metrics:', err);
    }
}

/**
 * Load shortage defaulters (<75%)
 */
async function loadShortageWatchlist() {
    const tbody = document.getElementById('admin-shortage-tbody');
    try {
        const shortageList = await App.fetchJson(`${App.API_BASE}/attendance/shortage`);
        if (!shortageList || shortageList.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center py-4 text-success">
                        <i class="bi bi-check-circle-fill me-2 fs-5"></i>
                        <strong>No students currently in shortage! All above 75%.</strong>
                    </td>
                </tr>
            `;
            return;
        }

        // Show top 6 shortage students
        const topList = shortageList.slice(0, 6);
        tbody.innerHTML = topList.map(item => `
            <tr>
                <td class="fw-semibold text-primary">${App.escapeHtml(item.rollNumber)}</td>
                <td>${App.escapeHtml(item.studentName)}</td>
                <td><span class="badge bg-light text-dark border">${App.escapeHtml(item.subjectCode)}</span></td>
                <td><small class="text-muted">${item.present} / ${item.totalClasses}</small></td>
                <td>
                    <div class="d-flex align-items-center gap-2">
                        <div class="progress flex-grow-1" style="height: 6px; width: 60px;">
                            <div class="progress-bar bg-danger" style="width: ${Math.min(item.percentage, 100)}%"></div>
                        </div>
                        <span class="badge bg-danger">${item.percentage.toFixed(1)}%</span>
                    </div>
                </td>
                <td>
                    <a href="student-attendance.html?studentId=${item.studentId}" class="btn btn-sm btn-outline-secondary py-0 px-2" title="View Student Breakdown">
                        <i class="bi bi-eye"></i>
                    </a>
                </td>
            </tr>
        `).join('');
    } catch (err) {
        console.error('Error loading shortage watchlist:', err);
        tbody.innerHTML = `<tr><td colspan="6" class="text-center py-3 text-danger">Failed to load shortage list.</td></tr>`;
    }
}

/**
 * Load recent sessions
 */
async function loadRecentSessions() {
    const tbody = document.getElementById('admin-sessions-tbody');
    try {
        const sessions = await App.fetchJson(`${App.API_BASE}/sessions`);
        if (!sessions || sessions.length === 0) {
            tbody.innerHTML = `<tr><td colspan="3" class="text-center py-4 text-muted">No class sessions scheduled yet.</td></tr>`;
            return;
        }

        // Sort descending by date
        const sorted = sessions.sort((a, b) => b.sessionDate.localeCompare(a.sessionDate)).slice(0, 5);
        tbody.innerHTML = sorted.map(s => `
            <tr>
                <td>
                    <div class="fw-semibold">${App.escapeHtml(s.subjectCode)}</div>
                    <small class="text-muted">${App.escapeHtml(s.subjectName)}</small>
                </td>
                <td>
                    <div><i class="bi bi-calendar3 me-1 text-muted small"></i>${App.formatDate(s.sessionDate)}</div>
                    <small class="text-muted"><i class="bi bi-clock me-1"></i>${App.formatTime(s.startTime)} - ${App.formatTime(s.endTime)}</small>
                </td>
                <td>
                    <a href="attendance.html" class="btn btn-sm btn-primary py-1 px-2">
                        <i class="bi bi-check2-square me-1"></i>Attendance
                    </a>
                </td>
            </tr>
        `).join('');
    } catch (err) {
        console.error('Error loading sessions:', err);
        tbody.innerHTML = `<tr><td colspan="3" class="text-center py-3 text-danger">Failed to load sessions.</td></tr>`;
    }
}

/**
 * Load subjects into quick session dropdown
 */
async function loadSubjectsForModal() {
    const select = document.getElementById('quick-ses-subject');
    if (!select) return;
    try {
        const subjects = await App.fetchJson(`${App.API_BASE}/subjects`);
        select.innerHTML = '<option value="">Select Subject...</option>' +
            subjects.map(s => `<option value="${s.id}">${App.escapeHtml(s.subjectCode)} - ${App.escapeHtml(s.subjectName)}</option>`).join('');
    } catch (err) {
        console.error('Failed to load subjects for modal:', err);
    }
}

/**
 * Quick Student Form
 */
function setupQuickStudentForm() {
    const form = document.getElementById('quickStudentForm');
    if (!form) return;
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const payload = {
            name: document.getElementById('quick-s-name').value.trim(),
            rollNumber: document.getElementById('quick-s-roll').value.trim(),
            email: document.getElementById('quick-s-email').value.trim(),
            department: document.getElementById('quick-s-dept').value.trim(),
            year: parseInt(document.getElementById('quick-s-year').value, 10)
        };

        try {
            await App.fetchJson(`${App.API_BASE}/students`, {
                method: 'POST',
                body: JSON.stringify(payload)
            });
            App.showToast('Student enrolled successfully!', 'success');
            bootstrap.Modal.getInstance(document.getElementById('quickStudentModal')).hide();
            form.reset();
            loadDashboardMetrics();
        } catch (err) {
            App.showToast(err.message, 'danger');
        }
    });
}

/**
 * Quick Subject Form
 */
function setupQuickSubjectForm() {
    const form = document.getElementById('quickSubjectForm');
    if (!form) return;
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const payload = {
            subjectCode: document.getElementById('quick-sub-code').value.trim(),
            subjectName: document.getElementById('quick-sub-name').value.trim(),
            department: document.getElementById('quick-sub-dept').value.trim()
        };

        try {
            await App.fetchJson(`${App.API_BASE}/subjects`, {
                method: 'POST',
                body: JSON.stringify(payload)
            });
            App.showToast('Subject created successfully!', 'success');
            bootstrap.Modal.getInstance(document.getElementById('quickSubjectModal')).hide();
            form.reset();
            loadDashboardMetrics();
            loadSubjectsForModal();
        } catch (err) {
            App.showToast(err.message, 'danger');
        }
    });
}

/**
 * Quick Session Form
 */
function setupQuickSessionForm() {
    const form = document.getElementById('quickSessionForm');
    if (!form) return;
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const payload = {
            subjectId: parseInt(document.getElementById('quick-ses-subject').value, 10),
            sessionDate: document.getElementById('quick-ses-date').value,
            startTime: document.getElementById('quick-ses-start').value,
            endTime: document.getElementById('quick-ses-end').value
        };

        try {
            await App.fetchJson(`${App.API_BASE}/sessions`, {
                method: 'POST',
                body: JSON.stringify(payload)
            });
            App.showToast('Class session scheduled successfully!', 'success');
            bootstrap.Modal.getInstance(document.getElementById('quickSessionModal')).hide();
            form.reset();
            loadDashboardMetrics();
            loadRecentSessions();
        } catch (err) {
            App.showToast(err.message, 'danger');
        }
    });
}

/**
 * Faculty Attendance Correction Desk
 */
function setupCorrectionDesk() {
    const lookupBtn = document.getElementById('corr-lookup-btn');
    const recordInput = document.getElementById('corr-record-id');
    const detailsBox = document.getElementById('corr-details-box');
    const saveBtn = document.getElementById('corr-save-btn');
    const deleteBtn = document.getElementById('corr-delete-btn');
    const statusSelect = document.getElementById('corr-new-status');

    let currentRecordId = null;

    if (!lookupBtn) return;

    lookupBtn.addEventListener('click', async () => {
        const id = recordInput.value.trim();
        if (!id) {
            App.showToast('Please enter an attendance record ID', 'warning');
            return;
        }

        try {
            // Note: Update endpoint accepts status; we test look up by searching in session attendance or trying direct check
            // For lookup: we can fetch sessions or call student records. Let's make an intuitive quick lookup or test update
            currentRecordId = id;
            detailsBox.classList.remove('d-none');
            document.getElementById('corr-student-name').textContent = `Attendance Record #${id}`;
            document.getElementById('corr-current-badge').textContent = 'Ready to modify';
            document.getElementById('corr-subject-info').textContent = 'Enter new status below to correct';
            document.getElementById('corr-date-info').textContent = 'Click "Apply Correction" or "Delete Record"';

            saveBtn.disabled = false;
            deleteBtn.disabled = false;
            App.showToast(`Record #${id} selected. Ready for correction.`, 'info');
        } catch (err) {
            App.showToast(err.message, 'danger');
        }
    });

    saveBtn.addEventListener('click', async () => {
        if (!currentRecordId) return;
        const newStatus = statusSelect.value;
        try {
            const res = await App.fetchJson(`${App.API_BASE}/attendance/${currentRecordId}`, {
                method: 'PUT',
                body: JSON.stringify({ status: newStatus })
            });
            App.showToast(`Record #${currentRecordId} successfully updated to ${newStatus}!`, 'success');
            document.getElementById('corr-current-badge').textContent = newStatus;
            document.getElementById('corr-current-badge').className = newStatus === 'PRESENT' ? 'badge bg-success' : 'badge bg-danger';
            loadDashboardMetrics();
            loadShortageWatchlist();
        } catch (err) {
            App.showToast(err.message, 'danger');
        }
    });

    deleteBtn.addEventListener('click', async () => {
        if (!currentRecordId) return;
        if (!confirm(`Are you sure you want to permanently delete Attendance Record #${currentRecordId}?`)) return;

        try {
            const response = await fetch(`${App.API_BASE}/attendance/${currentRecordId}`, {
                method: 'DELETE'
            });
            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.message || 'Delete failed');
            }
            App.showToast(`Record #${currentRecordId} deleted successfully.`, 'success');
            saveBtn.disabled = true;
            deleteBtn.disabled = true;
            detailsBox.classList.add('d-none');
            recordInput.value = '';
            currentRecordId = null;
            loadDashboardMetrics();
            loadShortageWatchlist();
        } catch (err) {
            App.showToast(err.message, 'danger');
        }
    });
}
