import React from "react";
import val from "../assets/val.png";

// Railway-inspired data structure
const projects = [
  { id: 1, name: "Auth-Service", type: "Web Service", status: "Active", cpu: "0.12", ram: "128MB" },
  { id: 2, name: "Postgres-DB", type: "Database", status: "Healthy", cpu: "0.05", ram: "256MB" },
  { id: 3, name: "Redis-Cache", type: "Plugin", status: "Healthy", cpu: "0.02", ram: "64MB" },
];

export default function Demo() {
  return (
    <div className="min-h-screen bg-[#0d0d0d] text-[#e0e0e0] font-['Press_Start_2P',cursive] selection:bg-yellow-500/30">
      
      {/* --- RAILWAY X MINECRAFT NAV --- */}
      <nav className="border-b-4 border-[#333] px-8 py-4 flex justify-between items-center bg-[#1a1a1a] sticky top-0 z-50">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#555] border-b-4 border-black flex items-center justify-center">
              <span className="text-white text-lg">🛤️</span>
            </div>
            <span className="text-sm font-bold tracking-tighter">VELORA.IO</span>
          </div>
        </div>
        <div className="flex gap-4 items-center">
          <button className="text-[8px] text-gray-400 uppercase hover:text-white transition-all">Log In</button>
          <button className="bg-[#3c8527] text-white px-4 py-2 text-[8px] border-b-4 border-[#1e4613] hover:bg-[#47a02e] active:border-b-0 active:translate-y-1 transition-all">
            DASHBOARD
          </button>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="relative py-20 px-6 border-b-4 border-[#222]">
        <div className="absolute inset-0 opacity-10 grayscale pointer-events-none" style={{ backgroundImage: `url(${val})`, backgroundSize: "cover" }} />
        
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-8 leading-relaxed">
            The Infrastructure <br/>
            <span className="text-[#f1e05a]">Platform</span> for <br/>
            Block Builders.
          </h1>
          <p className="text-[10px] text-gray-500 max-w-2xl mx-auto mb-10 leading-loose">
            Deploy in chunks. Provision databases in bits. <br/> Scale like a voxel world.
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            <button className="bg-white text-black px-6 py-4 text-[10px] border-b-4 border-gray-400 hover:shadow-none active:translate-y-1 transition-all">
              PROVISION NEW PROJECT
            </button>
            <button className="bg-[#1a1a1a] border-2 border-white/20 text-white px-6 py-4 text-[10px] border-b-4 border-black active:translate-y-1 transition-all">
              INSTALL CLI
            </button>
          </div>
        </div>
      </section>

      {/* --- RAILWAY CANVAS SECTION (New) --- */}
      <section className="max-w-[1200px] mx-auto px-6 py-16">
        <div className="flex items-center gap-4 mb-10">
          <div className="w-3 h-3 bg-red-500 animate-pulse"></div>
          <h2 className="text-xs uppercase tracking-widest text-gray-400">Live Infrastructure Canvas</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((proj) => (
            <div key={proj.id} className="bg-[#161b22] border-4 border-[#333] p-6 hover:border-[#f1e05a] transition-all group">
              <div className="flex justify-between items-start mb-6">
                <div className={`w-8 h-8 ${proj.type === 'Database' ? 'bg-blue-900' : 'bg-green-900'} border-b-4 border-black`}></div>
                <span className="text-[8px] text-green-500 uppercase">{proj.status}</span>
              </div>
              <h3 className="text-[10px] mb-2">{proj.name}</h3>
              <p className="text-[8px] text-gray-500 mb-4">{proj.type}</p>
              
              <div className="border-t-2 border-[#222] pt-4 flex justify-between">
                <div className="text-[7px] text-gray-400">
                  CPU: <span className="text-white">{proj.cpu}</span>
                </div>
                <div className="text-[7px] text-gray-400">
                  RAM: <span className="text-white">{proj.ram}</span>
                </div>
              </div>
            </div>
          ))}

          {/* ADD NEW BLOCK (Railway Logic) */}
          <div className="border-4 border-dashed border-[#333] p-6 flex flex-col items-center justify-center opacity-50 hover:opacity-100 hover:border-[#f1e05a] cursor-pointer transition-all">
            <span className="text-2xl mb-4">+</span>
            <span className="text-[8px] uppercase tracking-tighter">New Service</span>
          </div>
        </div>
      </section>

      {/* --- ENV VARIABLES SECTION (Railway Logic) --- */}
      <section className="max-w-[1200px] mx-auto px-6 py-16 bg-[#111] border-4 border-[#222] mb-20">
        <div className="mb-8">
          <h2 className="text-xs text-[#f1e05a] mb-2">Variables Editor</h2>
          <p className="text-[8px] text-gray-500">Project-wide environment configuration</p>
        </div>

        <div className="space-y-4">
          {[
            { key: "PORT", value: "3000" },
            { key: "DB_URL", value: "postgres://admin:****@velora:5432" },
            { key: "API_KEY", value: "sk_test_51Mz..." }
          ].map((env) => (
            <div key={env.key} className="flex gap-4 items-center bg-black/40 p-4 border-l-4 border-yellow-600">
              <span className="text-[8px] text-gray-400 min-w-[100px]">{env.key}</span>
              <span className="text-[8px] text-white flex-1 font-mono">{env.value}</span>
              <button className="text-[8px] text-red-800 hover:text-red-500 transition-colors">REMOVE</button>
            </div>
          ))}
        </div>
      </section>

      {/* --- MINECRAFT FOOTER --- */}
      <footer className="bg-[#1a1a1a] border-t-8 border-black py-16 px-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="text-[8px] text-gray-600 mb-6 md:mb-0">
            [v3.0.0] VELORA MINING CORP. ALL RIGHTS RESERVED.
          </div>
          <div className="flex gap-6">
             <div className="w-8 h-8 bg-[#333] flex items-center justify-center hover:bg-[#f1e05a] transition-all cursor-pointer">
                <span className="text-xs">👾</span>
             </div>
             <div className="w-8 h-8 bg-[#333] flex items-center justify-center hover:bg-[#f1e05a] transition-all cursor-pointer">
                <span className="text-xs">📂</span>
             </div>
          </div>
        </div>
      </footer>
    </div>
  );
}