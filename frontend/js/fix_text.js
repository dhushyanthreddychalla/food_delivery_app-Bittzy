const fs = require('fs');
const path = require('path');

function fixText(filePath) {
    let text = fs.readFileSync(filePath, 'utf8');
    
    // The exact corrupted strings in the file:
    const replacements = {
        "â‚¹": "₹",
        "â ±ï¸ ": "⏱️",
        "ðŸ ·ï¸ ": "🏷️",
        "ðŸ ½ï¸ ": "🍽️",
        "ðŸ“ ": "📍",
        "â­ ": "⭐",
        "ðŸŸ¢": "🟢",
        "ðŸ”´": "🔴",
        "ðŸ˜¶": "😶",
        "âœ…": "✅"
    };

    for (const [bad, good] of Object.entries(replacements)) {
        text = text.split(bad).join(good);
    }
    
    fs.writeFileSync(filePath, text, 'utf8');
    console.log(`Fixed ${filePath}`);
}

fixText(path.join(__dirname, 'home.js'));
fixText(path.join(__dirname, 'menu.js'));
