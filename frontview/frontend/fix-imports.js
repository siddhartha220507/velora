import fs from 'fs';
import path from 'path';

const srcDir = path.join(process.cwd(), 'src');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

function fixImports() {
  walkDir(srcDir, (filePath) => {
    if (!filePath.endsWith('.jsx')) return;
    let content = fs.readFileSync(filePath, 'utf-8');
    let original = content;

    // Fix auth imports
    if (filePath.includes('pages\\auth') || filePath.includes('pages/auth')) {
      content = content.replace(/from "\.\.\/api/g, 'from "../../api');
      content = content.replace(/from "\.\.\/assets/g, 'from "../../assets');
    }
    
    // Fix Dashboard imports
    if (filePath.includes('Dashboard.jsx')) {
      content = content.replace(/from "\.\/Sidebar"/g, 'from "../../components/layout/Sidebar"');
      content = content.replace(/from "\.\/TopNav"/g, 'from "../../components/layout/TopNav"');
    }

    // Fix project_view imports
    if (filePath.includes('project_view')) {
      content = content.replace(/from "\.\.\/dashboard\/Sidebar"/g, 'from "../../components/layout/Sidebar"');
      content = content.replace(/from "\.\.\/dashboard\/TopNav"/g, 'from "../../components/layout/TopNav"');
    }

    // Fix public landing pages imports
    if (filePath.includes('pages\\public') || filePath.includes('pages/public')) {
      content = content.replace(/from "\.\/Landing\/HeroSection"/g, 'from "../../components/public/HeroSection"');
      content = content.replace(/from "\.\/Landing\/FeatureSection"/g, 'from "../../components/public/Features"');
      content = content.replace(/from "\.\/Landing\/StepSection"/g, 'from "../../components/public/StepSection"');
      content = content.replace(/from "\.\/Landing\/Footer"/g, 'from "../../components/public/Footer"');
    }

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf-8');
      console.log('Fixed imports in:', filePath);
    }
  });
}

fixImports();
console.log('Imports fixed!');
