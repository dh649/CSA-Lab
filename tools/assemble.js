const fs = require('fs'); const R = require('path').resolve(__dirname, '..') + '/';
let h = fs.readFileSync(R + 'src/shell.html', 'utf8');
const eng = fs.readFileSync(R + 'src/engine.js', 'utf8');
const data = fs.readFileSync(R + 'build/data.json', 'utf8').replace(/<\//g, '<\\/');
const app = fs.readFileSync(R + 'src/app.js', 'utf8');
h = h.replace('/*ENGINE*/', () => eng).replace('/*DATA*/', () => data).replace('/*APP*/', () => app);
fs.writeFileSync(R + 'dist/index.html', h);
console.log('bytes', h.length);
