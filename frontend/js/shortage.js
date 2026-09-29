// AttendEase - Shortage Students JavaScript
let allSubjects = [];

document.addEventListener('DOMContentLoaded', () => {
    loadSubjectsFilter();
    loadShortageStudents();

    document.getElementById('shortageSubjectFilter').addEventListener('change', (e) => {
        loadShortageStudents(e.target.value);
    });

    const searchInput = document.getElementById('searchShortageInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            filterShortageTable(e.target.value.trim().toLowerCase());
        });
    }
});

let currentShortageList = [];

async function loadSubjectsFilter() {
    try {
        const response = await fetch(`${API_BASE}/subjects`);
        if (!response.ok) throw new Error('Failed to load subjects');
        allSubjects = await response.json();

        const select = document.getElementById('shortageSubjectFilter');
        select.innerHTML = '<option value="">All Subjects</option>';
        allSubjects.forEach(sub => {
            select.innerHTML += `<option value="${sub.id}">${sub.subjectCode} - ${sub.subjectName}</option>`;
        });
    } catch (e) {
        console.error(e);
    }
}

async function loadShortageStudents(subjectId = '') {
    const tableBody = document.getElementById('shortage-table-body');
    let url = `${API_BASE}/attendance/shortage`;
    if (subjectId) {
        url += `?subjectId=${subjectId}`;
    }

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to load shortage list');
        currentShortageList = await response.json();
        renderShortageTable(currentShortageList);
    } catch (e) {
        console.error(e);
        tableBody.innerHTML = '<tr><td colspan="7" class="text-center text-danger py-4">Failed to load shortage students</td></tr>';
        showNotification('Failed to load shortage students', 'danger');
    }
}

function renderShortageTable(list) {
    const tableBody = document.getElementById('shortage-table-body');
    const countBadge = document.getElementById('shortage-count-badge');
    countBadge.textContent = `${list.length} Defaulters`;
    tableBody.innerHTML = '';

    if (list.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="7" class="text-center text-success py-4"><i class="bi bi-check-circle-fill me-2 fs-5"></i>No students have attendance shortage under the current criteria!</td></tr>';
        return;
    }

    list.forEach((item, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${index + 1}</td>
            <td><code>${item.rollNumber}</code></td>
            <td><strong>${item.studentName}</strong></td>
            <td><span class="badge bg-light text-dark border">${item.subjectCode} - ${item.subjectName}</span></td>
            <td>${item.present} / ${item.totalClasses}</td>
            <td style="min-width: 170px;">
                <div class="d-flex align-items-center gap-2">
                    <div class="progress flex-grow-1 progress-attendance">
                        <div class="progress-bar bg-danger" style="width: ${Math.min(item.percentage, 100)}%"></div>
                    </div>
                    <span class="fw-bold text-danger">${item.percentage}%</span>
                </div>
            </td>
            <td>
                <span class="badge-shortage">
                    <i class="bi bi-exclamation-octagon-fill me-1"></i>SHORTAGE
                </span>
            </td>
        `;
        tableBody.appendChild(tr);
    });
}

function filterShortageTable(term) {
    if (!term) {
        renderShortageTable(currentShortageList);
        return;
    }

    const filtered = currentShortageList.filter(item =>
        item.rollNumber.toLowerCase().includes(term) ||
        item.studentName.toLowerCase().includes(term) ||
        item.subjectName.toLowerCase().includes(term) ||
        item.subjectCode.toLowerCase().includes(term)
    );
    renderShortageTable(filtered);
}
