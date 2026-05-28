import React from 'react';
import { motion } from 'framer-motion';

const VeloraLoader = () => {
  // Simplest 'V' grid
  const vShape = [
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [0, 1, 0, 1, 0],
    [0, 1, 0, 1, 0],
    [0, 0, 1, 0, 0],
  ];

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0a0a0a]">
      <div className="relative">
        {/* Minimal Grid for 'V' */}
        <div className="grid grid-cols-5 gap-1 relative">
          {vShape.map((row, rowIndex) =>
            row.map((cell, colIndex) => (
              <div key={`${rowIndex}-${colIndex}`} className="w-3.5 h-3.5">
                {cell === 1 && (
                  <motion.div
                    animate={{ 
                      opacity: [0.3, 1, 0.3],
                      scale: [0.95, 1, 0.95]
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      delay: (rowIndex * 0.1) + (colIndex * 0.05),
                      ease: "easeInOut"
                    }}
                    className="w-full h-full rounded-[2px] bg-[#22c55e] shadow-[0_0_8px_rgba(34,197,94,0.3)]"
                  />
                )}
              </div>
            ))
          )}
        </div>

        {/* Minimal Text Reveal */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-10 text-center"
        >
          <span className="text-[10px] font-black text-white/60 uppercase tracking-[1em] ml-[1em]">Velora</span>
        </motion.div>
      </div>
    </div>
  );
};

export default VeloraLoader;
