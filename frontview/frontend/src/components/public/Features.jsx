import React from "react";
import { Activity, Server, Zap, Globe, Shield, Cpu, Layers, MousePointer2 } from "lucide-react";
import { motion } from "framer-motion";

const FeatureCard = ({ children, className, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    viewport={{ once: true }}
    className={`glass-cinematic rounded-[40px] p-10 relative overflow-hidden group hover:border-emerald-500/20 transition-all ${className}`}
  >
    {children}
  </motion.div>
);

const FeaturesSection = () => {
  return (
    <section className="bg-[#09090b] text-white font-sans py-32 px-6 md:px-16 relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-24 flex flex-col items-start max-w-3xl">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-black text-emerald-500 uppercase tracking-[0.4em] mb-6"
          >
            Capabilities_Overview
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.8] mb-12 uppercase"
          >
            UNCOMPROMISED <br />
            <span className="text-white/20">PERFORMANCE</span>
          </motion.h2>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Main Large Card */}
          <FeatureCard className="md:col-span-8 h-[500px] flex flex-col justify-between overflow-hidden">
            <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-emerald-500/10 blur-[100px] rounded-full group-hover:bg-emerald-500/20 transition-all" />
            
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-6">
                <Activity size={24} />
              </div>
              <h3 className="text-3xl font-black tracking-tighter uppercase mb-4">Edge_Optimization_Protocol</h3>
              <p className="text-[#71717a] font-medium max-w-md uppercase text-[12px] tracking-tight leading-relaxed">
                Every deployment is automatically distributed across 24 edge regions, ensuring &lt;12ms latency for users globally. Our proprietary caching layer adapts to traffic patterns in real-time.
              </p>
            </div>

            <div className="relative z-10 grid grid-cols-3 gap-10 pt-10 border-t border-white/[0.04]">
               {[
                 { label: "Throughput", val: "2.4Tb/s", color: "text-emerald-500" },
                 { label: "Global_SLA", val: "99.99%", color: "text-blue-500" },
                 { label: "Active_Nodes", val: "1,200+", color: "text-purple-500" }
               ].map((stat, i) => (
                 <div key={i}>
                   <div className="text-[10px] font-black text-[#3f3f46] uppercase tracking-[0.2em] mb-1">{stat.label}</div>
                   <div className={`text-2xl font-black tracking-tighter ${stat.color}`}>{stat.val}</div>
                 </div>
               ))}
            </div>
          </FeatureCard>

          {/* Small Stats Card */}
          <FeatureCard className="md:col-span-4 h-[500px] flex flex-col items-center justify-center text-center">
             <motion.div 
               animate={{ rotate: 360 }}
               transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
               className="w-48 h-48 rounded-full border border-dashed border-white/10 flex items-center justify-center mb-10"
             >
                <div className="w-32 h-32 rounded-full border border-white/5 flex items-center justify-center relative">
                   <Zap size={40} className="text-white fill-white animate-pulse" />
                   <div className="absolute inset-0 bg-white/5 blur-2xl rounded-full" />
                </div>
             </motion.div>
             <h3 className="text-xl font-black uppercase tracking-tighter mb-2">Instant_Cold_Starts</h3>
             <p className="text-[10px] text-[#3f3f46] font-black uppercase tracking-[0.2em]">Deployment_Latency: 0ms</p>
          </FeatureCard>

          {/* Feature Grid */}
          {[
            { title: "Universal_Security", desc: "Automatic SSL, DDoS protection, and isolation sandboxing.", icon: <Shield />, col: "md:col-span-4" },
            { title: "CI/CD_Pipeline", desc: "Native Git integration with preview deployments on every PR.", icon: <Layers />, col: "md:col-span-4" },
            { title: "One-Click_Scaling", desc: "Infinitely scalable infrastructure that grows with your userbase.", icon: <Cpu />, col: "md:col-span-4" }
          ].map((feat, i) => (
            <FeatureCard key={i} className={`${feat.col} h-[300px]`} delay={i * 0.1}>
               <div className="w-10 h-10 rounded-lg bg-white/[0.03] flex items-center justify-center text-[#52525b] mb-6 group-hover:text-white group-hover:bg-white/10 transition-all">
                 {feat.icon}
               </div>
               <h3 className="text-lg font-black uppercase tracking-tighter mb-3">{feat.title}</h3>
               <p className="text-[11px] text-[#52525b] font-medium leading-relaxed uppercase tracking-tighter group-hover:text-[#a1a1aa] transition-colors">
                 {feat.desc}
               </p>
            </FeatureCard>
          ))}

          {/* Code Showcase Card */}
          <FeatureCard className="md:col-span-12 h-[400px] bg-[#0d0d0f] border-emerald-500/20">
             <div className="grid lg:grid-cols-2 gap-12 items-center h-full">
                <div>
                  <h3 className="text-3xl font-black tracking-tighter uppercase mb-6">Built_for_Developers</h3>
                  <p className="text-[#71717a] text-sm font-medium uppercase tracking-tighter leading-relaxed mb-8">
                    Your terminal is the only tool you need. Deploy with a single command or let our automated pipelines handle everything from test to production.
                  </p>
                  <div className="flex gap-4">
                    <div className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-white cursor-pointer hover:bg-white/10 transition-all flex items-center gap-2">
                       <MousePointer2 size={12} /> Inspect_CLI
                    </div>
                  </div>
                </div>
                
                <div className="bg-[#050505] rounded-2xl border border-white/[0.05] p-6 font-mono text-[11px] shadow-2xl relative group-hover:border-emerald-500/30 transition-all">
                  <div className="flex gap-1.5 mb-4">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/20" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500/20" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/20" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-emerald-500">$ velora deploy --production</p>
                    <p className="text-[#3f3f46]">Initializing build pipeline...</p>
                    <p className="text-[#3f3f46]">Detected framework: Next.js</p>
                    <p className="text-blue-500">✓ Build completed in 14.2s</p>
                    <p className="text-[#3f3f46]">Uploading artifacts to edge nodes...</p>
                    <p className="text-emerald-500 font-bold">🚀 Project live at: https://project-id.velora.app</p>
                  </div>
                </div>
             </div>
          </FeatureCard>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
