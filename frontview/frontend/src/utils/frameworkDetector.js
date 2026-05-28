/**
 * Framework Detector (Frontend Version)
 * Ported from backend/src/utils/frameworkDetector.js
 */

export const detectFrameworkFromFiles = (files) => {
  // files is an array of { path, content }
  const filePaths = files.map(f => f.path.toLowerCase());
  
  // Find package.json
  const packageJson = files.find(f => f.path.toLowerCase().endsWith('package.json'));
  const indexHtml = files.find(f => f.path.toLowerCase().endsWith('index.html'));

  if (!packageJson && !indexHtml) {
    return { id: "other", name: "Other", install: "npm install", start: "npm start" };
  }

  if (packageJson) {
    try {
      // Decode content if it's base64
      let content = packageJson.content;
      if (packageJson.encoding === 'base64') {
        content = atob(packageJson.content);
      }
      const data = JSON.parse(content);
      const deps = { ...data.dependencies, ...data.devDependencies };
      const scripts = data.scripts || {};

      if (deps['vite']) return { id: "vite", name: "Vite", install: "npm install", start: "npm run dev" };
      if (deps['next']) return { id: "nextjs", name: "Next.js", install: "npm install", start: "npm run dev" };
      if (deps['react-scripts'] || deps['react']) return { id: "react", name: "React", install: "npm install", start: "npm start" };
      
      if (scripts['start']) return { id: "nodejs", name: "Node.js", install: "npm install", start: "npm start" };
    } catch (e) {
      console.error("Framework detection error:", e);
    }
  }

  if (indexHtml) {
    return { id: "other", name: "Static HTML", install: "", start: "npx serve" };
  }

  return { id: "other", name: "Other", install: "npm install", start: "npm start" };
};
