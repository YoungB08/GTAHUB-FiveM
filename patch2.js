const fs = require('fs');
const p = 'd:/FiveM/SOZ-FiveM-Server/resources/[soz]/soz-core/build/server.js';
let c = fs.readFileSync(p, 'utf8');
const patch = `const __fs = require('fs');
const __orig = __fs.existsSync;
__fs.existsSync = function(path) {
  try {
    return __orig(path);
  } catch(e) {
    if (e.message && e.message.includes('allow-fs-read')) return false;
    throw e;
  }
};
`;
if (!c.includes('__orig(path)')) {
  fs.writeFileSync(p, patch + c);
  console.log('Patched');
} else {
  console.log('Already patched');
}
