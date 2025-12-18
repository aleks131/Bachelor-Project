// UI Controller for Enhanced Dashboard
document.addEventListener('DOMContentLoaded', () => {
    initializeSidebar();
    initializeWidgets();
    updateDateTime();
    initializeNotifications();
});

// Sidebar Management
function initializeSidebar() {
    const toggleBtn = document.getElementById('sidebarToggle');
    const body = document.body;
    
    // Check local storage preference
    const isSidebarOpen = localStorage.getItem('sidebarOpen') === 'true';
    if (isSidebarOpen) {
        body.classList.add('sidebar-visible', 'sidebar-open');
    }

    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            body.classList.toggle('sidebar-visible');
            body.classList.toggle('sidebar-open');
            localStorage.setItem('sidebarOpen', body.classList.contains('sidebar-visible'));
        });
    }

    // Close on mobile when clicking outside
    document.addEventListener('click', (e) => {
        if (window.innerWidth < 1024 && 
            body.classList.contains('sidebar-visible') && 
            !e.target.closest('.modern-sidebar') && 
            !e.target.closest('#sidebarToggle')) {
            body.classList.remove('sidebar-visible', 'sidebar-open');
        }
    });
}

// Widget Functionality
function initializeWidgets() {
    // animate numbers
    const stats = document.querySelectorAll('.stat-info .value');
    stats.forEach(stat => {
        const finalValue = parseInt(stat.innerText.replace(/[^0-9]/g, ''));
        animateValue(stat, 0, finalValue, 1500);
    });

    // Quick Actions
    document.querySelectorAll('.action-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const action = e.currentTarget.dataset.action;
            handleQuickAction(action);
        });
    });
}

function animateValue(obj, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        
        // Add commas for thousands
        const current = Math.floor(progress * (end - start) + start);
        obj.innerHTML = current.toLocaleString();
        
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

function updateDateTime() {
    const dateElement = document.getElementById('currentDate');
    const timeElement = document.getElementById('currentTime');
    
    if (dateElement) {
        const now = new Date();
        const options = { weekday: 'long', month: 'long', day: 'numeric' };
        dateElement.innerText = now.toLocaleDateString('en-US', options);
    }

    setInterval(() => {
        if (timeElement) {
            timeElement.innerText = new Date().toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
        }
    }, 1000);
}

function handleQuickAction(action) {
    switch(action) {
        case 'upload':
            // Trigger upload modal
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.click();
            break;
        case 'plan':
            window.location.href = 'apps/daily-plan.html';
            break;
        case 'settings':
            document.querySelector('.settings-toggle').click();
            break;
    }
}

// Notification System
function initializeNotifications() {
    const bell = document.getElementById('notificationBell');
    const panel = document.getElementById('notificationPanel');
    
    if (bell && panel) {
        bell.addEventListener('click', () => {
            panel.classList.toggle('active');
            bell.classList.remove('has-new');
        });
    }

    // Simulate notifications
    setTimeout(() => {
        addNotification('System', 'Backup completed successfully', 'success');
        if (bell) bell.classList.add('has-new');
    }, 5000);
}

function addNotification(title, message, type = 'info') {
    const list = document.querySelector('.notification-list');
    if (!list) return;

    const item = document.createElement('div');
    item.className = `notification-item ${type}`;
    item.innerHTML = `
        <div class="notif-icon"><i class="fas fa-${getIconForType(type)}"></i></div>
        <div class="notif-content">
            <h4>${title}</h4>
            <p>${message}</p>
            <span class="time">Just now</span>
        </div>
    `;
    
    list.prepend(item);
}

function getIconForType(type) {
    switch(type) {
        case 'success': return 'check-circle';
        case 'warning': return 'exclamation-triangle';
        case 'error': return 'times-circle';
        default: return 'info-circle';
    }
}

