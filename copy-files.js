import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure dist directory exists
if (!fs.existsSync('dist')) {
  fs.mkdirSync('dist');
}

// Ensure dist/src/images directory exists
const imagesDirPath = path.join(__dirname, 'dist', 'src', 'images');
if (!fs.existsSync(path.join(__dirname, 'dist', 'src'))) {
  fs.mkdirSync(path.join(__dirname, 'dist', 'src'));
}
if (!fs.existsSync(imagesDirPath)) {
  fs.mkdirSync(imagesDirPath);
}

// Ensure dist/src/files directory exists
const filesDirPath = path.join(__dirname, 'dist', 'src', 'files');
if (!fs.existsSync(filesDirPath)) {
  fs.mkdirSync(filesDirPath);
}

// Copy PDF files to accessible locations
const filesToCopy = [
  // Keep original paths for existing links
  { source: 'src/files/Privacy_Policy.pdf', dest: 'dist/src/files/Privacy_Policy.pdf' },
  { source: 'src/files/Consent_personal_data.pdf', dest: 'dist/src/files/Consent_personal_data.pdf' },
  // Also copy to root level for easier access
  { source: 'src/files/Privacy_Policy.pdf', dest: 'dist/Privacy_Policy.pdf' },
  { source: 'src/files/Consent_personal_data.pdf', dest: 'dist/Consent_personal_data.pdf' }
];

filesToCopy.forEach(file => {
  try {
    const sourceFile = path.join(__dirname, file.source);
    const destFile = path.join(__dirname, file.dest);
    
    console.log(`Copying ${sourceFile} to ${destFile}`);
    fs.copyFileSync(sourceFile, destFile);
    console.log(`${file.source} copied successfully`);
  } catch (error) {
    console.error(`Error copying ${file.source}:`, error);
  }
}); 