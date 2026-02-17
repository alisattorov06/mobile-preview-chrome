/**
 * Chrome Extension Popup Controller
 */

class PopupController {
    constructor() {
        this.state = {
            currentDevice: 'iphone14',
            currentCamera: 'dynamic-island',
            currentZoom: 1,
            isLandscape: false,
            currentUrl: '',
            isCustomDevice: false
        };

        this.elements = {
            urlInput: document.getElementById('url-input'),
            useCurrentTabBtn: document.getElementById('use-current-tab'),
            deviceSelect: document.getElementById('device-select'),
            cameraSelect: document.getElementById('camera-select'),
            zoomSelect: document.getElementById('zoom-select'),
            customDeviceSettings: document.getElementById('custom-device-settings'),
            customWidth: document.getElementById('custom-width'),
            customHeight: document.getElementById('custom-height'),
            openPreviewBtn: document.getElementById('open-preview'),
            toggleOrientationBtn: document.getElementById('toggle-orientation')
        };

        this.init();
    }

    async init() {
        this.setupEventListeners();
        await this.loadState();
        await this.loadCurrentTabUrl();

        // Avtomatik kamera tanlash
        this.updateCameraForDevice();
    }

    setupEventListeners() {
        // Use current tab URL
        this.elements.useCurrentTabBtn.addEventListener('click', () => {
            this.loadCurrentTabUrl();
        });

        // Device selection - avtomatik kamera o'zgartirish
        this.elements.deviceSelect.addEventListener('change', (e) => {
            this.state.currentDevice = e.target.value;
            this.state.isCustomDevice = this.state.currentDevice === 'custom';
            this.elements.customDeviceSettings.style.display =
                this.state.isCustomDevice ? 'block' : 'none';

            // Avtomatik kamera turini o'zgartirish
            this.updateCameraForDevice();
            this.saveState();
        });

        // Camera selection
        this.elements.cameraSelect.addEventListener('change', (e) => {
            this.state.currentCamera = e.target.value;
            this.saveState();
        });

        // Zoom selection
        this.elements.zoomSelect.addEventListener('change', (e) => {
            this.state.currentZoom = parseFloat(e.target.value);
            this.saveState();
        });

        // Custom device dimensions
        this.elements.customWidth.addEventListener('change', () => {
            this.saveCustomDimensions();
        });

        this.elements.customHeight.addEventListener('change', () => {
            this.saveCustomDimensions();
        });

        // Open preview
        this.elements.openPreviewBtn.addEventListener('click', () => {
            this.openPreview();
        });

        // Toggle orientation
        this.elements.toggleOrientationBtn.addEventListener('click', () => {
            this.state.isLandscape = !this.state.isLandscape;
            this.saveState();
        });
    }

    updateCameraForDevice() {
        // Telefon modeliga mos kamera turini avtomatik tanlash
        if (this.state.currentDevice !== 'custom') {
            const deviceConfig = getDeviceConfig(this.state.currentDevice);
            this.state.currentCamera = deviceConfig.cameraType;
            this.elements.cameraSelect.value = deviceConfig.cameraType;
        }
    }

    async loadCurrentTabUrl() {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (tab && tab.url) {
                this.state.currentUrl = tab.url;
                this.elements.urlInput.value = tab.url;
                this.saveState();
            }
        } catch (error) {
            console.warn('Could not get current tab URL:', error);
        }
    }

    async loadState() {
        try {
            const data = await chrome.storage.local.get('previewState');
            if (data.previewState) {
                this.state = { ...this.state, ...data.previewState };

                // Update UI
                this.elements.deviceSelect.value = this.state.currentDevice;
                this.elements.cameraSelect.value = this.state.currentCamera;
                this.elements.zoomSelect.value = this.state.currentZoom.toString();
                this.elements.urlInput.value = this.state.currentUrl;

                // Handle custom device
                this.state.isCustomDevice = this.state.currentDevice === 'custom';
                this.elements.customDeviceSettings.style.display =
                    this.state.isCustomDevice ? 'block' : 'none';

                if (this.state.isCustomDevice) {
                    const customData = await chrome.storage.local.get('customDevice');
                    if (customData.customDevice) {
                        this.elements.customWidth.value = customData.customDevice.width;
                        this.elements.customHeight.value = customData.customDevice.height;
                    }
                }
            }
        } catch (error) {
            console.warn('Failed to load state:', error);
        }
    }

    async saveState() {
        try {
            await chrome.storage.local.set({ previewState: this.state });
        } catch (error) {
            console.warn('Failed to save state:', error);
        }
    }

    async saveCustomDimensions() {
        const customDevice = {
            width: parseInt(this.elements.customWidth.value) || 360,
            height: parseInt(this.elements.customHeight.value) || 780
        };

        try {
            await chrome.storage.local.set({ customDevice });
        } catch (error) {
            console.warn('Failed to save custom dimensions:', error);
        }
    }

    openPreview() {
        // Get the URL from input
        let url = this.elements.urlInput.value.trim();
        if (!url) {
            alert('Please enter a URL or use current tab');
            return;
        }

        // Format URL if needed
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            if (url.includes('localhost') || url.includes('127.0.0.1')) {
                url = 'http://' + url;
            } else {
                url = 'https://' + url;
            }
        }

        // Get device dimensions
        let deviceConfig;
        if (this.state.currentDevice === 'custom') {
            const width = parseInt(this.elements.customWidth.value) || 360;
            const height = parseInt(this.elements.customHeight.value) || 780;
            deviceConfig = {
                name: "Custom Device",
                width: Math.max(200, Math.min(2000, width)),
                height: Math.max(400, Math.min(3000, height)),
                cameraType: this.state.currentCamera,
                frameClass: "iphone-frame"
            };
        } else {
            deviceConfig = getDeviceConfig(this.state.currentDevice);
            // Kamerani device config dan olish
            deviceConfig.cameraType = this.state.currentCamera;
        }

        // Calculate window size - REAL o'lchamlar
        const baseWidth = this.state.isLandscape ? deviceConfig.height : deviceConfig.width;
        const baseHeight = this.state.isLandscape ? deviceConfig.width : deviceConfig.height;

        // Zoom faktorini qo'llash (1 = haqiqiy o'lcham)
        const scaledWidth = Math.round(baseWidth * this.state.currentZoom);
        const scaledHeight = Math.round(baseHeight * this.state.currentZoom);

        // Frame va padding qo'shish (overflow yo'q qilish uchun)
        const framePadding = 20; // Kamroq padding
        const controlBarHeight = 70; // Yuqori panel
        const bottomPadding = 10; // Quyi padding

        const windowWidth = scaledWidth + (framePadding * 2);
        const windowHeight = scaledHeight + controlBarHeight + (framePadding * 2) + bottomPadding;

        // Ekran o'lchamiga moslashtirish (overflow yo'q qilish)
        const maxWidth = Math.min(windowWidth, screen.width - 40);
        const maxHeight = Math.min(windowHeight, screen.height - 100);

        // Query parametrlari
        const params = new URLSearchParams({
            url: encodeURIComponent(url),
            device: this.state.currentDevice,
            camera: this.state.currentCamera,
            zoom: this.state.currentZoom,
            orientation: this.state.isLandscape ? 'landscape' : 'portrait'
        });

        // Custom device uchun qo'shimcha parametrlar
        if (this.state.currentDevice === 'custom') {
            params.append('width', deviceConfig.width);
            params.append('height', deviceConfig.height);
        }

        // Open preview window
        chrome.windows.create({
            url: chrome.runtime.getURL(`preview.html?${params.toString()}`),
            type: 'popup',
            width: maxWidth,
            height: maxHeight,
            left: Math.round((screen.width - maxWidth) / 2),
            top: Math.round((screen.height - maxHeight) / 2)
        });
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PopupController();
});