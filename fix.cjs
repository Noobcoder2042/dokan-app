const fs = require('fs');
const file = 'src/component/Calculator.jsx';
let content = fs.readFileSync(file, 'utf8');

const badStr = 'borderRadius: 4, boxShadow: "0 4px 20px rgba(0,0,0,0.04)", border: "1px solid", borderColor: "divider", borderRadius: 4, boxShadow: "0 4px 20px rgba(0,0,0,0.04)", border: "1px solid", borderColor: "divider"';
const goodStr = 'borderRadius: 4, boxShadow: "0 4px 20px rgba(0,0,0,0.04)", border: "1px solid", borderColor: "divider"';

content = content.split(badStr).join(goodStr);

fs.writeFileSync(file, content);
console.log('Fixed duplicated keys');
