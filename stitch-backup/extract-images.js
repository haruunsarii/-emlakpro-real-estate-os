const fs = require('fs');
const path = require('path');

const screensDir = path.join(__dirname, 'screens');
const folders = fs.readdirSync(screensDir);
const imgUrls = new Set();

folders.forEach(f => {
  const htmlPath = path.join(screensDir, f, 'index.html');
  if (fs.existsSync(htmlPath)) {
    const content = fs.readFileSync(htmlPath, 'utf8');
    const regex = /src=["'](https?:\/\/[^"']+)["']/g;
    let match;
    while ((match = regex.exec(content)) !== null) {
      imgUrls.add(match[1]);
    }
  }
});

console.log('Total unique remote images found:', imgUrls.size);
fs.writeFileSync(path.join(__dirname, 'images-manifest.json'), JSON.stringify([...imgUrls], null, 2), 'utf8');
console.log('Saved images-manifest.json successfully!');

