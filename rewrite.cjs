const fs = require('fs');
const file = 'src/component/Calculator.jsx';
let content = fs.readFileSync(file, 'utf8');

function getBalancedTag(str, startIdx, tagName) {
  let depth = 0;
  let i = startIdx;
  let openTag = '<' + tagName;
  let closeTag = '</' + tagName + '>';
  
  while (i < str.length) {
    if (str.substring(i, i + openTag.length + 1).match(new RegExp('^<' + tagName + '([ >])'))) {
      depth++;
      i += openTag.length;
    } else if (str.substring(i, i + closeTag.length) === closeTag) {
      depth--;
      if (depth === 0) {
        return i + closeTag.length;
      }
      i += closeTag.length;
    } else {
      i++;
    }
  }
  return -1;
}

const mainGridStart = content.indexOf('<Grid container spacing={3}>');
const mainGridEnd = getBalancedTag(content, mainGridStart, 'Grid');

let mainGridContent = content.substring(mainGridStart, mainGridEnd);

function getChildGrids(str) {
  let children = [];
  let i = 0;
  while (true) {
    let childStart = str.indexOf('<Grid item xs={12} lg={', i);
    if (childStart === -1) break;
    // ensure it's not nested deeply, but for our case it's fine since we know the structure
    let childEnd = getBalancedTag(str, childStart, 'Grid');
    if (childEnd === -1) break;
    
    // Check if this Grid is a direct child of the container
    let substrBefore = str.substring(0, childStart);
    // Rough check: count depth of Grid tags before it
    let depth = (substrBefore.match(/<Grid[ >]/g) || []).length - (substrBefore.match(/<\/Grid>/g) || []).length;
    
    if (depth === 1) {
      children.push(str.substring(childStart, childEnd));
    }
    i = childEnd;
  }
  return children;
}

const childrenGrids = getChildGrids(mainGridContent);

if (childrenGrids.length === 4) {
  const [topLeft, topRight, bottomLeft, bottomRight] = childrenGrids;
  
  // Remove sticky from topRight card
  let fixedTopRight = topRight.replace(/sx=\{\{ position: \{ lg: "sticky" \}, top: \{ lg: 104 \} \}\}/g, '');
  // Remove inner sticky from summary paper
  fixedTopRight = fixedTopRight.replace(/position: "sticky",\s*bottom: 10,\s*zIndex: 5,/g, '');
  
  function stripGridWrapper(str) {
    return str.replace(/^<Grid[^>]+>\s*/, '').replace(/\s*<\/Grid>$/, '');
  }

  const newMainGrid = `
      <Grid container spacing={4}>
        <Grid item xs={12} lg={8}>
          <Stack spacing={4}>
            ${stripGridWrapper(topLeft)}
            ${stripGridWrapper(bottomLeft)}
          </Stack>
        </Grid>
        <Grid item xs={12} lg={4}>
          <Stack spacing={4} sx={{ position: { lg: "sticky" }, top: { lg: 104 } }}>
            ${stripGridWrapper(fixedTopRight)}
            ${stripGridWrapper(bottomRight)}
          </Stack>
        </Grid>
      </Grid>
`;

  content = content.replace(mainGridContent, newMainGrid.trim());
  
  // Let's also add some nice border radius to Cards across the file
  content = content.replace(/<Card>/g, '<Card sx={{ borderRadius: 4, boxShadow: "0 4px 20px rgba(0,0,0,0.04)", border: "1px solid", borderColor: "divider" }}>');
  content = content.replace(/<Card sx={{/g, '<Card sx={{ borderRadius: 4, boxShadow: "0 4px 20px rgba(0,0,0,0.04)", border: "1px solid", borderColor: "divider",');
  
  fs.writeFileSync(file, content);
  console.log('Successfully rewritten the layout!');
} else {
  console.log('Error: Found ' + childrenGrids.length + ' children, expected 4.');
  console.log(childrenGrids.map(g => g.substring(0, 50)));
}
