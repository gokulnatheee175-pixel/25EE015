// AttendEase - Students Management JavaScript
let allStudents = [];
let studentModal;

document.addEventListener('DOMContentLoaded', () => {
    studentModal = new bootstrap.Modal(document.getElementById('studentModal'));
    loadStudents();

    // Search filter event
    const searchInput = document.getElementById('searchStudentInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            filterStudents(e.target.value.trim().toLowerCase());
        });
    }

    // Form submit
    const studentForm = document.getElementById('studentForm');
    if (studentForm) {
        studentForm.addEventListener('submit', handleStudentSubmit);
    }
});

async function loadStudents() {
    const tableBody = document.getElementById('students-table-body');
    try {
        const response = await fetch(`${API_BASE}/students`);
        if (!response.ok) throw new Error('Failed to load students');
        allStudents = await response.json();
        renderStudents(allStudents);
    } catch (error) {
        console.error('Error fetching students:', error);
        tableBody.innerHTML = '<tr><td colspan="7" class="text-center text-danger py-4">Failed to load students list</td></tr>';
        showNotification('Failed to load students list', 'danger');
    }
}

function renderStudents(students) {
    const tableBody = document.getElementById('students-table-body');
    tableBody.innerHTML = '';

    if (students.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="7" class="text-center text-muted py-4">No students found</td></tr>';
        return;
    }

    students.forEach((student, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${index + 1}</td>
            <td><strong class="text-primary">${student.rollNumber}</strong></td>
            <td>${student.name}</td>
            <td><a href="mailto:${student.email}" class="text-muted text-decoration-none">${student.email}</a></td>
            <td>${student.department}</td>
            <td><span class="badge bg-secondary">Year ${student.year}</span></td>
            <td>
                <div class="btn-group btn-group-sm">
                    <a href="student-attendance.html?studentId=${student.id}" class="btn btn-outline-info" title="View Attendance">
                        <i class="bi bi-graph-up"></i>
                    </a>
                    <button class="btn btn-outline-primary" onclick="openEditStudentModal(${student.id})" title="Edit">
                        <i class="bi bi-pencil-square"></i>
                    </button>
                    <button class="btn btn-outline-danger" onclick="confirmDeleteStudent(${student.id}, '${student.name}')" title="Delete">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </td>
        `;
        tableBody.appendChild(tr);
    });
}

function filterStudents(searchTerm) {
    if (!searchTerm) {
        renderStudents(allStudents);
        return;
    }
    const filtered = allStudents.filter(s =>
        s.rollNumber.toLowerCase().includes(searchTerm) ||
        s.name.toLowerCase().includes(searchTerm) ||
        s.department.toLowerCase().includes(searchTerm) ||
        s.email.toLowerCase().includes(searchTerm)
    );
    renderStudents(filtered);
}

function openAddStudentModal() {
    document.getElementById('studentModalTitle').textContent = 'Add New Student';
    document.getElementById('studentForm').reset();
    document.getElementById('studentId').value = '';
    studentModal.show();
}

function openEditStudentModal(id) {
    const student = allStudents.find(s => s.id === id);
    if (!student) return;

    document.getElementById('studentModalTitle').textContent = 'Edit Student';
    document.getElementById('studentId').value = student.id;
    document.getElementById('rollNumber').value = student.rollNumber;
    document.getElementById('studentName').value = student.name;
    document.getElementById('studentEmail').value = student.email;
    document.getElementById('studentDepartment').value = student.department;
    document.getElementById('studentYear').value = student.year;

    studentModal.show();
}

async function handleStudentSubmit(e) {
    e.preventDefault();

    const id = document.getElementById('studentId').value;
    const payload = {
        rollNumber: document.getElementById('rollNumber').value.trim(),
        name: document.getElementById('studentName').value.trim(),
        email: document.getElementById('studentEmail').value.trim(),
        department: document.getElementById('studentDepartment').value.trim(),
        year: parseInt(document.getElementById('studentYear').value, 10)
    };

    const isEdit = !!id;
    const url = isEdit ? `${API_BASE}/students/${id}` : `${API_BASE}/students`;
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

        studentModal.hide();
        showNotification(isEdit ? 'Student updated successfully!' : 'Student created successfully!', 'success');
        loadStudents();
    } catch (error) {
        console.error('Error saving student:', error);
        showNotification('Failed to save student', 'danger');
    }
}

async function confirmDeleteStudent(id, name) {
    if (!confirm(`Are you sure you want to delete student "${name}"? This will also remove associated attendance records.`)) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/students/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            const errorMsg = await handleApiError(response);
            showNotification(errorMsg, 'danger');
            return;
        }

        showNotification(`Student "${name}" deleted successfully`, 'success');
        loadStudents();
    } catch (error) {
        console.error('Error deleting student:', error);
        showNotification('Failed to delete student', 'danger');
    }
}
