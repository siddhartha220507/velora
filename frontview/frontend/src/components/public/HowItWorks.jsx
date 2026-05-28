import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Settings, Database, Rocket } from "lucide-react";

const HowItWorks = () => {
  const [currentStep, setCurrentStep] = useState(1);

  const steps = [
    {
      id: 1,
      title: "Select your repo",
      desc: "Connect your GitHub or GitLab account to Velora. Choose the repository you want to deploy and configure your basic project settings.",
      icon: (
        <Settings
          className="text-[#EAB308] size-10 animate-spin-slow"
          style={{ animationDuration: "8s" }}
        />
      ),
    },
    {
      id: 2,
      title: "Set up env variables",
      desc: "Securely add your environment variables and secrets. Velora encrypts your keys to ensure your production environment stays protected.",
      icon: <Database className="text-[#EAB308] size-10" />,
    },
    {
      id: 3,
      title: "Deploy is done",
      desc: "Your application is now live on the global edge. Scale infrastructure effortlessly and monitor your performance in real-time.",
      icon: <Rocket className="text-[#EAB308] size-10 animate-bounce" />,
    },
  ];

  const handleNext = () => {
    setCurrentStep((prev) => (prev < 3 ? prev + 1 : 1));
  };

  const activeData = steps.find((s) => s.id === currentStep);

  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      className="bg-[#080808] py-16 px-6 border-t-4 border-[#111] relative overflow-hidden"
    >
      {/* Secondary Green Glow */}
      <div className="absolute bottom-0 left-0 size-80 bg-[#10B981]/5 blur-[100px] -z-10 rounded-full" />

      <div className="container mx-auto max-w-5xl">
        {/* Section Title - Smaller Font Size */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          className="mb-10 border-l-4 border-[#10B981] pl-6"
        >
          <h2 className="text-sm md:text-lg font-bold uppercase tracking-tight leading-relaxed text-white">
            Discover how <span className="text-[#EAB308]">Deploy</span> works
            <br />
            in <span className="text-[#EAB308]">three</span> simple steps
          </h2>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-8 items-stretch">
          {/* Step Card - Left Side */}
          <motion.div
            key={`text-${currentStep}`}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex-1 p-8 border-4 border-[#1A1A1A] bg-[#0A0A0A] relative flex flex-col justify-between min-h-[300px] shadow-[8px_8px_0px_0px_#000]"
          >
            <div>
              <span className="text-[#10B981] text-[10px] font-bold uppercase block mb-4 tracking-[0.2em]">
                Step 0{activeData.id}
              </span>
              <h3 className="text-[11px] font-bold uppercase mb-6 leading-normal text-white">
                {activeData.title}
              </h3>
              <p className="text-[9px] text-slate-500 leading-loose uppercase font-sans tracking-widest min-h-[70px]">
                {activeData.desc}
              </p>
            </div>

            <div className="mt-6">
              <button
                onClick={handleNext}
                className="group flex items-center gap-3 bg-[#EAB308] text-black px-5 py-3 border-b-4 border-r-4 border-[#854d0e] active:translate-y-1 active:border-0 transition-all"
              >
                <span className="text-[9px] font-bold uppercase">
                  {currentStep === 3 ? "Restart" : "Next Step"}
                </span>
                <ChevronRight
                  size={14}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </button>
            </div>

            <div className="absolute top-0 right-0 size-3 bg-[#1A1A1A]" />
          </motion.div>

          {/* Visual Panel - Right Side */}
          <motion.div className="flex-1 bg-[#0D0D0D] border-4 border-[#1A1A1A] relative overflow-hidden flex items-center justify-center p-8 min-h-[300px]">
            <div className="absolute inset-0 bg-gradient-to-tr from-[#10B981]/5 to-transparent" />

            <AnimatePresence mode="wait">
              <motion.div
                key={`visual-${currentStep}`}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 1.1, opacity: 0 }}
                className="relative w-full max-w-[200px] aspect-[4/5] bg-black border-4 border-[#1A1A1A] shadow-[10px_10px_0px_0px_#000] flex flex-col p-4 z-10"
              >
                <div className="w-8 h-1 bg-[#1A1A1A] mx-auto mb-4 rounded-full" />

                <div className="flex-1 border-2 border-dashed border-[#222] flex flex-col items-center justify-center p-4 text-center">
                  {activeData.icon}
                  <div className="w-full h-1 bg-[#1A1A1A] mt-6" />
                  <div className="w-1/2 h-1 bg-[#10B981]/30 mt-2" />
                </div>

                {/* Pixel Progress Dots */}
                <div className="flex justify-center gap-2 mt-4">
                  {[1, 2, 3].map((dot) => (
                    <motion.div
                      key={dot}
                      animate={{
                        backgroundColor:
                          currentStep >= dot ? "#EAB308" : "#1A1A1A",
                        scale: currentStep === dot ? 1.2 : 1,
                      }}
                      className="size-2 border border-[#000]"
                    />
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/pixel-weave.png')]" />
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
};

export default HowItWorks;
