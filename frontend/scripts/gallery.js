class ImageGallery {
    constructor() {
        this.isPlaying = false;
        this.currentIndex = 0;
        this.images = [];
        this.intervalId = null;
        this.currentFolder = '';
        this.slideInterval = 10000;
        this.ws = null;
        this.currentMode = 'home';
        this.currentZoomLevel = 1;
        this.isDragging = false;
        this.dragStart = { x: 0, y: 0 };
        this.currentPosition = { x: 0, y: 0 };
        this.isFullscreen = false;
        this.userConfig = null;

        this.initializeElements();
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
            this.startScheduleChecker();
        } catch (error) {
            console.error('Error loading user config:', error);
            window.location.href = '/dashboard';
        }
    }

    initializeElements() {
        this.currentImage = document.getElementById('current-image');
        this.meetingImage = document.getElementById('meeting-current-image');
        this.planImage = document.getElementById('plan-image');
        this.numbersImage = document.getElementById('numbers-image');
        this.playPauseBtn = document.getElementById('play-pause');
        this.restartBtn = document.getElementById('restart');
        this.prevBtn = document.getElementById('prev-image');
        this.nextBtn = document.getElementById('next-image');
        this.folderSelect = document.getElementById('folder-select');
        this.imageSelect = document.getElementById('image-select');
        this.homeMode = document.getElementById('home-mode');
        this.meetingMode = document.getElementById('meeting-mode');
        this.zoomInBtn = document.getElementById('zoom-in');
        this.zoomOutBtn = document.getElementById('zoom-out');
        this.fullscreenBtn = document.getElementById('fullscreen');
        this.fullscreenExitBtn = document.querySelector('.fullscreen-exit');
        this.homeContent = document.getElementById('home-content');
        this.meetingContent = document.getElementById('meeting-content');
        this.backBtn = document.getElementById('back-to-dashboard');
        
        this.scheduleManager = new ScheduleManager();
        this.planImages = [];
        this.numbersImages = [];
        this.currentNumbersIndex = 0;
        this.numbersInterval = null;
    }

    initializeEventListeners() {
        this.playPauseBtn?.addEventListener('click', () => this.togglePlayPause());
        this.restartBtn?.addEventListener('click', () => this.restartSlideshow());
        this.prevBtn?.addEventListener('click', () => this.showPreviousImage());
        this.nextBtn?.addEventListener('click', () => this.showNextImage());
        this.folderSelect?.addEventListener('change', () => this.handleFolderChange());
        this.imageSelect?.addEventListener('change', () => this.handleImageChange());
        this.homeMode?.addEventListener('click', () => this.switchMode('home'));
        this.meetingMode?.addEventListener('click', () => this.switchMode('meeting'));
        this.zoomInBtn?.addEventListener('click', () => this.zoom(0.2));
        this.zoomOutBtn?.addEventListener('click', () => this.zoom(-0.2));
        this.fullscreenBtn?.addEventListener('click', () => this.toggleFullscreen());
        this.fullscreenExitBtn?.addEventListener('click', () => this.exitFullscreen());
        this.backBtn?.addEventListener('click', () => window.location.href = '/dashboard');

        document.getElementById('meeting-play-pause')?.addEventListener('click', () => this.togglePlayPause());
        document.getElementById('meeting-prev-image')?.addEventListener('click', () => this.showPreviousImage());
        document.getElementById('meeting-next-image')?.addEventListener('click', () => this.showNextImage());
        document.getElementById('meeting-zoom-in')?.addEventListener('click', () => this.zoom(0.2));
        document.getElementById('meeting-zoom-out')?.addEventListener('click', () => this.zoom(-0.2));

        this.currentImage?.addEventListener('mousedown', (e) => this.startDrag(e));
        this.meetingImage?.addEventListener('mousedown', (e) => this.startDrag(e));
        document.addEventListener('mousemove', (e) => this.drag(e));
        document.addEventListener('mouseup', () => this.endDrag());

        this.currentImage?.addEventListener('wheel', (e) => {
            e.preventDefault();
            this.zoom(e.deltaY > 0 ? -0.2 : 0.2);
        });

        this.meetingImage?.addEventListener('wheel', (e) => {
            e.preventDefault();
            this.zoom(e.deltaY > 0 ? -0.2 : 0.2);
        });

        window.addEventListener('sundayRotation', () => this.checkSchedule());
    }

    initializeWebSocket() {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const port = window.location.port || '3000';
        const wsUrl = `${protocol}//${window.location.hostname}:${port}/ws/gallery`;
        
        this.ws = new WebSocket(wsUrl);
        
        this.ws.onopen = () => {
            console.log('Gallery WebSocket Connected');
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
                
                if (message.type === 'IMAGES_UPDATED' || message.type === 'FOLDER_UPDATED') {
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
            console.log('WebSocket connection closed. Reconnecting...');
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
            const response = await fetch('/api/gallery/images');
            if (!response.ok) throw new Error('Failed to load images');
            
            const data = await response.json();
            
            this.images = [];
            Object.entries(data).forEach(([folder, files]) => {
                if (folder === 'root') {
                    files.forEach(file => {
                        this.images.push({ ...file, folder: 'root' });
                    });
                } else {
                    files.forEach(file => {
                        this.images.push({ ...file, folder });
                    });
                }
            });

            this.updateFolderSelect(data);
            
            if (this.images.length > 0) {
                this.currentIndex = 0;
                this.showImage(0);
            }
        } catch (error) {
            console.error('Failed to load images:', error);
            this.showError('Failed to load images');
        }
    }

    updateFolderSelect(data) {
        if (!this.folderSelect) return;
        
        this.folderSelect.innerHTML = '<option value="">Select Folder</option>';
        Object.keys(data).forEach(folder => {
            const option = document.createElement('option');
            option.value = folder === 'root' ? '' : folder;
            option.textContent = folder === 'root' ? `Root (${data[folder].length})` : `${folder} (${data[folder].length})`;
            this.folderSelect.appendChild(option);
        });
    }

    handleFolderChange() {
        const folder = this.folderSelect.value || 'root';
        this.currentFolder = folder;
        
        if (!this.imageSelect) return;
        
        this.imageSelect.innerHTML = '<option value="">Select Image</option>';
        const folderImages = this.images.filter(img => 
            folder === 'root' ? img.folder === 'root' : img.folder === folder
        );
        
        folderImages.forEach((img, index) => {
            const globalIndex = this.images.findIndex(i => i.fullPath === img.fullPath);
            const option = document.createElement('option');
            option.value = globalIndex;
            option.textContent = img.name;
            this.imageSelect.appendChild(option);
        });

        if (folderImages.length > 0) {
            const globalIndex = this.images.findIndex(img => img.fullPath === folderImages[0].fullPath);
            this.showImage(globalIndex);
        }
    }

    handleImageChange() {
        const selectedIndex = this.imageSelect.value;
        if (selectedIndex !== '') {
            this.showImage(parseInt(selectedIndex));
        }
    }

    showPreviousImage() {
        if (this.images.length === 0) return;
        this.currentIndex = (this.currentIndex - 1 + this.images.length) % this.images.length;
        this.showImage(this.currentIndex);
        this.pauseSlideshow();
    }

    showNextImage() {
        if (this.images.length === 0) return;
        this.currentIndex = (this.currentIndex + 1) % this.images.length;
        this.showImage(this.currentIndex);
        this.pauseSlideshow();
    }

    showImage(index) {
        if (!this.images[index]) return;
        
        const media = this.images[index];
        const activeImage = this.currentMode === 'home' ? this.currentImage : this.meetingImage;
        const activeVideo = this.currentMode === 'home' ? 
            document.getElementById('current-video') : 
            document.getElementById('meeting-current-video');

        if (media.type === 'video') {
            if (activeImage) activeImage.style.display = 'none';
            if (activeVideo) {
                activeVideo.style.display = 'block';
                activeVideo.src = media.fullPath;
                activeVideo.play();
            }
        } else {
            if (activeVideo) activeVideo.style.display = 'none';
            if (activeImage) {
                activeImage.style.display = 'block';
                // DIRECT LOADING - Bypassing SmartImage
                activeImage.src = media.fullPath;
                
                /*
                // Use smart image loading
                if (window.smartImage) {
                    const container = activeImage.closest('.media-container, .image-container');
                    if (container) {
                        smartImage.loadImage(activeImage, media.fullPath, {
                            containerWidth: container.offsetWidth || 800,
                            containerHeight: container.offsetHeight || 600,
                            useThumbnail: true
                        });
                    } else {
                        activeImage.src = media.fullPath;
                    }
                } else {
                    activeImage.src = media.fullPath;
                }
                */
            }
        }

        this.resetZoom();
        
        // Set current image for AI features
        if (window.setCurrentImageForAI && media.fullPath) {
            window.setCurrentImageForAI(media.fullPath);
        }
        
        // Track image view
        if (window.analytics) {
            analytics.trackFileOperation('view', media.fullPath, true);
        }
    }

    togglePlayPause() {
        if (this.isPlaying) {
            this.pauseSlideshow();
        } else {
            this.startSlideshow();
        }
    }

    startSlideshow() {
        if (this.images.length === 0) return;
        this.isPlaying = true;
        if (this.playPauseBtn) {
            const icon = this.playPauseBtn.querySelector('i');
            if (icon) icon.className = 'fas fa-pause';
        }
        this.intervalId = setInterval(() => {
            if (this.isPlaying) {
                this.showNextImage();
            }
        }, this.slideInterval);
    }

    pauseSlideshow() {
        this.isPlaying = false;
        if (this.playPauseBtn) {
            const icon = this.playPauseBtn.querySelector('i');
            if (icon) icon.className = 'fas fa-play';
        }
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }

    restartSlideshow() {
        this.currentIndex = 0;
        this.showImage(0);
        this.startSlideshow();
    }

    switchMode(mode) {
        if (this.currentMode === mode) return;
        
        this.currentMode = mode;
        
        if (mode === 'home') {
            this.homeContent.classList.add('active');
            this.meetingContent.classList.remove('active');
            this.homeMode.classList.add('active');
            this.meetingMode.classList.remove('active');
        } else {
            this.homeContent.classList.remove('active');
            this.meetingContent.classList.add('active');
            this.homeMode.classList.remove('active');
            this.meetingMode.classList.add('active');
        }
    }

    zoom(delta) {
        this.currentZoomLevel = Math.max(0.5, Math.min(5, this.currentZoomLevel + delta));
        const activeImage = this.currentMode === 'home' ? this.currentImage : this.meetingImage;
        if (activeImage) {
            activeImage.style.transform = `scale(${this.currentZoomLevel})`;
        }
    }

    resetZoom() {
        this.currentZoomLevel = 1;
        const activeImage = this.currentMode === 'home' ? this.currentImage : this.meetingImage;
        if (activeImage) {
            activeImage.style.transform = 'scale(1)';
            this.currentPosition = { x: 0, y: 0 };
            activeImage.style.left = '0px';
            activeImage.style.top = '0px';
        }
    }

    startDrag(e) {
        if (this.currentZoomLevel <= 1) return;
        this.isDragging = true;
        this.dragStart = { x: e.clientX - this.currentPosition.x, y: e.clientY - this.currentPosition.y };
    }

    drag(e) {
        if (!this.isDragging || this.currentZoomLevel <= 1) return;
        this.currentPosition = {
            x: e.clientX - this.dragStart.x,
            y: e.clientY - this.dragStart.y
        };
        const activeImage = this.currentMode === 'home' ? this.currentImage : this.meetingImage;
        if (activeImage) {
            activeImage.style.left = `${this.currentPosition.x}px`;
            activeImage.style.top = `${this.currentPosition.y}px`;
        }
    }

    endDrag() {
        this.isDragging = false;
    }

    toggleFullscreen() {
        if (!this.isFullscreen) {
            this.enterFullscreen();
        } else {
            this.exitFullscreen();
        }
    }

    enterFullscreen() {
        const container = document.querySelector('.content-container');
        if (container) {
            container.classList.add('fullscreen');
            this.isFullscreen = true;
            if (this.fullscreenExitBtn) this.fullscreenExitBtn.style.display = 'flex';
        }
    }

    exitFullscreen() {
        const container = document.querySelector('.content-container');
        if (container) {
            container.classList.remove('fullscreen');
            this.isFullscreen = false;
            if (this.fullscreenExitBtn) this.fullscreenExitBtn.style.display = 'none';
        }
    }

    startScheduleChecker() {
        setInterval(() => {
            this.checkSchedule();
        }, 60000);
    }

    checkSchedule() {
        const scheduleInfo = this.scheduleManager.getScheduleInfo();
        if (scheduleInfo && this.planImages.length > 0) {
            const matchingPlan = this.planImages.find(img => 
                img.name.toLowerCase().startsWith(scheduleInfo.imagePrefix.toLowerCase())
            );
            if (matchingPlan && this.planImage) {
                this.planImage.src = matchingPlan.fullPath;
            }
        }
    }

    showError(message) {
        console.error(message);
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        document.body.appendChild(errorDiv);
        setTimeout(() => errorDiv.remove(), 3000);
    }
}

window.addEventListener('DOMContentLoaded', () => {
    window.gallery = new ImageGallery();
});

window.getCurrentImagePaths = function() {
    if (window.gallery && window.gallery.images) {
        return window.gallery.images.map(img => img.fullPath || img.path).filter(Boolean);
    }
    return [];
};

window.setCurrentImageForAI = function(imagePath) {
    if (window.aiUI) {
        window.aiUI.setCurrentImage(imagePath);
    }
};
