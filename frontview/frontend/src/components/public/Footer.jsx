import React from "react";
import { Zap, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import GlassButton from "../ui/GlassButton";
import { NavLink } from "react-router-dom";

const Github = ({ size = 18 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
);

const Twitter = ({ size = 18 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
);

const Linkedin = ({ size = 18 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
);

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-[#09090b] text-white font-sans overflow-hidden">
      
      {/* Premium CTA Section */}
      <div className="relative py-32 px-6">
         <div className="absolute inset-0 bg-emerald-500/5 blur-[120px] rounded-full translate-y-1/2" />
         
         <motion.div 
           initial={{ opacity: 0, y: 50 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           className="max-w-5xl mx-auto glass-panel rounded-[48px] p-12 md:p-24 text-center relative overflow-hidden group"
         >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            
            <h2 className="text-4xl md:text-7xl font-black tracking-tighter uppercase mb-10 leading-none">
              READY_TO_SCALE <br />
              <span className="text-[#52525b]">YOUR_VISION?</span>
            </h2>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 relative z-10">
               <NavLink to="/register" className="w-full sm:w-auto">
                 <GlassButton variant="primary" className="h-16 px-12 text-[15px] font-black uppercase tracking-[0.3em] w-full">
                    Initialize_Cluster
                 </GlassButton>
               </NavLink>
               <GlassButton variant="outline" className="h-16 px-12 text-[15px] font-black uppercase tracking-[0.3em] w-full group/btn">
                  Speak_to_SDE <ArrowRight size={20} className="ml-2 group-hover/btn:translate-x-1 transition-transform" />
               </GlassButton>
            </div>

            <div className="mt-16 text-[10px] font-black text-[#3f3f46] uppercase tracking-[0.4em]">
               System_Requirement: 1_Deployment_Ready
            </div>
         </motion.div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-20 md:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
          
          <div className="lg:col-span-4 space-y-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.1] flex items-center justify-center p-2">
                <Zap size={24} className="text-white fill-white" />
              </div>
              <span className="text-xl font-black text-white tracking-tighter uppercase">Velora</span>
            </div>

            <p className="text-[#52525b] font-medium uppercase text-[11px] tracking-tight leading-relaxed max-w-xs">
              The high-performance deployment engine for modern engineering teams. Engineered for speed, security, and global scale.
            </p>

            <div className="flex gap-4">
              {[Github, Twitter, Linkedin].map((Icon, i) => (
                <a key={i} href="#" className="w-10 h-10 rounded-xl border border-white/[0.04] flex items-center justify-center text-[#3f3f46] hover:text-white hover:border-white/20 hover:bg-white/5 transition-all">
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-12">
            {[
              { title: "Platform", links: ["Engine", "Network", "Security", "Uptime"] },
              { title: "Developers", links: ["Docs", "API", "SDKs", "Guides"] },
              { title: "Company", links: ["About", "Careers", "Contact", "Press"] },
              { title: "Support", links: ["Status", "Help_Center", "Security", "Terms"] }
            ].map((section) => (
              <div key={section.title} className="space-y-6">
                <h4 className="text-[11px] font-black text-white uppercase tracking-[0.3em]">
                  {section.title}
                </h4>
                <ul className="space-y-4">
                  {section.links.map((link) => (
                    <li key={link}>
                      <a href="#" className="text-[11px] font-black text-[#3f3f46] uppercase tracking-tighter hover:text-white transition-colors">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-32 pt-12 border-t border-white/[0.04] flex flex-col md:row justify-between items-center gap-8">
          <div className="text-[10px] font-black text-[#3f3f46] uppercase tracking-[0.2em]">
            © {currentYear} Velora_Systems_Inc // All_Rights_Reserved
          </div>
          
          <div className="flex items-center gap-6">
             <div className="flex items-center gap-3 px-4 py-1.5 rounded-full bg-emerald-500/5 border border-emerald-500/10 text-[9px] font-black text-emerald-500 uppercase tracking-[0.2em]">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Global_Network_Operational
             </div>
             <div className="text-[9px] font-black text-[#3f3f46] uppercase tracking-[0.2em]">
                Latency: 12ms // Region: Global
             </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
