class TouchGestures {
    constructor() {
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.touchEndX = 0;
        this.touchEndY = 0;
        this.minSwipeDistance = 50;
        this.init();
    }
    
    init() {
        document.addEventListener('touchstart', (e) => {
            this.touchStartX = e.changedTouches[0].screenX;
            this.touchStartY = e.changedTouches[0].screenY;
        }, { passive: true });
        
        document.addEventListener('touchend', (e) => {
            this.touchEndX = e.changedTouches[0].screenX;
            this.touchEndY = e.changedTouches[0].screenY;
            this.handleSwipe();
        }, { passive: true });
        
        document.addEventListener('touchmove', (e) => {
            e.preventDefault();
        }, { passive: false });
    }
    
    handleSwipe() {
        const deltaX = this.touchEndX - this.touchStartX;
        const deltaY = this.touchEndY - this.touchStartY;
        const absX = Math.abs(deltaX);
        const absY = Math.abs(deltaY);
        
        if (absX < this.minSwipeDistance && absY < this.minSwipeDistance) {
            return;
        }
        
        if (absX > absY) {
            if (deltaX > 0) {
                this.onSwipeRight();
            } else {
                this.onSwipeLeft();
            }
        } else {
            if (deltaY > 0) {
                this.onSwipeDown();
            } else {
                this.onSwipeUp();
            }
        }
    }
    
    onSwipeLeft() {
        const nextBtn = document.querySelector('[id*="next"], .next-button');
        if (nextBtn && this.isImageGallery()) {
            nextBtn.click();
        }
    }
    
    onSwipeRight() {
        const prevBtn = document.querySelector('[id*="prev"], .prev-button');
        if (prevBtn && this.isImageGallery()) {
            prevBtn.click();
        }
    }
    
    onSwipeUp() {
        window.scrollBy({ top: -100, behavior: 'smooth' });
    }
    
    onSwipeDown() {
        window.scrollBy({ top: 100, behavior: 'smooth' });
    }
    
    isImageGallery() {
        return window.location.pathname.includes('/gallery') || 
               document.querySelector('.image-viewer, .gallery-container');
    }
    
    enablePinchZoom(element) {
        let initialDistance = 0;
        let currentScale = 1;
        
        element.addEventListener('touchstart', (e) => {
            if (e.touches.length === 2) {
                const touch1 = e.touches[0];
                const touch2 = e.touches[1];
                initialDistance = Math.hypot(
                    touch2.clientX - touch1.clientX,
                    touch2.clientY - touch1.clientY
                );
            }
        }, { passive: true });
        
        element.addEventListener('touchmove', (e) => {
            if (e.touches.length === 2) {
                const touch1 = e.touches[0];
                const touch2 = e.touches[1];
                const currentDistance = Math.hypot(
                    touch2.clientX - touch1.clientX,
                    touch2.clientY - touch1.clientY
                );
                
                const scale = currentDistance / initialDistance;
                currentScale = Math.max(0.5, Math.min(3, scale));
                element.style.transform = `scale(${currentScale})`;
            }
        }, { passive: true });
    }
}

window.touchGestures = new TouchGestures();


