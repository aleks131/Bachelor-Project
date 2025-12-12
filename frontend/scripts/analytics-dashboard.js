class AnalyticsDashboard {
    constructor() {
        this.data = null;
        this.charts = {};
        this.init();
    }

    async init() {
        // Load Chart.js if not loaded
        if (typeof Chart === 'undefined') {
            await this.loadChartJS();
        }
    }

    async loadChartJS() {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    async loadAnalytics(startDate = null, endDate = null) {
        try {
            let url = '/api/analytics';
            if (startDate || endDate) {
                const params = new URLSearchParams();
                if (startDate) params.append('startDate', startDate);
                if (endDate) params.append('endDate', endDate);
                url += '?' + params.toString();
            }

            const response = await fetch(url);
            if (!response.ok) throw new Error('Failed to load analytics');

            const data = await response.json();
            this.data = data;
            
            return data;
        } catch (error) {
            console.error('Error loading analytics:', error);
            if (window.toast) {
                toast.error('Failed to load analytics data');
            }
            return null;
        }
    }

    renderDashboard(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        if (!this.data) {
            container.innerHTML = '<div class="loading">Loading analytics...</div>';
            return;
        }

        container.innerHTML = `
            <div class="analytics-dashboard">
                <div class="analytics-header">
                    <h2>Analytics Dashboard</h2>
                    <div class="analytics-filters">
                        <input type="date" id="analytics-start-date" class="form-input">
                        <span>to</span>
                        <input type="date" id="analytics-end-date" class="form-input">
                        <button id="apply-analytics-filter" class="btn btn-primary">
                            <i class="fas fa-filter"></i> Apply
                        </button>
                    </div>
                </div>

                <div class="analytics-grid">
                    <div class="analytics-card">
                        <h3>Total Events</h3>
                        <div class="analytics-value">${this.data.summary.totalEvents.toLocaleString()}</div>
                    </div>

                    <div class="analytics-card">
                        <h3>Events by Type</h3>
                        <canvas id="events-by-type-chart"></canvas>
                    </div>

                    <div class="analytics-card">
                        <h3>Events by Day</h3>
                        <canvas id="events-by-day-chart"></canvas>
                    </div>

                    <div class="analytics-card">
                        <h3>Top Users</h3>
                        <canvas id="top-users-chart"></canvas>
                    </div>
                </div>

                <div class="analytics-table-section">
                    <h3>Recent Events</h3>
                    <div class="analytics-table-container">
                        <table class="analytics-table">
                            <thead>
                                <tr>
                                    <th>Time</th>
                                    <th>Type</th>
                                    <th>User</th>
                                    <th>Details</th>
                                </th>
                            </thead>
                            <tbody id="analytics-events-tbody">
                                ${this.renderRecentEvents()}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;

        // Render charts
        this.renderCharts();

        // Setup filters
        document.getElementById('apply-analytics-filter').addEventListener('click', () => {
            const startDate = document.getElementById('analytics-start-date').value;
            const endDate = document.getElementById('analytics-end-date').value;
            this.loadAnalytics(startDate, endDate).then(() => {
                this.renderDashboard(containerId);
            });
        });
    }

    renderRecentEvents() {
        if (!this.data.summary.recent || this.data.summary.recent.length === 0) {
            return '<tr><td colspan="4">No recent events</td></tr>';
        }

        return this.data.summary.recent.slice(0, 50).map(event => `
            <tr>
                <td>${new Date(event.timestamp).toLocaleString()}</td>
                <td><span class="event-type-badge event-${event.type}">${event.type}</span></td>
                <td>User #${event.userId}</td>
                <td>${JSON.stringify(event.details || {}).substring(0, 50)}...</td>
            </tr>
        `).join('');
    }

    renderCharts() {
        if (typeof Chart === 'undefined') {
            setTimeout(() => this.renderCharts(), 100);
            return;
        }

        // Events by Type
        this.renderEventsByTypeChart();
        
        // Events by Day
        this.renderEventsByDayChart();
        
        // Top Users
        this.renderTopUsersChart();
    }

    renderEventsByTypeChart() {
        const canvas = document.getElementById('events-by-type-chart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const typeData = this.data.summary.byType || {};

        this.charts.eventsByType = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(typeData),
                datasets: [{
                    data: Object.values(typeData),
                    backgroundColor: [
                        '#4a90e2',
                        '#4caf50',
                        '#ff9800',
                        '#f44336',
                        '#9c27b0',
                        '#00bcd4'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true
            }
        });
    }

    renderEventsByDayChart() {
        const canvas = document.getElementById('events-by-day-chart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const dayData = this.data.summary.byDay || {};

        // Sort by date
        const sortedDays = Object.keys(dayData).sort();

        this.charts.eventsByDay = new Chart(ctx, {
            type: 'line',
            data: {
                labels: sortedDays.map(d => new Date(d).toLocaleDateString()),
                datasets: [{
                    label: 'Events',
                    data: sortedDays.map(d => dayData[d]),
                    borderColor: '#4a90e2',
                    backgroundColor: 'rgba(74, 144, 226, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    renderTopUsersChart() {
        const canvas = document.getElementById('top-users-chart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const userData = this.data.summary.byUser || {};

        // Get top 10
        const sortedUsers = Object.entries(userData)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10);

        this.charts.topUsers = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: sortedUsers.map(([userId]) => `User #${userId}`),
                datasets: [{
                    label: 'Events',
                    data: sortedUsers.map(([, count]) => count),
                    backgroundColor: '#4a90e2'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                indexAxis: 'y',
                scales: {
                    x: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
}

const analyticsDashboard = new AnalyticsDashboard();
window.analyticsDashboard = analyticsDashboard;
