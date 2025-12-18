class DailyPlanViewer {
    constructor() {
        this.scheduleManager = new ScheduleManager();
        this.ws = null;
        this.isFullscreen = false;
        this.currentImage = null;
        this.images = {
            Morning: [],
            Evening: [],
            Night: []
        };
        this.userConfig = null;

        this.planImage = document.getElementById('plan-image');
        this.loading = document.getElementById('loading');
        this.noImage = document.getElementById('no-image');
        this.currentTime = document.getElementById('current-time');
        this.currentSchedule = document.getElementById('current-schedule');
        this.scheduleName = document.getElementById('schedule-name');
        this.scheduleTime = document.getElementById('schedule-time');
        this.nextScheduleName = document.getElementById('next-schedule-name');
        this.nextScheduleTime = document.getElementById('next-schedule-time');
        this.fullscreenBtn = document.getElementById('fullscreen');
        this.refreshBtn = document.getElementById('refresh');
        this.fullscreenExitBtn = document.querySelector('.fullscreen-exit');
        this.backBtn = document.getElementById('back-to-dashboard');

        this.initializeEventListeners();
        this.loadUserConfig();
    }

    async loadUserConfig() {
        try {
            const response = await fetch('/api/current-user');
            const data = await response.json();
            this.userConfig = data.user;
            this.initializeWebSocket();
            this.loadImages();
            this.startTimeUpdater();
            this.startScheduleChecker();
        } catch (error) {
            console.error('Error loading user config:', error);
            window.location.href = '/dashboard';
        }
    }

    initializeEventListeners() {
        this.fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
        this.fullscreenExitBtn.addEventListener('click', () => this.exitFullscreen());
        this.refreshBtn.addEventListener('click', () => this.refreshContent());
        this.backBtn.addEventListener('click', () => {
            window.location.href = '/dashboard';
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'F11') {
                e.preventDefault();
                this.toggleFullscreen();
            } else if (e.key === 'Escape' && this.isFullscreen) {
                this.exitFullscreen();
            } else if (e.key === 'F5') {
                e.preventDefault();
                this.refreshContent();
            }
        });

        document.addEventListener('fullscreenchange', () => this.handleFullscreenChange());
        document.addEventListener('webkitfullscreenchange', () => this.handleFullscreenChange());
        document.addEventListener('mozfullscreenchange', () => this.handleFullscreenChange());
        document.addEventListener('MSFullscreenChange', () => this.handleFullscreenChange());
    }

    initializeWebSocket() {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const port = window.location.port || '3000';
        const wsUrl = `${protocol}//${window.location.hostname}:${port}/ws/daily-plan`;
        
        this.ws = new WebSocket(wsUrl);
        
        this.ws.onopen = () => {
            console.log('WebSocket Connected');
            this.startPingInterval();
        };
        
        this.ws.onmessage = async (event) => {
            try {
                const message = JSON.parse(event.data);
                
                if (message.type === 'ping') {
                    this.ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
                    return;
                }
                
                if (message.type === 'pong') {
                    return;
                }
                
                console.log('Received WebSocket message:', message);

                if (message.type === 'IMAGES_UPDATED' || message.type === 'FOLDER_UPDATED') {
                    console.log('Images updated, reloading...');
                    
                    if (window.notificationSystem && message.path) {
                        const action = message.event === 'add' ? 'added' : 
                                      message.event === 'unlink' ? 'deleted' : 'changed';
                        notificationSystem.notifyFileChange(message.path, action);
                    }
                    
                    await this.loadImages();
                }
            } catch (error) {
                console.error('Error processing WebSocket message:', error);
            }
        };

        this.ws.onclose = () => {
            console.log('WebSocket connection closed. Attempting to reconnect...');
            this.stopPingInterval();
            setTimeout(() => this.initializeWebSocket(), 2000);
        };

        this.ws.onerror = (error) => {
            console.error('WebSocket error:', error);
        };
    }
    
    startPingInterval() {
        this.stopPingInterval();
        this.pingInterval = setInterval(() => {
            if (this.ws && this.ws.readyState === WebSocket.OPEN) {
                this.ws.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }));
            }
        }, 30000);
    }
    
    stopPingInterval() {
        if (this.pingInterval) {
            clearInterval(this.pingInterval);
            this.pingInterval = null;
        }
    }

    async loadImages() {
        try {
            this.showLoading();
            const response = await fetch('/api/daily-plan/images');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            
            this.images = {
                Morning: data.Morning || [],
                Evening: data.Evening || [],
                Night: data.Night || []
            };

            console.log('Loaded images:', this.images);
            this.updatePlanImage();
            this.hideLoading();

        } catch (error) {
            console.error('Failed to load images:', error);
            this.showError('Failed to load images. Please try again later.');
            this.hideLoading();
        }
    }

    updatePlanImage() {
        const scheduleInfo = this.scheduleManager.getScheduleInfo();
        if (!scheduleInfo) {
            this.showNoImage();
            return;
        }

        const scheduleImages = this.images[scheduleInfo.name] || [];
        if (scheduleImages.length === 0) {
            this.showNoImage();
            return;
        }

        const image = scheduleImages[0];
        this.currentImage = image;
        
        // DIRECT LOADING - Bypassing SmartImage due to API errors
        this.planImage.src = image.fullPath;
        this.planImage.style.display = 'block';
        this.noImage.style.display = 'none';
        
        /*
        // Use smart image loading if available
        if (window.smartImage) {
            const container = this.planImage.closest('.plan-image-container');
            const containerWidth = container?.offsetWidth || 1920;
            const containerHeight = container?.offsetHeight || 1080;
            
            smartImage.loadImage(this.planImage, image.fullPath, {
                containerWidth,
                containerHeight,
                useThumbnail: false
            }).then(() => {
                this.planImage.style.display = 'block';
                this.noImage.style.display = 'none';
            }).catch(() => {
                // Fallback to direct loading
                this.planImage.src = image.fullPath;
                this.planImage.style.display = 'block';
                this.noImage.style.display = 'none';
            });
        } else {
            this.planImage.src = image.fullPath;
            this.planImage.style.display = 'block';
            this.noImage.style.display = 'none';
        }
        */
        
        // Track image view
        if (window.analytics) {
            analytics.trackFileOperation('view', image.fullPath, true);
        }
        
        console.log('Updated plan image:', image.fullPath);
    }

    showLoading() {
        this.loading.style.display = 'flex';
        this.planImage.style.display = 'none';
        this.noImage.style.display = 'none';
    }

    hideLoading() {
        this.loading.style.display = 'none';
    }

    showNoImage() {
        this.planImage.style.display = 'none';
        this.noImage.style.display = 'flex';
    }

    startTimeUpdater() {
        this.updateTime();
        setInterval(() => this.updateTime(), 1000);
    }

    updateTime() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', { 
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        this.currentTime.textContent = timeString;
    }

    startScheduleChecker() {
        this.checkSchedule();
        setInterval(() => this.checkSchedule(), 1000);
    }

    checkSchedule() {
        const scheduleInfo = this.scheduleManager.getScheduleInfo();
        
        if (scheduleInfo) {
            this.currentSchedule.textContent = scheduleInfo.name;
            this.scheduleName.textContent = scheduleInfo.name;
            this.scheduleName.className = `schedule-name ${scheduleInfo.name.toLowerCase()}`;
            this.scheduleTime.textContent = `${scheduleInfo.startTime} - ${scheduleInfo.endTime}`;
            
            const nextSchedule = this.getNextSchedule(scheduleInfo.name);
            if (nextSchedule) {
                this.nextScheduleName.textContent = nextSchedule.name;
                this.nextScheduleTime.textContent = `${nextSchedule.startTime} - ${nextSchedule.endTime}`;
            }
        } else {
            this.currentSchedule.textContent = 'No Active Schedule';
            this.scheduleName.textContent = '-';
            this.scheduleTime.textContent = '-';
            this.nextScheduleName.textContent = '-';
            this.nextScheduleTime.textContent = '-';
        }

        this.updatePlanImage();
    }

    getNextSchedule(currentScheduleName) {
        const schedules = [
            { name: 'Morning', startTime: '06:30', endTime: '14:29' },
            { name: 'Evening', startTime: '14:30', endTime: '22:29' },
            { name: 'Night', startTime: '22:30', endTime: '06:29' }
        ];

        const currentIndex = schedules.findIndex(s => s.name === currentScheduleName);
        if (currentIndex === -1) return null;

        const nextIndex = (currentIndex + 1) % schedules.length;
        return schedules[nextIndex];
    }

    toggleFullscreen() {
        if (!this.isFullscreen) {
            this.enterFullscreen();
        } else {
            this.exitFullscreen();
        }
    }

    enterFullscreen() {
        const container = document.querySelector('.plan-container');
        if (!container) return;

        container.classList.add('fullscreen');
        document.body.classList.add('fullscreen-active');
        this.fullscreenBtn.classList.add('active');
        this.isFullscreen = true;

        const icon = this.fullscreenBtn.querySelector('i');
        const text = this.fullscreenBtn.querySelector('span');
        if (icon) icon.className = 'fas fa-compress';
        if (text) text.textContent = 'Exit Fullscreen';

        if (container.requestFullscreen) {
            container.requestFullscreen();
        } else if (container.webkitRequestFullscreen) {
            container.webkitRequestFullscreen();
        } else if (container.msRequestFullscreen) {
            container.msRequestFullscreen();
        }
    }

    exitFullscreen() {
        const container = document.querySelector('.plan-container');
        if (!container) return;

        container.classList.remove('fullscreen');
        document.body.classList.remove('fullscreen-active');
        this.fullscreenBtn.classList.remove('active');
        this.isFullscreen = false;

        const icon = this.fullscreenBtn.querySelector('i');
        const text = this.fullscreenBtn.querySelector('span');
        if (icon) icon.className = 'fas fa-expand';
        if (text) text.textContent = 'Fullscreen';

        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    }

    handleFullscreenChange() {
        if (!document.fullscreenElement && 
            !document.webkitFullscreenElement && 
            !document.msFullscreenElement) {
            this.exitFullscreen();
        }
    }

    refreshContent() {
        this.addButtonFeedback(this.refreshBtn);
        this.loadImages();
        this.showSuccess('Content refreshed');
    }

    addButtonFeedback(button) {
        button.classList.add('clicked');
        setTimeout(() => button.classList.remove('clicked'), 200);
    }

    showError(message) {
        this.showMessage(message, 'error');
    }

    showSuccess(message) {
        this.showMessage(message, 'success');
    }

    showMessage(message, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `${type}-message`;
        messageDiv.textContent = message;
        document.body.appendChild(messageDiv);
        
        setTimeout(() => {
            messageDiv.classList.add('fade-out');
            setTimeout(() => messageDiv.remove(), 300);
        }, 3000);
    }
}

window.addEventListener('DOMContentLoaded', () => {
    new DailyPlanViewer();
});
