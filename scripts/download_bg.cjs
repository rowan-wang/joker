const fs = require('fs');
const path = require('path');
const https = require('https');

const BG_URL = 'https://images.unsplash.com/photo-1605806616949-1e87b487bc2a?q=80&w=3456&auto=format&fit=crop';
const DEST = path.join(__dirname, '../public/assets/backgrounds/bg.jpg');

function downloadFile(url, dest) {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
        response.pipe(file);
        file.on('finish', () => {
            file.close();
            console.log('Background downloaded.');
        });
    }).on('error', (err) => {
        fs.unlink(dest, () => {});
        console.error('Error:', err.message);
    });
}

downloadFile(BG_URL, DEST);
