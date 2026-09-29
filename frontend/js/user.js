/**
 * AttendEase - Student & User Portal JS
 */

let allStudents = [];
let selectedStudent = null;

document.addEventListener('DOMContentLoaded', async () => {
    await loadStudentList();

    const select = document.getElementById('user-student-select');
    const searchBtn = document.getElementById('user-search-btn');
    const rollInput = document.getElementById('user-roll-input');

    select.addEventListener('change', (e) => {
        const studentId = parseInt(e.target.value, 10);
        if (studentId) {
            selectStudentById(studentId);
        }
    });

    searchBtn.addEventListener('click', () => {
        searchByRoll(rollInput.value.trim());
    });

    rollInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            searchByRoll(rollInput.value.trim());
        }
    });

    // Check URL parameters (e.g. ?studentId=1 or ?roll=23CS001)
    const urlParams = new URLSearchParams(window.location.search);
    const paramId = urlParams.get('studentId');
    const paramRoll = urlParams.get('roll');

    if (paramId) {
        selectStudentById(parseInt(paramId, 10));
    } else if (paramRoll) {
        searchByRoll(paramRoll);
    } else if (allStudents.length > 0) {
        selectStudentById(allStudents[0].id);
    }
});

/**
 * Load all students into dropdown
 */
async function loadStudentList() {
    try {
        allStudents = await App.fetchJson(`${App.API_BASE}/students`);
        const select = document.getElementById('user-student-select');
        if (!allStudents || allStudents.length === 0) {
            select.innerHTML = '<option value="">No students registered yet</option>';
            return;
        }

        select.innerHTML = allStudents.map(s => `
            <option value="${s.id}">${App.escapeHtml(s.rollNumber)} - ${App.escapeHtml(s.name)} (${App.escapeHtml(s.department)})</option>
        `).join('');
    } catch (err) {
        console.error('Failed to load students:', err);
        App.showToast('Failed to load student directory', 'danger');
    }
}

/**
 * Select student by ID and refresh profile
 */
function selectStudentById(studentId) {
    const student = allStudents.find(s => s.id === studentId);
    if (!student) {
        App.showToast('Student not found', 'warning');
        return;
    }
    selectedStudent = student;
    document.getElementById('user-student-select').value = student.id;
    updateStudentProfile(student);
    loadStudentAttendanceData(student.id);
    loadStudentHistoryRecords(student.id);
}

/**
 * Search student by roll number
 */
async function searchByRoll(roll) {
    if (!roll) {
        App.showToast('Please enter a roll number to search', 'warning');
        return;
    }
    try {
        const student = await App.fetchJson(`${App.API_BASE}/students/roll/${encodeURIComponent(roll)}`);
        selectedStudent = student;
        document.getElementById('user-student-select').value = student.id;
        updateStudentProfile(student);
        loadStudentAttendanceData(student.id);
        loadStudentHistoryRecords(student.id);
        App.showToast(`Found student: ${student.name}`, 'success');
    } catch (err) {
        App.showToast(err.message, 'danger');
    }
}

/**
 * Render student personal header card
 */
function updateStudentProfile(student) {
    document.getElementById('user-name').textContent = student.name;
    document.getElementById('user-roll').textContent = student.rollNumber;
    document.getElementById('user-dept').textContent = `Department of ${student.department}`;
    document.getElementById('user-year').textContent = student.year;
    document.getElementById('user-email').textContent = student.email;

    // Avatar initials
    const initials = student.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    document.getElementById('user-avatar').textContent = initials;
}

/**
 * Fetch and calculate attendance summaries across all subjects
 */
async function loadStudentAttendanceData(studentId) {
    const tbody = document.getElementById('user-subjects-tbody');
    try {
        const summaries = await App.fetchJson(`${App.API_BASE}/attendance/student/${studentId}`);

        if (!summaries || summaries.length === 0) {
            tbody.innerHTML = `<tr><td colspan="8" class="text-center py-4 text-muted">No attendance data found for this student.</td></tr>`;
            resetSummaryCounters();
            return;
        }

        // Calculate overall metrics
        let totalSessionsSum = 0;
        let totalPresentSum = 0;
        let totalAbsentSum = 0;
        let hasShortage = false;

        tbody.innerHTML = summaries.map(item => {
            totalSessionsSum += item.totalClasses;
            totalPresentSum += item.present;
            totalAbsentSum += item.absent;

            if (item.shortage) hasShortage = true;

            const isShort = item.shortage;
            const pct = item.percentage;
            const barColor = isShort ? 'bg-danger' : (pct >= 85 ? 'bg-success' : 'bg-primary');
            const badgeClass = isShort ? 'badge-shortage' : 'badge-safe';
            const badgeText = isShort ? 'SHORTAGE (<75%)' : 'ELIGIBLE';

            return `
                <tr>
                    <td class="fw-bold">${App.escapeHtml(item.subjectCode)}</td>
                    <td>${App.escapeHtml(item.subjectName)}</td>
                    <td><span class="badge bg-light text-dark border">${item.totalClasses}</span></td>
                    <td class="text-success fw-semibold">${item.present}</td>
                    <td class="text-danger fw-semibold">${item.absent}</td>
                    <td>
                        <div class="progress progress-attendance">
                            <div class="progress-bar ${barColor}" style="width: ${Math.min(pct, 100)}%"></div>
                        </div>
                    </td>
                    <td>
                        <strong class="${isShort ? 'text-danger' : 'text-success'}">${pct.toFixed(2)}%</strong>
                    </td>
                    <td>
                        <span class="${badgeClass}">
                            <i class="bi ${isShort ? 'bi-exclamation-circle' : 'bi-check-circle'} me-1"></i>${badgeText}
                        </span>
                    </td>
                </tr>
            `;
        }).join('');

        // Compute overall percentage
        const overallPct = totalSessionsSum > 0 ? (totalPresentSum / totalSessionsSum) * 100 : 0.0;
        const isOverallShortage = totalSessionsSum > 0 && overallPct < 75.0;

        document.getElementById('user-overall-pct').textContent = `${overallPct.toFixed(1)}%`;
        document.getElementById('user-overall-pct').className = `stat-value ${isOverallShortage ? 'text-danger' : 'text-success'}`;
        document.getElementById('user-total-classes').textContent = totalSessionsSum;
        document.getElementById('user-attended-classes').textContent = totalPresentSum;
        document.getElementById('user-missed-classes').textContent = totalAbsentSum;

        // Update standing badge
        const standingBadge = document.getElementById('user-standing-badge');
        if (isOverallShortage) {
            standingBadge.textContent = 'Attendance Shortage';
            standingBadge.className = 'badge bg-danger px-3 py-1';
        } else {
            standingBadge.textContent = 'Good Standing (Eligible)';
            standingBadge.className = 'badge bg-success px-3 py-1';
        }

        // Smart Attendance Advisor logic
        renderAttendanceAdvisor(totalSessionsSum, totalPresentSum, overallPct);

    } catch (err) {
        console.error('Error loading student attendance:', err);
        tbody.innerHTML = `<tr><td colspan="8" class="text-center py-3 text-danger">Failed to load attendance metrics.</td></tr>`;
    }
}

/**
 * Smart Advisor: Calculate required classes or safe skips
 */
function renderAttendanceAdvisor(total, present, pct) {
    const box = document.getElementById('user-advisor-box');
    const textEl = document.getElementById('user-advisor-text');

    if (total === 0) {
        box.className = 'prediction-box bg-light border text-muted';
        box.innerHTML = `<i class="bi bi-info-circle fs-4"></i><div>No class sessions have been conducted yet this semester.</div>`;
        return;
    }

    if (pct < 75.0) {
        // Need to reach 75%: (present + x) / (total + x) >= 0.75 => x >= (0.75*total - present) / 0.25
        const needed = Math.ceil((0.75 * total - present) / 0.25);
        box.className = 'prediction-box shortage-alert';
        box.innerHTML = `
            <i class="bi bi-exclamation-triangle-fill fs-3 text-danger"></i>
            <div>
                <strong>Attendance Warning:</strong> Your cumulative attendance is <strong>${pct.toFixed(1)}%</strong> (Threshold is 75%).
                <br>
                <span>You must attend the next <strong>${needed} consecutive class${needed > 1 ? 'es' : ''}</strong> without missing any to restore safe eligibility.</span>
            </div>
        `;
    } else {
        // Safe buffer: present / (total + y) >= 0.75 => y <= (present - 0.75*total) / 0.75
        const safeMiss = Math.floor((present - 0.75 * total) / 0.75);
        box.className = 'prediction-box safe-alert';
        box.innerHTML = `
            <i class="bi bi-check-circle-fill fs-3 text-success"></i>
            <div>
                <strong>Great Job!</strong> You are in good standing with <strong>${pct.toFixed(1)}%</strong> cumulative attendance.
                <br>
                <span>You can safely miss up to <strong>${Math.max(safeMiss, 0)} class${safeMiss === 1 ? '' : 'es'}</strong> and still maintain your attendance above 75%.</span>
            </div>
        `;
    }
}

/**
 * Load student's chronological session attendance history
 */
async function loadStudentHistoryRecords(studentId) {
    const tbody = document.getElementById('user-history-tbody');
    const countBadge = document.getElementById('user-history-count');
    try {
        const records = await App.fetchJson(`${App.API_BASE}/attendance/records/student/${studentId}`);

        if (!records || records.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" class="text-center py-4 text-muted">No attendance logs found for this student.</td></tr>`;
            countBadge.textContent = '0 Records';
            return;
        }

        countBadge.textContent = `${records.length} Record${records.length > 1 ? 's' : ''}`;
        tbody.innerHTML = records.map(r => {
            const isPresent = r.status === 'PRESENT';
            const badgeClass = isPresent ? 'badge bg-success' : 'badge bg-danger';
            const icon = isPresent ? 'bi-check-lg' : 'bi-x-lg';

            return `
                <tr>
                    <td><span class="text-muted small">#${r.id}</span></td>
                    <td>
                        <span class="fw-semibold">${App.escapeHtml(r.subjectCode)}</span> - 
                        <span class="text-muted small">${App.escapeHtml(r.subjectName)}</span>
                    </td>
                    <td><i class="bi bi-calendar3 me-1 text-muted"></i>${App.formatDate(r.sessionDate)}</td>
                    <td><small class="text-muted">${App.formatDateTime(r.markedAt)}</small></td>
                    <td>
                        <span class="${badgeClass} px-3 py-1">
                            <i class="bi ${icon} me-1"></i>${r.status}
                        </span>
                    </td>
                </tr>
            `;
        }).join('');
    } catch (err) {
        console.error('Error loading attendance records history:', err);
        tbody.innerHTML = `<tr><td colspan="5" class="text-center py-3 text-muted">History unavailable.</td></tr>`;
    }
}

function resetSummaryCounters() {
    document.getElementById('user-overall-pct').textContent = '0.0%';
    document.getElementById('user-total-classes').textContent = '0';
    document.getElementById('user-attended-classes').textContent = '0';
    document.getElementById('user-missed-classes').textContent = '0';
    renderAttendanceAdvisor(0, 0, 0);
}
