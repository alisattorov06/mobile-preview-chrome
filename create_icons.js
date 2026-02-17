const { createCanvas } = require('canvas');

function createIcon(size, color = '#007AFF') {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#1E1E1E';
    ctx.fillRect(0, 0, size, size);

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(size / 2 - size / 6, size / 2 - size / 4, size / 3, size / 2.5);

    return canvas.toBuffer();
}

const fs = require('fs');

if (!fs.existsSync('icons')) {
    fs.mkdirSync('icons');
}

const sizes = [16, 48, 128];
sizes.forEach(size => {
    const buffer = createIcon(size);
    fs.writeFileSync(`icons/icon${size}.png`, buffer);
    console.log(`Created icon${size}.png`);
});

console.log('All icons created successfully!');