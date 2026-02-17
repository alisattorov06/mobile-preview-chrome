/**
 * Chrome Extension Preview Page Controller
 */

class PreviewController {
    constructor() {
        this.state = {
            url: '',
            deviceId: 'iphone14',
            cameraType: 'dynamic-island',
            zoom: 1,
            isLandscape: false,
            deviceConfig: null
        };

        this.elements = {
            deviceFrame: document.getElementById('device-frame'),
            cameraOverlay: document.getElementById('camera-overlay'),
            previewIframe: document.getElementById('preview-iframe'),
            loadingOverlay: document.querySelector('.loading-overlay'),
            deviceName: document.getElementById('device-name'),
            deviceDimensions: document.getElementById('device-dimensions'),
            deviceOrientation: document.getElementById('device-orientation'),
            deviceZoom: document.getElementById('device-zoom'),
            reloadBtn: document.getElementById('reload-btn'),
            rotateBtn: document.getElementById('rotate-btn'),
            closeBtn: document.getElementById('close-btn')
        };

        this.init();
    }

    async init() {
        this.parseUrlParams();
        this.setupEventListeners();
        this.updateDevice();
        await this.loadPreview();
        this.setupKeyboardShortcuts();
        
        // Window resize uchun
        window.addEventListener('resize', this.handleResize.bind(this));
    }

    parseUrlParams() {
        const urlParams = new URLSearchParams(window.location.search);
        
        this.state.url = decodeURIComponent(urlParams.get('url') || '');
        this.state.deviceId = urlParams.get('device') || 'iphone14';
        this.state.cameraType = urlParams.get('camera') || 'dynamic-island';
        this.state.zoom = parseFloat(urlParams.get('zoom') || '1');
        this.state.isLandscape = urlParams.get('orientation') === 'landscape';
        
        // Custom device o'lchamlari
        if (this.state.deviceId === 'custom') {
            const width = parseInt(urlParams.get('width') || '360');
            const height = parseInt(urlParams.get('height') || '780');
            this.state.deviceConfig = {
                name: "Custom Device",
                width: width,
                height: height,
                cameraType: this.state.cameraType,
                frameClass: "iphone-frame",
                cameraPosition: {
                    top: '15px',
                    left: '50%',
                    transform: 'translateX(-50%)'
                }
            };
        } else {
            this.state.deviceConfig = getDeviceConfig(this.state.deviceId);
            // Agar URL da kamera berilgan bo'lsa, uni ishlatamiz
            if (this.state.cameraType) {
                this.state.deviceConfig.cameraType = this.state.cameraType;
            }
        }
    }

    setupEventListeners() {
        // Reload iframe
        this.elements.reloadBtn.addEventListener('click', () => {
            this.reloadPreview();
        });

        // Rotate device
        this.elements.rotateBtn.addEventListener('click', () => {
            this.toggleOrientation();
        });

        // Close window
        this.elements.closeBtn.addEventListener('click', () => {
            window.close();
        });

        // Iframe yuklanishi
        this.elements.previewIframe.addEventListener('load', () => {
            this.hideLoading();
        });
        
        // Iframe xatoliklari
        this.elements.previewIframe.addEventListener('error', () => {
            this.hideLoading();
            console.error('Failed to load iframe content');
        });
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // R - rotate
            if (e.key === 'r' || e.key === 'R') {
                if (e.ctrlKey || e.metaKey) {
                    this.reloadPreview();
                } else {
                    this.toggleOrientation();
                }
                e.preventDefault();
            }
            
            // ESC - close
            if (e.key === 'Escape') {
                window.close();
            }
        });
    }

    handleResize() {
        // Oynani o'lchami o'zgarganda device ni qayta sozlash
        setTimeout(() => {
            this.updateDevice();
        }, 100);
    }

    updateDevice() {
        const config = this.state.deviceConfig;
        const isLandscape = this.state.isLandscape;
        
        // Device frame o'lchami
        let width = isLandscape ? config.height : config.width;
        let height = isLandscape ? config.width : config.height;
        
        // Zoom qo'llash
        width = Math.round(width * this.state.zoom);
        height = Math.round(height * this.state.zoom);
        
        // Oynaning o'lchamiga moslashtirish
        const maxWidth = Math.min(width, window.innerWidth - 40);
        const maxHeight = Math.min(height, window.innerHeight - 150);
        
        // Frame style
        this.elements.deviceFrame.style.width = `${maxWidth}px`;
        this.elements.deviceFrame.style.height = `${maxHeight}px`;
        
        // Frame klassini o'rnatish
        this.elements.deviceFrame.className = `device-frame ${config.frameClass}`;
        
        // Camera overlay - avtomatik device config dan olish
        const cameraType = config.cameraType || this.state.cameraType;
        this.elements.cameraOverlay.className = `camera-overlay ${cameraType}-overlay`;
        
        // Camera overlay ko'rsatish/yashirish
        if (cameraType === 'none') {
            this.elements.cameraOverlay.style.display = 'none';
        } else {
            this.elements.cameraOverlay.style.display = 'block';
            
            // Camera o'lchamini sozlash
            const cameraStyle = cameraOverlayStyles[cameraType];
            if (cameraStyle) {
                Object.keys(cameraStyle).forEach(key => {
                    if (key !== 'backgroundColor') {
                        this.elements.cameraOverlay.style[key] = cameraStyle[key];
                    }
                });
            }
            
            // Camera pozitsiyasini device config dan olish
            if (config.cameraPosition) {
                Object.keys(config.cameraPosition).forEach(key => {
                    this.elements.cameraOverlay.style[key] = config.cameraPosition[key];
                });
            }
        }
        
        // Info panel yangilash
        this.elements.deviceName.textContent = config.name;
        this.elements.deviceDimensions.textContent = 
            `${config.width} × ${config.height}`;
        this.elements.deviceOrientation.textContent = 
            isLandscape ? 'Landscape' : 'Portrait';
        this.elements.deviceZoom.textContent = 
            `${Math.round(this.state.zoom * 100)}%`;
        
        // Body orientation klass
        document.body.classList.toggle('landscape', isLandscape);
    }

    async loadPreview() {
        if (!this.state.url) return;
        
        this.showLoading();
        
        try {
            // Iframe yuklash
            this.elements.previewIframe.src = this.state.url;
            
            // 5 soniya ichida yuklanmasa, loading ni yashirish
            setTimeout(() => {
                this.hideLoading();
            }, 5000);
        } catch (error) {
            console.error('Failed to load preview:', error);
            this.elements.previewIframe.src = 'about:blank';
            this.hideLoading();
        }
    }

    reloadPreview() {
        this.showLoading();
        if (this.elements.previewIframe.src) {
            this.elements.previewIframe.contentWindow.location.reload();
        }
    }

    toggleOrientation() {
        this.state.isLandscape = !this.state.isLandscape;
        this.updateDevice();
    }

    showLoading() {
        this.elements.loadingOverlay.classList.add('active');
    }

    hideLoading() {
        this.elements.loadingOverlay.classList.remove('active');
    }
}



// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.previewController = new PreviewController();
});