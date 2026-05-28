const fs = require('fs');
const path = require('path');

const dirs = [
  'src/pages/main_dashboard',
  'src/pages/project_view',
  'src/pages/auth',
  'src/components/layout',
  'src/components/project',
  'src/components/ui',
];

const replacements = [
  ['#00FFCC', '#6EE7B7'],
  ['#FFCC00', '#D4A84B'],
  ['#FF3333', '#E55B5B'],
  ['#050505', '#060606'],
];

// Files to skip (landing page)
const skipFiles = ['HeroSection.jsx', 'Features.jsx', 'StepSection.jsx', 'Landing.jsx'];

let totalUpdated = 0;

for (const dir of dirs) {
  const fullDir = path.join(__dirname, dir);
  if (!fs.existsSync(fullDir)) continue;

  const files = fs.readdirSync(fullDir).filter(f => f.endsWith('.jsx') || f.endsWith('.js'));

  for (const file of files) {
    if (skipFiles.includes(file)) continue;

    const filePath = path.join(fullDir, file);
    let content = fs.readFileSync(filePath, 'utf-8');
    let changed = false;

    for (const [from, to] of replacements) {
      if (content.includes(from)) {
        content = content.split(from).join(to);
        changed = true;
      }
    }

    if (changed) {
      fs.writeFileSync(filePath, content, 'utf-8');
      console.log('Updated:', file);
      totalUpdated++;
    }
  }
}

console.log(`\nDone! Updated ${totalUpdated} files.`);
