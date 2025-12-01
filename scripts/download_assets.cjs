const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');

const JOKERS = {
    'j_joker': 'Joker',
    'j_greedy': 'Greedy Joker',
    'j_wrathful': 'Wrathful Joker',
    'j_lusty': 'Lusty Joker',
    'j_glutten': 'Gluttonous Joker',
    'j_droll': 'Droll Joker',
    'j_banner': 'Banner',
    'j_cavendish': 'Cavendish',
    'j_half': 'Half Joker',
    'j_bull': 'Bull',
    'j_even_steven': 'Even Steven',
    'j_odd_todd': 'Odd Todd',
    'j_scholar': 'Scholar',
    'j_gros_michel': 'Gros Michel',
    'j_ice_cream': 'Ice Cream',
    'j_misprint': 'Misprint',
    'j_green_joker': 'Green Joker'
};

const OUTPUT_DIR = path.join(__dirname, '../public/assets/jokers');
const BG_DIR = path.join(__dirname, '../public/assets/backgrounds');

if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
if (!fs.existsSync(BG_DIR)) fs.mkdirSync(BG_DIR, { recursive: true });

const WIKI_URL = 'https://balatrogame.fandom.com/wiki/Jokers';

function downloadFile(url, dest) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        https.get(url, (response) => {
            if (response.statusCode !== 200) {
                reject(new Error(`Failed to download: ${response.statusCode}`));
                return;
            }
            response.pipe(file);
            file.on('finish', () => {
                file.close();
                resolve();
            });
        }).on('error', (err) => {
            fs.unlink(dest, () => {});
            reject(err);
        });
    });
}

async function main() {
    console.log('Fetching Wiki page...');
    // Use curl to get the page content because it handles redirects and headers better than raw https sometimes
    // or just use https.get. Let's use curl via execSync for simplicity in fetching text
    const html = execSync(`curl -s -L "${WIKI_URL}"`, { encoding: 'utf-8' });

    console.log('Parsing images...');
    
    // Simple regex to find images. 
    // Format often: <img ... alt="Joker Name" ... src="url" ... >
    // The wiki usually serves images from static.wikia.nocookie.net
    
    for (const [id, name] of Object.entries(JOKERS)) {
        console.log(`Looking for ${name}...`);
        
        // Regex to find the image source for a given alt text (Joker Name)
        // This is tricky with regex on HTML, but we'll try a loose match.
        // We look for alt="Name" or title="Name" and capture the src.
        // The src might be data-src for lazy loading.
        
        // Pattern: alt="Name" ... data-src="URL" OR src="URL"
        const regex = new RegExp(`alt=["']${name}["'][^>]*src=["']([^"']+)["']`, 'i');
        const dataRegex = new RegExp(`alt=["']${name}["'][^>]*data-src=["']([^"']+)["']`, 'i');
        
        let match = html.match(dataRegex) || html.match(regex);
        
        if (!match) {
            // Try looking for the file name directly in the URL if alt tag fails
            // e.g. .../Joker.png
            const fileRegex = new RegExp(`src=["']([^"']*${name.replace(/ /g, '[_ ]')}\\.png[^"']*)["']`, 'i');
            match = html.match(fileRegex);
        }

        if (match) {
            let url = match[1];
            // Clean up URL (remove query params like /revision/latest/scale-to-width-down/...)
            // Usually we want the full size. The pattern is often .../image.png/revision...
            // We can try to strip everything after .png
            if (url.includes('.png')) {
                url = url.substring(0, url.indexOf('.png') + 4);
            }
            
            console.log(`Found URL for ${name}: ${url}`);
            try {
                await downloadFile(url, path.join(OUTPUT_DIR, `${id}.png`));
                console.log(`Downloaded ${id}.png`);
            } catch (e) {
                console.error(`Error downloading ${name}:`, e.message);
            }
        } else {
            console.log(`Could not find image for ${name}`);
        }
    }
    
    // Try to find a background
    // I'll just hardcode a known "ok" background URL from the wiki search earlier if possible
    // or try to find "Soul" card or something cool.
    // Actually, let's use a specific URL for the background if we can't find one.
    // I will try to download a "Wallpaper" if I can find the word in the HTML.
    
    // Fallback background: Use the "Joker" card back or a generic texture.
    // For now, let's try to download the "Site-logo" as a test, but we really want a background.
    // I'll search for "background" in the HTML.
    
    const bgMatch = html.match(/src=["']([^"']*background[^"']*)["']/i);
    if (bgMatch) {
         console.log('Found potential background:', bgMatch[1]);
         // await downloadFile(bgMatch[1], path.join(BG_DIR, 'bg.png'));
    }
    
    // I will try to download the "CRT" overlay or similar if available, but the CSS handles that.
    // I'll just download a generic "Abstract" background from a placeholder service if I can't find one,
    // but the user wants "from this website".
    // I'll leave the background as CSS for now if I can't find a good image on the page.
}

main();
