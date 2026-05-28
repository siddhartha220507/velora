import React from 'react'
import { Link } from 'react-router-dom'
// IMPORTANT: Refer to your local assets folder to ensure these render.
import bee from '../../assets/bee.png'
import creeperImg from '../../assets/how.png' 

export default function ReadyToDeploy() {
  return (
    <section className="bg-transparent py-24 px-4 overflow-hidden relative">
      <div className="max-w-5xl mx-auto relative group">
        
        {/* Left Side Asset */}
        <div className="absolute -left-5 top-[0px] w-48 z-30 pointer-events-none transition-transform group-hover:scale-105 duration-500 hidden md:block">
          <img 
            src={bee} 
            alt="Bee" 
            className="w-full h-auto drop-shadow-[0_20px_40px_rgba(0,0,0,0.6)]" 
          />
        </div>

        {/* Main Banner Box */}
        <div className="relative z-10 border border-[#a3e635]/30 bg-[#0d0d0d] rounded-[12px] p-12 py-16 flex flex-col md:flex-row gap-8 overflow-hidden shadow-2xl">
          
          {/* Subtle Inner Glow */}
          <div className="absolute inset-0 z-0 bg-radial-gradient from-[#a3e635]/5 via-transparent to-transparent opacity-60 pointer-events-none" />

          {/* Combined Text and Button Container */}
          <div className='md:ml-32 flex-1 text-center md:text-left relative z-20'>
            <h2 
              className="text-white text-3xl md:text-4xl font-bold mb-3 tracking-tight leading-tight"
              style={{ fontFamily: "'Space Mono', monospace" }}
            >
              Ready to deploy?
            </h2>
            <p className="text-gray-400 text-sm md:text-base font-mono opacity-90 leading-relaxed mb-8">
              Join thousands of developers shipping faster with Velora.
            </p>

            {/* Shshifted Button Section - Now aligned left under text */}
            <div className='flex flex-wrap gap-4 justify-center md:justify-start'>
              <Link 
                to="/register"
                className="bg-[#a3e635] text-black font-bold text-xs px-10 py-4 rounded-xl hover:bg-[#bef264] transition-all font-mono uppercase shadow-[0_0_15px_rgba(163,230,53,0.3)]"
              >
                Deploy free →
              </Link>
            </div>
          </div>

          {/* Right Side Asset */}
          <div className="absolute right-[-20px] bottom-[-30px] w-48 pointer-events-none transition-transform group-hover:-translate-y-4 duration-500 hidden md:block z-10">
            <img 
              src={creeperImg} 
              alt="Creeper Character" 
              className="w-full h-auto drop-shadow-[0_10px_50px_rgba(0,0,0,0.8)]" 
            />
          </div>
        </div>
      </div>
    </section>
  )
}