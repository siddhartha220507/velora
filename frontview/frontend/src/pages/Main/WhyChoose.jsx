import React from 'react'
// IMPORTANT: Use transparent PNGs to avoid black boxes around characters
import skeletonImg from '../../assets/sk.png'
import grassBlockImg from '../../assets/grassbk.png'

const features = [
  {
    icon: (
      <svg viewBox='0 0 24 24' fill='currentColor' className='w-8 h-8'>
        <path d='M13 10V3L4 14H11V21L20 10H13Z' />
      </svg>
    ),
    title: 'Lightning Fast',
    desc: 'Global edge infrastructure for ultra-fast deployments.'
  },
  {
    icon: (
      <svg
        viewBox='0 0 24 24'
        fill='none'
        stroke='currentColor'
        strokeWidth={2}
        className='w-8 h-8'
      >
        <path
          strokeLinecap='round'
          strokeLinejoin='round'
          d='M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z'
        />
      </svg>
    ),
    title: 'Secure by Default',
    desc: 'Enterprise-grade security out of the box.'
  },
  {
    icon: (
      <svg
        viewBox='0 0 24 24'
        fill='none'
        stroke='currentColor'
        strokeWidth={2}
        className='w-8 h-8'
      >
        <path
          strokeLinecap='round'
          strokeLinejoin='round'
          d='M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9'
        />
      </svg>
    ),
    title: 'Scalable',
    desc: 'Auto-scale your apps to handle any traffic.'
  },
  {
    // FIXED: Removed extra [ and fixed the strokeWidth={2} syntax
    icon: (
      <svg
        viewBox='0 0 24 24'
        fill='none'
        stroke='currentColor'
        strokeWidth={2}
        className='w-8 h-8'
      >
        <path
          strokeLinecap='round'
          strokeLinejoin='round'
          d='M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5'
        />
      </svg>
    ),
    title: 'Developer First',
    desc: 'Built for developers, by developers.'
  }
]

export default function WhyChoose () {
  return (
    <section className='relative bg-[#060606e2] py-32 px-4 overflow-hidden'>
      {/* 1. Left side: Skeleton */}
      <div className='absolute left-[-2%] top-[30%] -translate-y-1/2 w-56 pointer-events-none hidden lg:block z-0 opacity-80'>
        <img
          src={skeletonImg}
          alt='Skeleton'
          className='w-full h-auto object-contain'
        />
      </div>

      {/* 2. Right side: Grass Block */}
      <div className='absolute right-[3%] top-[26%] -translate-y-1/2 w-46 pointer-events-none hidden lg:block z-0 opacity-100'>
        <img
          src={grassBlockImg}
          alt='Minecraft Block'
          className='w-full h-auto object-contain '
        />
      </div>

      <div className='max-w-5xl mx-auto relative z-10'>
        {/* Section Header */}
        <div className='text-center mb-20'>
          <span
            className='text-[#a3e635] text-[10px] uppercase tracking-[0.3em] font-bold block mb-3'
            style={{ fontFamily: "'Space Mono', monospace" }}
          >
            Why Velora?
          </span>
          <h2 className='text-white text-2xl md:text-xl font-bold tracking-tight px-30'>
            Everything you need to deploy with confidence
          </h2>
        </div>

        {/* Horizontal Line */}
        <div className='absolute top-[64%] left-0 w-4xl h-[1px] bg-[#a3e635]/30 hidden lg:block z-0' />

        {/* Cards grid */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10'>
          {features.map((f, idx) => (
            <div
              key={idx}
              className='bg-[#0a0a0a]/90 backdrop-blur-sm border border-white/10 rounded-2xl p-10 flex flex-col items-center text-center transition-all duration-300 hover:border-[#a3e635]/50 group hover:-translate-y-2'
            >
              {/* Icon Container */}
              <div className='text-[#a3e635] mb-12 transform group-hover:scale-110 transition-transform duration-300'>
                {f.icon}
              </div>

              {/* Title */}
              <h3 className='text-white font-bold text-sm mb-4 uppercase tracking-wider'>
                {f.title}
              </h3>

              {/* Description */}
              <p
                className='text-gray-500 text-[11px] leading-relaxed font-medium px-2'
                style={{ fontFamily: "'Space Mono', monospace" }}
              >
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
