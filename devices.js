// devices.js - Real telefon o'lchamlari va xususiyatlari

const devices = {
    // iPhone seriyasi
    'iphone14': {
        name: 'iPhone 14 Pro',
        width: 393,
        height: 852,
        devicePixelRatio: 3,
        screen: {
            width: 393,
            height: 852,
            usableHeight: 844,
            notchHeight: 47
        },
        cameraType: 'dynamic-island',
        frameClass: 'iphone-frame',
        cameraPosition: {
            top: '15px',
            left: '50%',
            transform: 'translateX(-50%)'
        }
    },

    'iphone13': {
        name: 'iPhone 13',
        width: 390,
        height: 844,
        devicePixelRatio: 3,
        screen: {
            width: 390,
            height: 844,
            usableHeight: 812,
            notchHeight: 30
        },
        cameraType: 'notch',
        frameClass: 'iphone-frame',
        cameraPosition: {
            top: '15px',
            left: '50%',
            transform: 'translateX(-50%)'
        }
    },

    // Samsung Galaxy seriyasi
    'samsungS23': {
        name: 'Samsung Galaxy S23',
        width: 360,
        height: 780,
        devicePixelRatio: 2.5,
        screen: {
            width: 360,
            height: 780,
            usableHeight: 760,
            punchHoleSize: 30
        },
        cameraType: 'hole-punch',
        frameClass: 'samsung-frame',
        cameraPosition: {
            top: '18px',
            left: 'calc(50% + 70px)',
            transform: 'translateX(-50%)'
        }
    },

    'samsungS23Ultra': {
        name: 'Samsung Galaxy S23 Ultra',
        width: 412,
        height: 874,
        devicePixelRatio: 2.5,
        screen: {
            width: 412,
            height: 874,
            usableHeight: 854,
            punchHoleSize: 32
        },
        cameraType: 'hole-punch',
        frameClass: 'samsung-frame',
        cameraPosition: {
            top: '20px',
            left: 'calc(50% + 85px)',
            transform: 'translateX(-50%)'
        }
    },

    // Google Pixel seriyasi
    'pixel7': {
        name: 'Google Pixel 7',
        width: 412,
        height: 915,
        devicePixelRatio: 2.5,
        screen: {
            width: 412,
            height: 915,
            usableHeight: 895,
            notchHeight: 20
        },
        cameraType: 'hole-punch',
        frameClass: 'pixel-frame',
        cameraPosition: {
            top: '24px',
            left: 'calc(50% - 85px)',
            transform: 'translateX(-50%)'
        }
    },

    // OnePlus
    'oneplus11': {
        name: 'OnePlus 11',
        width: 480,
        height: 1032,
        devicePixelRatio: 2.5,
        screen: {
            width: 480,
            height: 1032,
            usableHeight: 1012,
            punchHoleSize: 28
        },
        cameraType: 'hole-punch',
        frameClass: 'oneplus-frame',
        cameraPosition: {
            top: '28px',
            left: 'calc(50% - 100px)',
            transform: 'translateX(-50%)'
        }
    }
};

function getDeviceConfig(deviceId) {
    const device = devices[deviceId] || devices['iphone14'];
    return {
        ...device,
        // Telefon tanlanganda avtomatik kamera turini o'rnatish
        cameraType: device.cameraType
    };
}

function getDeviceList() {
    return Object.keys(devices).map(id => ({
        id,
        name: devices[id].name
    }));
}

// Camera overlay o'lchamlari
const cameraOverlayStyles = {
    'dynamic-island': {
        width: '120px',
        height: '35px',
        borderRadius: '40px',
        backgroundColor: '#000000'
    },
    'notch': {
        width: '160px',
        height: '30px',
        borderRadius: '0 0 20px 20px',
        backgroundColor: '#000000'
    },
    'hole-punch': {
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        backgroundColor: '#000000'
    },
    'none': {
        display: 'none'
    }
};