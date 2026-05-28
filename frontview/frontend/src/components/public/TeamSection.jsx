import React from 'react';
import { Terminal as TerminalIcon, Cpu } from 'lucide-react';
import { motion } from 'framer-motion';

// IMPORT YOUR TEAM IMAGES HERE
import p1 from "../../assets/p1.jpeg"; // Replace with your actual filenames
import p2 from "../../assets/p2.jpeg";
import p3 from "../../assets/p5.jpeg";

const TeamSection = () => {
  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  const teamMembers = [
    { id: 1, img: p1, name: "Dev 1" },
    { id: 2, img: p2, name: "Dev 2" },
    { id: 3, img: p3, name: "Dev 3" }
  ];

  return (
    <motion.section 
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={containerVariants}
      className="bg-[#080808] py-24 px-6 border-t-8 border-[#111] relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 size-[500px] bg-[#10B981]/5 blur-[120px] -z-10 rounded-full" />

      <div className="container mx-auto flex flex-col lg:flex-row items-center gap-20">
        
        {/* Left Side: Terminal Interface */}
        <motion.div variants={itemVariants} className="flex-1 relative w-full max-w-[450px]">
          <motion.div 
            initial={{ x: -20, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            className="absolute -left-10 top-12 z-30 p-3 bg-[#111] border-2 border-[#10B981] shadow-[6px_6px_0px_0px_#000]"
          >
            <div className="flex items-center gap-2 mb-1">
              <div className="size-2 bg-[#10B981] animate-pulse rounded-full" />
              <span className="text-[8px] text-[#10B981] uppercase font-bold tracking-tighter">1.2K+ CLUSTERS</span>
            </div>
            <p className="text-[6px] text-slate-500 uppercase tracking-widest">Nodes: <span className="text-[#10B981]">Stable</span></p>
          </motion.div>

          <div className="relative z-10 bg-[#000] border-4 border-[#222] shadow-[24px_24px_0px_0px_rgba(16,185,129,0.05)]">
            <div className="bg-[#111] p-5 border-b-2 border-[#222] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="size-9 bg-[#EAB308] flex items-center justify-center border-b-4 border-r-4 border-[#854d0e]">
                  <Cpu size={16} className="text-black" />
                </div>
                <div>
                  <h4 className="text-[9px] text-white uppercase font-bold tracking-tighter">VELORA_V3.EXE</h4>
                  <span className="text-[6px] text-[#10B981] uppercase font-bold tracking-widest">Protocol: Active</span>
                </div>
              </div>
              <TerminalIcon size={14} className="text-slate-700" />
            </div>

            <div className="p-8 space-y-8 relative overflow-hidden bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(16,185,129,0.03),rgba(0,0,0,0),rgba(16,185,129,0.03))] bg-[length:100%_2px,3px_100%]">
              <motion.div variants={itemVariants} className="flex flex-col items-end">
                <div className="bg-[#1A1A1A] p-4 border-2 border-[#10B981]/30 shadow-[4px_4px_0px_0px_#000] max-w-[85%]">
                  <p className="text-[8px] leading-relaxed text-[#10B981] uppercase">
                    &gt; Pipeline check: All nodes responding.
                  </p>
                </div>
                <span className="text-[6px] text-slate-600 mt-2 uppercase">HEALTH: 100%</span>
              </motion.div>

              <motion.div variants={itemVariants} className="flex flex-col items-start">
                <div className="bg-[#EAB308] p-4 border-b-4 border-r-4 border-[#854d0e] max-w-[90%] shadow-[4px_4px_0px_0px_#000]">
                  <p className="text-[8px] leading-relaxed text-black font-bold uppercase">
                    Executing global sync... Secondary green protocols initialized. 
                  </p>
                </div>
                <span className="text-[6px] text-slate-600 mt-2 uppercase tracking-widest text-[#10B981]">SYNC COMPLETE</span>
              </motion.div>
            </div>
          </div>

          <motion.div 
            initial={{ x: 20, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            className="absolute -right-6 bottom-12 z-30 p-4 bg-[#000] border-2 border-[#EAB308] text-[#EAB308] shadow-[6px_6px_0px_0px_#000]"
          >
            <span className="text-[8px] font-bold uppercase">Uptime: 99.999%</span>
          </motion.div>
        </motion.div>

        {/* Right Side: Copy Content */}
        <div className="flex-1 text-center lg:text-left">
          <motion.div variants={itemVariants} className="inline-block px-3 py-1 bg-[#10B981]/10 border border-[#10B981]/30 mb-8">
            <span className="text-[8px] text-[#10B981] font-bold uppercase tracking-[0.3em]">Operational Status</span>
          </motion.div>
          
          <motion.h2 variants={itemVariants} className="text-xl md:text-2xl font-medium uppercase tracking-tighter leading-[1.6] mb-10 text-white">
            Engineered by <span className="text-[#EAB308]">exhausted devs</span>,<br/>
            for even more <span className="text-[#EAB308]">tired humans</span>
          </motion.h2>

          <motion.div variants={itemVariants} className="mb-12">
            <p className="text-[10px] md:text-xs text-slate-500 leading-loose uppercase tracking-[0.15em] font-sans border-l-4 border-[#10B981] pl-8">
              Velora eliminates the friction of modern cloud complexity. 
              We've replaced cluttered dashboards with a streamlined interface for builders who value speed and reliability.
            </p>
          </motion.div>

          {/* Team Roster with Images */}
          <motion.div variants={itemVariants}>
            <h4 className="text-[9px] font-bold uppercase text-slate-600 mb-6 tracking-[0.3em]">THE CORE TEAM</h4>
            <div className="flex items-center justify-center lg:justify-start gap-4">
              {teamMembers.map((member) => (
                <motion.div 
                  key={member.id} 
                  whileHover={{ scale: 1.1, borderColor: "#10B981" }}
                  className="size-14 bg-[#111] border-2 border-[#222] overflow-hidden flex items-center justify-center transition-all cursor-none shadow-[4px_4px_0px_0px_#000]"
                >
                  <img 
                    src={member.img} 
                    alt={member.name} 
                    className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-300"
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

      </div>
    </motion.section>
  );
};

export default TeamSection;