import React from 'react';
import { ClipboardList, UserCheck, Bell, Search, Map, FileText } from 'lucide-react';

const FeaturesGrid = () => {
  const features = [
    {
      title: "Task Management",
      desc: "Easily schedule, prioritize, and organize your tasks for maximum productivity.",
      icon: <ClipboardList size={16} />
    },
    {
      title: "Personalized Assistance",
      desc: "Enjoy a tailored experience as Velora adapts to your preferences and workflow.",
      icon: <UserCheck size={16} />
    },
    {
      title: "Deadline Reminders",
      desc: "Receive timely notifications and reminders to stay on top of important deadlines.",
      icon: <Bell size={16} />
    },
    {
      title: "Smart Search",
      desc: "Quickly find the information you need with Velora's high-speed indexing.",
      icon: <Search size={16} />
    },
    {
      title: "Travel Support",
      desc: "Plan your trips seamlessly by allowing Velora to handle logistics and bookings.",
      icon: <Map size={16} />
    },
    {
      title: "File Management",
      desc: "Organize, store, and retrieve files effortlessly through our deployment panel.",
      icon: <FileText size={16} />
    }
  ];

  return (
    <section className="bg-black py-24 px-6 border-t-4 border-[#1A1A1A]">
      <div className="container mx-auto">
        {/* Section Header */}
        <div className="mb-16 text-center lg:text-left border-l-4 border-[#EAB308] pl-6">
          <h2 className="text-xl md:text-2xl font-bold uppercase tracking-tight leading-relaxed">
            Enjoy the assistance of your<br/>
            <span className="text-[#EAB308]">Portable Business Companion</span>
          </h2>
        </div>

        {/* 2-Row Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div 
              key={i} 
              className="group p-8 border-2 border-[#1A1A1A] bg-[#0A0A0A] hover:border-[#EAB308] transition-all relative overflow-hidden"
            >
              {/* Icon Box */}
              <div className="size-10 bg-[#EAB308] flex items-center justify-center mb-6 border-b-4 border-r-4 border-[#854d0e] text-black">
                {f.icon}
              </div>

              {/* Text Content */}
              <h3 className="text-[10px] font-bold uppercase mb-4 text-white group-hover:text-[#EAB308] transition-colors">
                {f.title}
              </h3>
              <p className="text-[9px] text-slate-500 leading-loose uppercase font-sans tracking-wider">
                {f.desc}
              </p>

              {/* Decorative Corner Pixel */}
              <div className="absolute bottom-0 right-0 size-2 bg-[#1A1A1A] group-hover:bg-[#EAB308] transition-colors" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesGrid;