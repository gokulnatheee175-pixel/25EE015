// AttendEase Shared Application JavaScript
// Supports standalone frontend hosting (e.g. port 3000, 5500, file://) or unified hosting
const API_BASE = (window.location.protocol === 'file:' || (window.location.port !== '8080' && window.location.port !== ''))
    ? 'http://localhost:8080/api'
    : '/api';

/**
 * Show a toast notification
 * @param {string} message 
 * @param {'success'|'danger'|'warning'|'info'} type 
 */
function showNotification(message, type = 'info') {
    let container = document.getElementById('notification-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'notification-container';
        document.body.appendChild(container);
    }

    const icons = {
        success: 'bi-check-circle-fill',
        danger: 'bi-exclamation-triangle-fill',
        warning: 'bi-exclamation-circle-fill',
        info: 'bi-info-circle-fill'
    };

    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show shadow-sm d-flex align-items-center`;
    alertDiv.setAttribute('role', 'alert');
    alertDiv.innerHTML = `
        <i class="bi ${icons[type] || 'bi-info-circle-fill'} me-2 fs-5"></i>
        <div class="flex-grow-1">${message}</div>
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;

    container.appendChild(alertDiv);

    setTimeout(() => {
        alertDiv.classList.remove('show');
        setTimeout(() => alertDiv.remove(), 300);
    }, 4500);
}

/**
 * Handle API error response cleanly
 */
async function handleApiError(response) {
    try {
        const errorData = await response.json();
        return errorData.message || `Request failed with status ${response.status}`;
    } catch (e) {
        return `Request failed with status ${response.status}`;
    }
}

/**
 * Format date string YYYY-MM-DD into readable format
 */
function formatDate(dateStr) {
    if (!dateStr) return '-';
    try {
        const [year, month, day] = dateStr.split('-');
        const date = new Date(year, month - 1, day);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            weekday: 'short'
        });
    } catch (e) {
        return dateStr;
    }
}

/**
 * Format time string HH:mm into 12-hour format
 */
function formatTime(timeStr) {
    if (!timeStr) return '-';
    try {
        const parts = timeStr.split(':');
        let hours = parseInt(parts[0], 10);
        const minutes = parts[1];
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12;
        return `${hours}:${minutes} ${ampm}`;
    } catch (e) {
        return timeStr;
    }
}

// Highlight current page in sidebar
document.addEventListener('DOMContentLoaded', () => {
    const currentPath = window.location.pathname;
    const links = document.querySelectorAll('.sidebar-menu .nav-link');
    links.forEach(link => {
        const href = link.getAttribute('href');
        if (currentPath.endsWith(href) || (currentPath === '/' && href === 'dashboard.html')) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    // Mobile sidebar toggle if button exists
    const toggleBtn = document.getElementById('sidebar-toggle');
    const sidebar = document.querySelector('.sidebar');
    if (toggleBtn && sidebar) {
        toggleBtn.addEventListener('click', () => {
            sidebar.classList.toggle('open');
        });
    }
});
