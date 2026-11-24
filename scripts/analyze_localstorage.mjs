import fs from 'fs';
import path from 'path';

function findFiles(dir, exts) {
  let list = [];
  for (const item of fs.readdirSync(dir)) {
    const full = path.join(dir, item);
    if (fs.statSync(full).isDirectory()) {
      list = list.concat(findFiles(full, exts));
    } else if (exts.some((e) => item.endsWith(e))) {
      list.push(full);
    }
  }
  return list;
}

const files = findFiles('src', ['.js', '.jsx']);
const keyMatches = new Map();
const eventMatches = new Set();
const usagesByFile = {};

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  const keyRegex = /localStorage\.(?:getItem|setItem|removeItem)\(\s*['"]([^'"]+)['"]/g;
  let m;
  while ((m = keyRegex.exec(content)) !== null) {
    const k = m[1];
    if (!keyMatches.has(k)) keyMatches.set(k, []);
    keyMatches.get(k).push(file);

    if (!usagesByFile[file]) usagesByFile[file] = [];
    usagesByFile[file].push(k);
  }
  const eventRegex = /window\.(?:addEventListener|removeEventListener|dispatchEvent)\(\s*(?:new Event\(['"]|['"])([^'"]+)/g;
  while ((m = eventRegex.exec(content)) !== null) {
    if (m[1].includes('storage') || m[1].includes('emlakpro') || m[1] === 'focus') {
      eventMatches.add(m[1]);
    }
  }
}

console.log('--- EMLAKPRO LOCALSTORAGE ANAHTARLARI ---');
for (const [k, flist] of keyMatches.entries()) {
  console.log(`Key: "${k}" (${flist.length} dosyada kullanılıyor)`);
}

console.log('\n--- DİNLENEN / TETİKLENEN SENKRONİZASYON EVENTLERİ ---');
console.log(Array.from(eventMatches));

console.log('\n--- DOSYA BAZLI KULLANIMLAR ---');
for (const [f, keys] of Object.entries(usagesByFile)) {
  console.log(`${f}: [${Array.from(new Set(keys)).join(', ')}]`);
}

