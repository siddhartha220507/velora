import React from 'react';
import { Link } from 'react-router-dom';
// IMPORTANT: Ensure this path is correct based on your folder structure
import footerDecoration from "../../assets/footer-assets.png";

const footerLinks = {
  Product: ["Features", "Pricing", "Changelog", "Status"],
  Resources: ["Documentation", "Guides", "API Reference", "Blog"],
  Company: ["About Us", "Careers", "Contact"],
};

const Logo = () => (
  <Link to="/" className="flex items-center gap-2 group cursor-pointer">
    <div className="w-6 h-6 flex items-center justify-center">
      {/* Updated Logo SVG to match the reference "V" shape */}
      <svg viewBox="0 0 40 40" className="w-full h-full fill-[#a3e635] group-hover:scale-110 transition-transform">
        <path d="M20 5L5 15V25L20 35L35 25V15L20 5ZM18 28L10 20L12 18L18 24L28 14L30 16L18 28Z" />
      </svg>
    </div>
    <span
      className="text-white font-bold tracking-widest uppercase group-hover:text-[#a3e635] transition-colors"
      style={{ fontFamily: "'Space Mono', monospace", fontSize: "16px" }}
    >
      Velora
    </span>
  </Link>
);

export default function Footer() {
  return (
    <footer className="bg-[#050910] px-6 lg:px-12 border-t border-white/5">
      <div className="max-w-7xl mx-auto py-16">
        <div className="flex flex-col lg:flex-row justify-between gap-12 lg:gap-4">
          
          {/* Brand Section with reference-accurate Vertical Divider */}
          <div className="flex flex-col lg:flex-row lg:items-start lg:col-span-2 gap-8 lg:pr-12 lg:border-r lg:border-white/10">
            <div className="max-w-[240px]">
              <Logo />
              <p className="text-gray-400 text-[11px] mt-6 leading-relaxed font-mono opacity-80">
                Deploy modern apps with speed, security, and simplicity.
              </p>
              {/* Social Icons matched to reference positions */}
              <div className="flex items-center gap-6 mt-8">
                <a href="#" className="text-gray-400 hover:text-white transition-colors"><GithubIcon /></a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors"><DiscordIcon /></a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors"><TwitterIcon /></a>
              </div>
            </div>
          </div>

          {/* Links Section - Balanced Spacing */}
          <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-8 lg:px-12">
            {Object.entries(footerLinks).map(([group, links]) => (
              <div key={group}>
                <h4 className="text-white text-[11px] font-bold uppercase tracking-widest mb-6 font-mono">
                  {group}
                </h4>
                <ul className="space-y-4">
                  {links.map((link) => (
                    <li key={link}>
                      <a href="#" className="text-gray-500 hover:text-[#a3e635] text-[11px] font-mono transition-colors duration-200">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Decorative Assets Section - Matches right side of reference image */}
          <div className="flex flex-col items-center lg:items-end justify-center gap-4">
            <div className="relative w-40 md:w-44">
                <img 
                    src={footerDecoration} 
                    alt="Minecraft assets" 
                    className="w-full h-auto drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)]" 
                />
            </div>
            <div className="flex items-center gap-2 text-gray-400 text-[11px] font-mono whitespace-nowrap">
              <span>Made with</span>
              <span className="text-[#a3e635]">💚</span>
              <span>by Velora Team</span>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom Bar matched to reference layout */}
      <div className="border-t border-white/5 py-8">
        <div className="max-w-7xl mx-auto flex flex-row items-center justify-between px-4">
          <p className="text-gray-500 text-[10px] font-mono uppercase tracking-tight">
            © 2025 Velora. All rights reserved.
          </p>
          <a href="#" className="text-[#a3e635] hover:text-white text-[10px] font-mono transition-colors font-bold">
            velora.dev
          </a>
        </div>
      </div>
    </footer>
  );
}

// Icon Components (Refined simple paths)
const GithubIcon = () => (
  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.11.82-.26.82-.577v-2.234c-3.338-.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.372.82 1.102.82 2.222v3.293c0 .319.192.694.8.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.63-5.37-12-12-12z"/></svg>
);

const DiscordIcon = () => (
  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057.1 18.08.114 18.1.129 18.11a19.9 19.9 0 005.993 3.03.077.077 0 00.084-.028 14.09 14.09 0 001.226-1.994.075.075 0 00-.041-.104 13.201 13.201 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03z"/></svg>
);

const TwitterIcon = () => (
  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.045 4.126H5.078z"/></svg>
);