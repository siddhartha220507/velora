import React, { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { GitBranch, Settings2, Rocket, ArrowDown } from "lucide-react";

const StepItem = ({ step, index }) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "center center"]
  });

  const scale = useSpring(useTransform(scrollYProgress, [0, 1], [0.8, 1]), { stiffness: 100, damping: 20 });
  const opacity = useTransform(scrollYProgress, [0, 0.5], [0, 1]);
  const rotateX = useTransform(scrollYProgress, [0, 1], [45, 0]);

  return (
    <div ref={ref} className="relative min-h-[60vh] flex items-center justify-center perspective-container">
      <motion.div
        style={{ scale, opacity, rotateX }}
        className="w-full max-w-4xl glass-panel rounded-[40px] p-10 md:p-20 flex flex-col md:grid md:grid-cols-2 gap-16 items-center shadow-2xl preserve-3d"
      >
        <div className="order-2 md:order-1">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-emerald-500 shadow-elevation-1">
              {step.icon}
            </div>
            <div className="text-[11px] font-black uppercase tracking-[0.4em] text-[#3f3f46]">Module_0{step.id}</div>
          </div>
          <h3 className="text-4xl md:text-5xl font-black tracking-tighter uppercase mb-6 leading-none">{step.title}</h3>
          <p className="text-[#71717a] text-lg font-medium leading-relaxed uppercase tracking-tighter mb-10">
            {step.description}
          </p>
          <div className="flex items-center gap-2 text-emerald-500 text-[10px] font-black uppercase tracking-[0.3em]">
             Status: Ready_For_Initialization <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          </div>
        </div>

        <div className="order-1 md:order-2 relative">
           <motion.div 
             animate={{ 
               y: [0, -20, 0],
               rotateY: [0, 10, 0]
             }}
             transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
             className="w-full aspect-square glass-panel rounded-3xl border-emerald-500/20 flex items-center justify-center overflow-hidden shadow-2xl"
           >
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-blue-500/10" />
              <img
                src={step.image}
                alt={step.title}
                className="w-4/5 h-4/5 object-contain filter drop-shadow-[0_20px_50px_rgba(34,197,94,0.3)]"
              />
           </motion.div>
           
           {/* Background Decorations */}
           <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/10 blur-3xl rounded-full" />
           <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-500/10 blur-3xl rounded-full" />
        </div>
      </motion.div>

      {/* Connection Line */}
      {index < 2 && (
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-px h-24 bg-gradient-to-b from-white/10 to-transparent" />
      )}
    </div>
  );
};

const StepsSection = () => {
  const stepsData = [
    {
      id: 1,
      title: "Sync_Registry",
      description: "Connect your GitHub architecture. Velora scans your repository blueprint and identifies optimal deployment parameters.",
      icon: <GitBranch size={24} />,
      image: "/src/assets/st1.png",
    },
    {
      id: 2,
      title: "Define_Build",
      description: "Configure your secure environment payloads. Override infrastructure defaults with granular precision.",
      icon: <Settings2 size={24} />,
      image: "/src/assets/stt2.png",
    },
    {
      id: 3,
      title: "Execute_Uplink",
      description: "Propagate your build across the global edge network. Achieve zero-latency distribution with instant rollback capability.",
      icon: <Rocket size={24} />,
      image: "/src/assets/stt3.png",
    },
  ];

  return (
    <section className="bg-[#09090b] text-white font-sans py-32 px-6 overflow-hidden relative">
      {/* Background Section Header */}
      <div className="sticky top-20 left-0 right-0 z-0 opacity-10 pointer-events-none select-none text-center">
         <h2 className="text-[20vw] font-black tracking-tighter uppercase leading-none text-white/5">PROTOCOLS</h2>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto flex flex-col items-center">
         <div className="mb-32 text-center flex flex-col items-center">
            <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center mb-8 animate-bounce">
               <ArrowDown size={20} className="text-white/50" />
            </div>
            <h2 className="text-6xl md:text-8xl font-black tracking-tighter uppercase mb-6 leading-[0.8]">INITIALIZATION <br /> <span className="text-white/20">WORKFLOW</span></h2>
            <p className="text-emerald-500 font-black uppercase tracking-[0.5em] text-[9px]">Strategic_Sequence_for_Infrastructure_Initialization</p>
         </div>

         <div className="w-full space-y-32">
            {stepsData.map((step, index) => (
              <StepItem key={step.id} step={step} index={index} />
            ))}
         </div>
      </div>
    </section>
  );
};

export default StepsSection;
