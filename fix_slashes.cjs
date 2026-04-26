const fs = require('fs');

const files = [
    '../avivar-api/src/controllers/pedidoController.ts',
    '../avivar-api/src/controllers/authController.ts'
];

for (const file of files) {
    if (!fs.existsSync(file)) continue;
    let content = fs.readFileSync(file, 'utf8');
    // Replace \` with `
    content = content.replace(/\\\\`/g, '`');
    content = content.replace(/\\`/g, '`');
    // Replace \$ with $
    content = content.replace(/\\\\\$/g, '$');
    content = content.replace(/\\\$/g, '$');
    fs.writeFileSync(file, content);
    console.log('Fixed', file);
}
