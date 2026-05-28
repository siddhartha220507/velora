import { Globe, Rocket, Zap, Cpu, Settings2, Code } from "lucide-react";

export const getFrameworkIcon = (framework, size = 18) => {
  const fw = String(framework).toLowerCase();
  
  switch (fw) {
    case 'react':
      return { Icon: Globe, color: '#61DAFB' };
    case 'nextjs':
      return { Icon: Rocket, color: '#ffffff' };
    case 'vite':
      return { Icon: Zap, color: '#FFD62E' };
    case 'nodejs':
      return { Icon: Cpu, color: '#339933' };
    case 'vanilla':
      return { Icon: Code, color: '#F7DF1E' };
    default:
      return { Icon: Settings2, color: '#71717a' };
  }
};
