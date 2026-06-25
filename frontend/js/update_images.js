const fs = require('fs');
const path = require('path');

function updateLines(text) {
  const lines = text.split('\n');
  return lines.map(line => {
    if (line.includes('loremflickr.com')) {
      const urlMatch = line.match(/https:\/\/loremflickr\.com[^"']+/);
      if (urlMatch) {
         let lineLower = line.toLowerCase();
         let img = "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80"; // default
         if (lineLower.includes("biryani")) img = "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&q=80"; // biryani
         else if (lineLower.includes("pizza")) img = "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80"; // pizza
         else if (lineLower.includes("burger")) img = "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80"; // burger
         else if (lineLower.includes("cake") || lineLower.includes("dessert") || lineLower.includes("sweet") || lineLower.includes("jamun") || lineLower.includes("pastry") || lineLower.includes("brownie") || lineLower.includes("ice cream") || lineLower.includes("meetha") || lineLower.includes("payasam")) img = "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=800&q=80"; // desserts
         else if (lineLower.includes("chicken") || lineLower.includes("mutton") || lineLower.includes("nonveg") || lineLower.includes("egg") || lineLower.includes("wings") || lineLower.includes("fish")) img = "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=800&q=80"; // non-veg curry/chicken
         else if (lineLower.includes("coffee") || lineLower.includes("drink") || lineLower.includes("soda") || lineLower.includes("coke") || lineLower.includes("pepsi") || lineLower.includes("shake") || lineLower.includes("lassi") || lineLower.includes("milk") || lineLower.includes("buttermilk")) img = "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=800&q=80"; // drinks
         else if (lineLower.includes("dosa") || lineLower.includes("idli") || lineLower.includes("south") || lineLower.includes("meals") || lineLower.includes("thali")) img = "https://images.unsplash.com/photo-1610192244261-3f33de7155e4?w=800&q=80"; // south indian
         else if (lineLower.includes("paneer") || lineLower.includes("manchurian") || lineLower.includes("veg") || lineLower.includes("rice") || lineLower.includes("gobi")) img = "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&q=80"; // paneer/veg/rice
         else if (lineLower.includes("fries") || lineLower.includes("garlic bread") || lineLower.includes("sandwich") || lineLower.includes("wrap") || lineLower.includes("naan") || lineLower.includes("poori")) img = "https://images.unsplash.com/photo-1576107232684-1279f390859f?w=800&q=80"; // snacks

         return line.replace(urlMatch[0], img);
      }
    }
    return line;
  }).join('\n');
}

const homePath = path.join(__dirname, 'home.js');
const menuPath = path.join(__dirname, 'menu.js');

let home = fs.readFileSync(homePath, 'utf8');
fs.writeFileSync(homePath, updateLines(home));
console.log('Updated home.js');

let menu = fs.readFileSync(menuPath, 'utf8');
fs.writeFileSync(menuPath, updateLines(menu));
console.log('Updated menu.js');
