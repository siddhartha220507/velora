import React from 'react'
import sectionBg from '../../assets/m3.jpg'

const steps = [
  {
    number: '1',
    label: 'CONNECT',
    desc: 'Connect your GitHub repository.',
    icon: (
      <svg
        viewBox='0 0 24 24'
        fill='none'
        stroke='currentColor'
        strokeWidth={1.5}
        className='w-8 h-8'
      >
        <path
          strokeLinecap='round'
          strokeLinejoin='round'
          d='M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244'
        />
      </svg>
    )
  },
  {
    number: '2',
    label: 'CONFIGURE',
    desc: 'Set environment variables & prefs.',
    icon: (
      <svg
        viewBox='0 0 24 24'
        fill='none'
        stroke='currentColor'
        strokeWidth={1.5}
        className='w-8 h-8'
      >
        <path
          strokeLinecap='round'
          strokeLinejoin='round'
          d='M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z'
        />
        <path
          strokeLinecap='round'
          strokeLinejoin='round'
          d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
        />
      </svg>
    )
  },
  {
    number: '3',
    label: 'DEPLOY',
    desc: 'We build and deploy your app.',
    icon: (
      <svg
        viewBox='0 0 24 24'
        fill='none'
        stroke='currentColor'
        strokeWidth={1.5}
        className='w-8 h-8'
      >
        <path
          strokeLinecap='round'
          strokeLinejoin='round'
          d='M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z'
        />
      </svg>
    )
  },
  {
    number: '4',
    label: 'LIVE',
    desc: 'Your app is live for the world!',
    icon: (
      <svg
        viewBox='0 0 24 24'
        fill='none'
        stroke='currentColor'
        strokeWidth={1.5}
        className='w-8 h-8'
      >
        <path
          strokeLinecap='round'
          strokeLinejoin='round'
          d='M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418'
        />
      </svg>
    )
  }
]

export default function HowItWorks () {
  return (
    <section className='relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden bg-transparent border-y border-white/5'>
      {/* BACKGROUND IMAGE LAYER - Active and refined */}
      <div
        className='absolute inset-0 z-0 opacity-60 bg-black/40 bg-cover bg-center bg-no-repeat pointer-events-none'
        style={{
          backgroundImage: `url(${sectionBg})`,
          // This ensures it shifts as intended in your Hero request
          backgroundPosition: 'left 25% center'
        }}
      />

      {/* Subtle overlay to ensure cards remain readable against the background image */}
      <div className='absolute inset-0 z-[1] bg-gradient-to-b from-[#060606] via-transparent to-[#060606]' />

      <div className='relative z-10 max-w-6xl mx-auto'>
        {/* Header Section */}
        <div className='text-center mb-16'>
          <span className='text-[#a3e635] text-[10px] uppercase tracking-[0.3em] font-bold block mb-3 font-mono'>
            Workflow
          </span>
          <h2
            className='text-white uppercase leading-tight'
            style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: 'clamp(1rem, 4vw, 1.6rem)'
            }}
          >
            How It Works
          </h2>
          <div className='flex justify-center mt-6'>
            <div className='h-1 w-24 bg-gradient-to-r from-transparent via-[#a3e635] to-transparent opacity-50' />
          </div>
        </div>

        {/* Steps Grid */}
        <div className='flex flex-col lg:flex-row items-stretch gap-4 lg:gap-2'>
          {steps.map((step, idx) => (
            <React.Fragment key={idx}>
              <div className='flex-1 group'>
                <div
                  className='h-full bg-[#111111]/90 backdrop-blur-md border border-white/10 p-8 flex flex-col items-center text-center transition-all duration-500 hover:border-[#a3e635]/40 relative'
                  style={{ borderRadius: '4px' }}
                >
                  {/* Step number floating badge */}
                  <div className='absolute -top-3 left-6 bg-[#a3e635] text-black text-[9px] font-black px-3 py-1 font-mono shadow-[0_0_10px_rgba(163,230,53,0.4)]'>
                    STEP 0{step.number}
                  </div>

                  {/* Icon with glow */}
                  <div className='text-[#a3e635] mb-6 mt-2 group-hover:scale-110 transition-transform duration-500'>
                    <div className='relative'>
                      <div className='absolute inset-0 blur-lg bg-[#a3e635]/20 opacity-0 group-hover:opacity-100 transition-opacity' />
                      {step.icon}
                    </div>
                  </div>

                  {/* Label */}
                  <h3
                    className='text-white mb-4 uppercase tracking-widest text-xs font-bold'
                    style={{ fontFamily: "'Space Mono', monospace" }}
                  >
                    {step.label}
                  </h3>

                  {/* Desc */}
                  <p className='text-gray-500 text-xs leading-relaxed font-mono'>
                    {step.desc}
                  </p>
                </div>
              </div>

              {/* Arrow connector for Desktop */}
              {idx < steps.length - 1 && (
                <div className='hidden lg:flex items-center justify-center self-center px-1'>
                  <svg
                    className='w-5 h-5 text-[#a3e635]/20 animate-pulse'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M13 5l7 7-7 7M5 5l7 7-7 7'
                    />
                  </svg>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  )
}
