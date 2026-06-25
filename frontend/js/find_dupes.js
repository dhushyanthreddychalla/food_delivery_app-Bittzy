const fs = require('fs');
const content = fs.readFileSync('menu.js', 'utf8');

const imgRegex = /img:"([^"]+)"/g;
let match;
const urls = [];
while ((match = imgRegex.exec(content)) !== null) {
    urls.push(match[1]);
}

const counts = {};
urls.forEach(u => counts[u] = (counts[u] || 0) + 1);

let duplicateCount = 0;
for (const [url, count] of Object.entries(counts)) {
    if (count > 1) {
        console.log(`Duplicate found (${count} times): ${url}`);
        duplicateCount++;
    }
}
console.log(`Total unique URLs: ${Object.keys(counts).length}`);
console.log(`Total URLs: ${urls.length}`);
console.log(`Number of duplicated URLs: ${duplicateCount}`);
