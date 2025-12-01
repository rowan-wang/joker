const fs = require('fs');
const path = require('path');
const axios = require('axios');
const cheerio = require('cheerio');

const BASE_URL = 'https://balatrogame.fandom.com';
const ASSETS_DIR = path.join(__dirname, '../public/assets');
const DATA_DIR = path.join(__dirname, '../src/data');

if (!fs.existsSync(ASSETS_DIR)) fs.mkdirSync(ASSETS_DIR, { recursive: true });
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const CATEGORIES = [
    {
        name: 'jokers',
        url: '/wiki/Jokers',
        selector: 'table tr',
        process: ($row, $) => {
            const cells = $row.find('td');
            if (cells.length < 5) return null; // Needs at least 5 cols based on inspection
            
            // Col 1: Image and Name
            const nameCell = $(cells[1]);
            const imgElement = nameCell.find('img');
            let imgUrl = imgElement.attr('data-src') || imgElement.attr('src');
            if (imgUrl && imgUrl.includes('/revision/')) imgUrl = imgUrl.split('/revision/')[0];
            
            const name = nameCell.text().trim();
            if (!name) return null;
            
            // Col 2: Description
            const description = $(cells[2]).text().trim();
            
            // Col 3: Cost
            const costText = $(cells[3]).text().trim();
            const cost = parseInt(costText.replace('$', '')) || 4;
            
            // Col 4: Rarity
            const rarity = $(cells[4]).text().trim();

            return { id: `j_${name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`, name, description, rarity, price: cost, imgUrl };
        }
    },
    {
        name: 'decks',
        url: '/wiki/Decks',
        selector: 'table tr',
        process: ($row, $) => {
            const cells = $row.find('td');
            if (cells.length < 2) return null;
            
            const imgElement = $(cells[0]).find('img');
            let imgUrl = imgElement.attr('data-src') || imgElement.attr('src');
            if (imgUrl && imgUrl.includes('/revision/')) imgUrl = imgUrl.split('/revision/')[0];
            
            const name = $(cells[1]).text().trim();
            if (!name) return null;
            
            const effect = $(cells[2]).text().trim();
            
            return { id: `d_${name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`, name, description: effect, imgUrl };
        }
    },
    {
        name: 'blinds',
        url: '/wiki/Blinds',
        selector: 'table tr', // Might need refinement
        process: ($row, $) => {
             const cells = $row.find('td');
            if (cells.length < 2) return null;
            
            const imgElement = $(cells[0]).find('img');
            let imgUrl = imgElement.attr('data-src') || imgElement.attr('src');
            if (imgUrl && imgUrl.includes('/revision/')) imgUrl = imgUrl.split('/revision/')[0];
            
            const name = $(cells[1]).text().trim();
            if (!name) return null;
            
            const score = $(cells[2]).text().trim();
            const reward = $(cells[3]).text().trim();
            const effect = $(cells[4]).text().trim();

            return { id: `b_${name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`, name, scoreBase: score, reward, effect, imgUrl };
        }
    },
    {
        name: 'vouchers',
        url: '/wiki/Vouchers',
        selector: 'table tr',
        process: ($row, $) => {
            const cells = $row.find('td');
            if (cells.length < 2) return null;

            const imgElement = $(cells[0]).find('img');
            let imgUrl = imgElement.attr('data-src') || imgElement.attr('src');
            if (imgUrl && imgUrl.includes('/revision/')) imgUrl = imgUrl.split('/revision/')[0];
            
            const name = $(cells[1]).text().trim();
            if (!name) return null;
            
            const effect = $(cells[2]).text().trim();
            const price = 10; // Standard price usually

            return { id: `v_${name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`, name, description: effect, price, imgUrl };
        }
    },
    {
        name: 'tarot_cards',
        url: '/wiki/Tarot_Cards',
        selector: 'table tr',
        process: ($row, $) => {
             const cells = $row.find('td');
            if (cells.length < 2) return null;
            
            const imgElement = $(cells[0]).find('img');
            let imgUrl = imgElement.attr('data-src') || imgElement.attr('src');
            if (imgUrl && imgUrl.includes('/revision/')) imgUrl = imgUrl.split('/revision/')[0];

            const name = $(cells[1]).text().trim();
            if (!name) return null;
            
            const effect = $(cells[2]).text().trim();
            
            return { id: `t_${name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`, name, description: effect, type: 'Tarot', imgUrl };
        }
    },
    {
        name: 'planet_cards',
        url: '/wiki/Planet_Cards',
        selector: 'table tr',
        process: ($row, $) => {
            const cells = $row.find('td');
            if (cells.length < 2) return null;

            const imgElement = $(cells[0]).find('img');
            let imgUrl = imgElement.attr('data-src') || imgElement.attr('src');
            if (imgUrl && imgUrl.includes('/revision/')) imgUrl = imgUrl.split('/revision/')[0];

            const name = $(cells[1]).text().trim();
            if (!name) return null;
            
            const hand = $(cells[2]).text().trim();
            const effect = $(cells[3]).text().trim();
            
            return { id: `p_${name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`, name, hand, description: effect, type: 'Planet', imgUrl };
        }
    }
    // Add more categories as needed
];

async function downloadImage(url, filepath) {
    if (!url) return false;
    try {
        const response = await axios({
            url,
            method: 'GET',
            responseType: 'stream'
        });
        const writer = fs.createWriteStream(filepath);
        response.data.pipe(writer);
        return new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });
    } catch (e) {
        console.error(`Failed to download ${url}:`, e.message);
        return false;
    }
}

async function scrapeCategory(category) {
    console.log(`Scraping ${category.name}...`);
    try {
        const { data } = await axios.get(BASE_URL + category.url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });
        const $ = cheerio.load(data);
        const items = [];
        const categoryDir = path.join(ASSETS_DIR, category.name);
        if (!fs.existsSync(categoryDir)) fs.mkdirSync(categoryDir, { recursive: true });
        
        const rows = $(category.selector);
        console.log(`Rows found: ${rows.length}`);

        rows.each((i, row) => {
            try {
                const item = category.process($(row), $);
                if (item && item.imgUrl) {
                    items.push(item);
                }
            } catch (e) {
                // ignore parse errors for headers etc
            }
        });

        console.log(`Found ${items.length} items for ${category.name}. Downloading images...`);
        
        for (const item of items) {
            const ext = item.imgUrl.split('.').pop().split('?')[0] || 'png';
            const filename = `${item.id}.${ext}`;
            const filepath = path.join(categoryDir, filename);
            
            if (!fs.existsSync(filepath)) {
                 await downloadImage(item.imgUrl, filepath);
                 console.log(`Downloaded ${filename}`);
            }
            // Update item with local path (relative to public)
            item.img = `/assets/${category.name}/${filename}`;
            delete item.imgUrl; // Clean up
        }

        fs.writeFileSync(path.join(DATA_DIR, `${category.name}.json`), JSON.stringify(items, null, 2));
        console.log(`Saved ${category.name}.json`);
        
    } catch (e) {
        console.error(`Error scraping ${category.name}:`, e.message);
    }
}

async function main() {
    for (const cat of CATEGORIES) {
        await scrapeCategory(cat);
    }
}

main();
