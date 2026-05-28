import React, { useRef } from "react";
import { NavLink } from "react-router-dom";
import { Search, Menu, Zap, Globe, Shield, Cpu, Activity } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";

const MarqueeStrip = ({ direction = "left", color = "bg-white/5" }) => {
  return (
    <div className={`absolute w-[200%] h-12 ${color} border-y border-white/5 overflow-hidden flex items-center z-20 pointer-events-none`}>
      <motion.div 
        animate={{ x: direction === "left" ? [0, "-50%"] : ["-50%", 0] }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        className="flex gap-12 items-center px-12"
      >
        {[...Array(20)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.5em] text-white/20">
            <Zap size={14} className="fill-current" />
            VELORA_CORE_INITIALIZED
          </div>
        ))}
      </motion.div>
    </div>
  );
};

const HeroSection = () => {
  const containerRef = useRef(null);
  const { scrollY } = useScroll();
  
  const coreY = useTransform(scrollY, [0, 500], [0, -100]);
  const textY = useTransform(scrollY, [0, 500], [0, 100]);
  const opacity = useTransform(scrollY, [0, 400], [1, 0]);

  return (
    <section ref={containerRef} className="relative min-h-screen w-full bg-[#050505] overflow-hidden select-none flex flex-col font-cinematic">
      
      {/* Top Navigation Overlay */}
      <nav className="absolute top-0 left-0 right-0 z-[60] flex items-center justify-between px-10 py-10">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-black tracking-tighter">VELORA</span>
          <div className="w-6 h-6 rounded-full border-2 border-emerald-500 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
        </div>

        <div className="hidden md:flex gap-12 text-[10px] font-black uppercase tracking-[0.4em] text-white/40">
          <a href="#" className="hover:text-white transition-colors">Infrastructure</a>
          <a href="#" className="hover:text-white transition-colors">Protocols</a>
          <a href="#" className="hover:text-white transition-colors">Edge_Nodes</a>
          <a href="#" className="hover:text-white transition-colors">Security</a>
        </div>

        <div className="flex items-center gap-6">
          <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 cursor-pointer transition-all">
            <Search size={18} />
          </div>
          <div className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center cursor-pointer hover:scale-110 transition-all">
            <Menu size={20} />
          </div>
        </div>
      </nav>

      {/* Floating Meta Data (Actor Names Style) */}
      <div className="absolute top-[25%] left-0 right-0 z-50 flex justify-around px-10 md:px-20 pointer-events-none">
        {[
          { label: "High_Performance", val: "2.4 TB/S" },
          { label: "Global_Scale", val: "24 REGIONS" },
          { label: "Zero_Latency", val: "12MS AVG" },
          { label: "Auto_Scaling", val: "INFINITE" }
        ].map((item, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + i * 0.1 }}
            className="flex flex-col items-center gap-1"
          >
            <span className="text-[9px] font-black tracking-[0.4em] text-white/30 uppercase">{item.label}</span>
            <span className="text-lg font-black tracking-tighter text-white uppercase">{item.val}</span>
          </motion.div>
        ))}
      </div>

      {/* Main Cinematic Core */}
      <div className="relative flex-1 flex items-center justify-center">
        
        {/* Massive Background Text */}
        <motion.div 
          style={{ y: textY, opacity }}
          className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none"
        >
          <h1 className="text-massive font-black text-white/[0.03] md:text-white/[0.05] tracking-tighter select-none">
            VELORA
          </h1>
        </motion.div>

        {/* Central Character/Core */}
        <motion.div 
          style={{ y: coreY }}
          className="relative z-30 w-full max-w-2xl px-4"
        >
          {/* Back Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-emerald-500/10 blur-[150px] rounded-full" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-emerald-500/20 border border-emerald-500/30 rounded-full scale-150 opacity-20" />

          {/* Core Image */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="relative"
          >
            <img 
              src="/src/assets/cinematic-core.png" 
              alt="Velora Core" 
              className="w-full h-auto drop-shadow-[0_0_80px_rgba(34,197,94,0.3)] relative z-20"
              onError={(e) => {
                // Fallback in case the image copy failed
                e.target.src = "https://images.unsplash.com/photo-1639322537228-f710d846310a?q=80&w=1000&auto=format&fit=crop";
              }}
            />
            
            {/* Secondary Floating Elements */}
            <motion.div 
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-10 -right-10 w-24 h-24 glass-cinematic rounded-2xl flex items-center justify-center border-emerald-500/20"
            >
               <Activity size={32} className="text-emerald-500" />
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Vertical Info */}
        <div className="absolute right-10 top-1/2 -translate-y-1/2 flex flex-col items-center gap-4 z-40">
           <div className="w-px h-24 bg-white/10" />
           <span className="text-vertical text-[10px] font-black uppercase tracking-[0.5em] text-white/30">[2024_DEPLOY]</span>
        </div>
      </div>

      {/* Marquee Overlays */}
      <div className="absolute bottom-[15%] left-0 right-0 z-40 transform rotate-[-2deg] scale-110">
        <MarqueeStrip direction="left" color="bg-emerald-500/10" />
      </div>
      <div className="absolute bottom-[20%] left-0 right-0 z-40 transform rotate-[1deg] scale-110">
        <MarqueeStrip direction="right" color="bg-white/[0.02]" />
      </div>

      {/* Call to Action Footer */}
      <div className="relative z-50 p-10 flex items-end justify-between border-t border-white/[0.05] bg-gradient-to-t from-black to-transparent">
        <div className="flex flex-col gap-2">
           <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em]">Ready_For_Initialization</span>
           <div className="flex gap-4">
              <NavLink to="/register" className="px-8 py-3 bg-white text-black text-[12px] font-black uppercase tracking-widest hover:scale-105 transition-all">
                Start_Uplink
              </NavLink>
              <NavLink to="/login" className="px-8 py-3 border border-white/10 text-white text-[12px] font-black uppercase tracking-widest hover:bg-white/5 transition-all">
                Initialize_Vault
              </NavLink>
           </div>
        </div>
        
        <div className="hidden lg:block max-w-xs text-right">
           <p className="text-[10px] text-white/30 uppercase leading-relaxed font-black tracking-tighter">
             Velora systems are strictly isolated and only available to the build runtime. Values are hashed and masked for security compliance.
           </p>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
