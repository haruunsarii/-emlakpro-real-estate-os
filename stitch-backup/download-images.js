const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const manifestPath = path.join(__dirname, 'images-manifest.json');
const imagesDir = path.join(__dirname, 'images');
fs.mkdirSync(imagesDir, { recursive: true });

const rawUrls = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
// Filter out CDN scripts or stylesheets
const urls = rawUrls.filter(u => !u.endsWith('.js') && !u.includes('tailwindcss.com') && !u.endsWith('.css'));

function fetchUrl(targetUrl, dest) {
  return new Promise((resolve) => {
    try {
      const parsed = new URL(targetUrl);
      const client = parsed.protocol === 'https:' ? https : http;
      client.get(targetUrl, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          const redirectUrl = new URL(res.headers.location, targetUrl).href;
          fetchUrl(redirectUrl, dest).then(resolve);
        } else if (res.statusCode === 200) {
          const fileStream = fs.createWriteStream(dest);
          res.pipe(fileStream);
          fileStream.on('finish', () => {
            fileStream.close();
            resolve(true);
          });
        } else {
          resolve(false);
        }
      }).on('error', () => {
        resolve(false);
      });
    } catch (e) {
      resolve(false);
    }
  });
}

async function downloadAll() {
  console.log(`Downloading ${urls.length} images...`);
  let count = 0;
  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    const filename = `asset_${String(i + 1).padStart(2, '0')}.jpg`;
    const dest = path.join(imagesDir, filename);
    await fetchUrl(url, dest);
    count++;
    process.stdout.write('.');
  }
  console.log(`\nDownloaded ${count} image assets!`);
}

downloadAll();
