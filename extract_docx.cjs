const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 1. Rename to .zip temporarily to use standard unzipping tools
const sourcePath = 'C:\\Users\\Usuário\\Downloads\\Planejamento - ERP para E-Commerce.docx';
const destFolder = 'C:\\Users\\Usuário\\Downloads\\Planejamento_Temp';

try {
    if (fs.existsSync(destFolder)) {
        fs.rmSync(destFolder, { recursive: true, force: true });
    }
    
    // We use tar -xf on Windows 10+ which supports zip files natively via tar tool
    fs.mkdirSync(destFolder);
    execSync(`tar -xf "${sourcePath}" -C "${destFolder}"`);

    // 2. Read document.xml
    const docXmlPath = path.join(destFolder, 'word', 'document.xml');
    const xmlContent = fs.readFileSync(docXmlPath, 'utf8');

    // 3. Simple Regex to extract text from XML tags
    let text = xmlContent.replace(/<\/w:p>/g, '\\n'); // Paragraphs become newlines
    text = text.replace(/<[^>]+>/g, ''); // Remove all other XML tags
    
    console.log(text);
    
    // 4. Cleanup
    fs.rmSync(destFolder, { recursive: true, force: true });

} catch (error) {
    console.error('Error:', error.message);
}
