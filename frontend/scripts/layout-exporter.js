class LayoutExporter {
    constructor() {
        this.init();
    }
    
    init() {
        if (document.getElementById('exportLayoutBtn')) {
            document.getElementById('exportLayoutBtn').addEventListener('click', () => {
                this.exportLayout();
            });
        }
        
        if (document.getElementById('importLayoutBtn')) {
            document.getElementById('importLayoutBtn').addEventListener('change', (e) => {
                this.importLayout(e.target.files[0]);
            });
        }
    }
    
    async exportLayout() {
        try {
            const layoutId = this.getCurrentLayoutId();
            if (!layoutId) {
                throw new Error('No layout selected');
            }
            
            const response = await fetch(`/api/layouts/${layoutId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch layout');
            }
            
            const layout = await response.json();
            const exportData = {
                version: '2.0.0',
                exportDate: new Date().toISOString(),
                layout: layout
            };
            
            const blob = new Blob([JSON.stringify(exportData, null, 2)], {
                type: 'application/json'
            });
            
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `layout-${layout.name || layoutId}-${Date.now()}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            if (window.showToast) {
                window.showToast('Layout exported successfully', 'success');
            }
        } catch (error) {
            console.error('Export error:', error);
            if (window.showToast) {
                window.showToast('Failed to export layout', 'error');
            }
        }
    }
    
    async importLayout(file) {
        if (!file) return;
        
        try {
            const text = await file.text();
            const importData = JSON.parse(text);
            
            if (!importData.layout) {
                throw new Error('Invalid layout file format');
            }
            
            if (!confirm(`Import layout "${importData.layout.name}"?`)) {
                return;
            }
            
            const response = await fetch('/api/layouts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    ...importData.layout,
                    name: `${importData.layout.name} (Imported)`
                })
            });
            
            if (!response.ok) {
                throw new Error('Failed to import layout');
            }
            
            if (window.showToast) {
                window.showToast('Layout imported successfully', 'success');
            }
            
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        } catch (error) {
            console.error('Import error:', error);
            if (window.showToast) {
                window.showToast('Failed to import layout: ' + error.message, 'error');
            }
        }
    }
    
    getCurrentLayoutId() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('layoutId') || 
               document.querySelector('[data-layout-id]')?.dataset.layoutId;
    }
}

window.layoutExporter = new LayoutExporter();


