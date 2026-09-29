// AttendEase - Subjects Management JavaScript
let allSubjects = [];
let subjectModal;

document.addEventListener('DOMContentLoaded', () => {
    subjectModal = new bootstrap.Modal(document.getElementById('subjectModal'));
    loadSubjects();

    const searchInput = document.getElementById('searchSubjectInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            filterSubjects(e.target.value.trim().toLowerCase());
        });
    }

    const subjectForm = document.getElementById('subjectForm');
    if (subjectForm) {
        subjectForm.addEventListener('submit', handleSubjectSubmit);
    }
});

async function loadSubjects() {
    const tableBody = document.getElementById('subjects-table-body');
    try {
        const response = await fetch(`${API_BASE}/subjects`);
        if (!response.ok) throw new Error('Failed to load subjects');
        allSubjects = await response.json();
        renderSubjects(allSubjects);
    } catch (error) {
        console.error('Error fetching subjects:', error);
        tableBody.innerHTML = '<tr><td colspan="5" class="text-center text-danger py-4">Failed to load subjects list</td></tr>';
        showNotification('Failed to load subjects list', 'danger');
    }
}

function renderSubjects(subjects) {
    const tableBody = document.getElementById('subjects-table-body');
    tableBody.innerHTML = '';

    if (subjects.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5" class="text-center text-muted py-4">No subjects found</td></tr>';
        return;
    }

    subjects.forEach((subject, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${index + 1}</td>
            <td><span class="badge bg-primary text-uppercase">${subject.subjectCode}</span></td>
            <td><strong>${subject.subjectName}</strong></td>
            <td>${subject.department}</td>
            <td>
                <div class="btn-group btn-group-sm">
                    <a href="sessions.html?subjectId=${subject.id}" class="btn btn-outline-info" title="View Sessions">
                        <i class="bi bi-calendar-event"></i>
                    </a>
                    <button class="btn btn-outline-primary" onclick="openEditSubjectModal(${subject.id})" title="Edit">
                        <i class="bi bi-pencil-square"></i>
                    </button>
                    <button class="btn btn-outline-danger" onclick="confirmDeleteSubject(${subject.id}, '${subject.subjectName}')" title="Delete">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </td>
        `;
        tableBody.appendChild(tr);
    });
}

function filterSubjects(searchTerm) {
    if (!searchTerm) {
        renderSubjects(allSubjects);
        return;
    }
    const filtered = allSubjects.filter(s =>
        s.subjectCode.toLowerCase().includes(searchTerm) ||
        s.subjectName.toLowerCase().includes(searchTerm) ||
        s.department.toLowerCase().includes(searchTerm)
    );
    renderSubjects(filtered);
}

function openAddSubjectModal() {
    document.getElementById('subjectModalTitle').textContent = 'Add New Subject';
    document.getElementById('subjectForm').reset();
    document.getElementById('subjectId').value = '';
    subjectModal.show();
}

function openEditSubjectModal(id) {
    const subject = allSubjects.find(s => s.id === id);
    if (!subject) return;

    document.getElementById('subjectModalTitle').textContent = 'Edit Subject';
    document.getElementById('subjectId').value = subject.id;
    document.getElementById('subjectCode').value = subject.subjectCode;
    document.getElementById('subjectName').value = subject.subjectName;
    document.getElementById('subjectDepartment').value = subject.department;

    subjectModal.show();
}

async function handleSubjectSubmit(e) {
    e.preventDefault();

    const id = document.getElementById('subjectId').value;
    const payload = {
        subjectCode: document.getElementById('subjectCode').value.trim().toUpperCase(),
        subjectName: document.getElementById('subjectName').value.trim(),
        department: document.getElementById('subjectDepartment').value.trim()
    };

    const isEdit = !!id;
    const url = isEdit ? `${API_BASE}/subjects/${id}` : `${API_BASE}/subjects`;
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

        subjectModal.hide();
        showNotification(isEdit ? 'Subject updated successfully!' : 'Subject created successfully!', 'success');
        loadSubjects();
    } catch (error) {
        console.error('Error saving subject:', error);
        showNotification('Failed to save subject', 'danger');
    }
}

async function confirmDeleteSubject(id, name) {
    if (!confirm(`Are you sure you want to delete subject "${name}"? This will delete all its sessions and attendance records.`)) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/subjects/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            const errorMsg = await handleApiError(response);
            showNotification(errorMsg, 'danger');
            return;
        }

        showNotification(`Subject "${name}" deleted successfully`, 'success');
        loadSubjects();
    } catch (error) {
        console.error('Error deleting subject:', error);
        showNotification('Failed to delete subject', 'danger');
    }
}
