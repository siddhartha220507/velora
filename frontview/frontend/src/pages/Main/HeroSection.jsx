import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import heroBg from '../../assets/mcrft-bg.png'

export default function HeroSection () {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => (prev >= 75 ? 75 : prev + 1))
    }, 50)
    return () => clearInterval(timer)
  }, [])

  return (
    // Changed to items-start to pull content upwards
    <section className='relative min-h-screen bg-[#060606] text-white overflow-hidden flex items-start'>
      {/* Background Image - Set to cover the entire viewport including navbar area */}
      <div
        className='absolute inset-0 z-0 h-full w-full bg-cover bg-no-repeat'
        style={{
          backgroundImage: `url(${heroBg})`,
          // Shifted focal point to the left
          backgroundPosition: 'left 20% center',
          filter: 'brightness(0.8) contrast(1.1)'
        }}
      />

      {/* Overlays - Lightened so the image is clear in the navbar area */}
      <div className='absolute inset-0 z-10 bg-gradient-to-r from-black/50 via-black/10 to-transparent' />
      <div className='absolute inset-0 z-10 bg-gradient-to-t from-black/20 via-transparent to-transparent' />

      <div className='relative z-20 w-full max-w-7xl px-6 lg:px-12 pt-28 lg:pt-36'>
        <div className='grid lg:grid-cols-2 gap-8 items-start'>
          {/* Left Content */}
          <div className='flex flex-col space-y-6 mt-4'>
            <div className='space-y-3'>
              <div className='flex items-center gap-2'>
                <div className='w-3 h-3 bg-[#a3e635] rounded-sm rotate-45' />
                <span className='uppercase tracking-[0.2em] text-[#a3e635] text-[10px] font-bold font-mono'>
                  Modern Deployment Platform
                </span>
              </div>

              <h1
                className='leading-tight uppercase'
                style={{
                  fontFamily: "'Press Start 2P', monospace",
                  fontSize: 'clamp(1.2rem, 3vw, 2.2rem)'
                }}
              >
                Deploy your <br />
                <span className='text-[#a3e635]'>Project</span> <br />
                in seconds
              </h1>

              <p className='text-gray-300 max-w-sm text-sm opacity-90 font-mono'>
                From code to production in minutes. <br />
                Powerful. Simple. Scalable.
              </p>
            </div>

            <div className='flex flex-wrap gap-3'>
              <Link 
                to="/register"
                className='px-5 py-2.5 bg-[#a3e635] text-black font-bold text-xs rounded hover:bg-[#bef264] transition-all font-mono'
              >
                Get Started Free →
              </Link>
              <button className='px-5 py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 transition-all font-bold text-xs rounded font-mono'>
                View Docs
              </button>
            </div>
          </div>

          {/* Right Content - Terminal Box */}
          <div className='relative mt-4 lg:mt-0'>
            <div className='relative bg-[#0d0d0d]/85 backdrop-blur-md border border-white/10 rounded-lg overflow-hidden'>
              <div className='flex items-center gap-1.5 bg-white/5 px-3 py-2 border-b border-white/5'>
                <div className='w-2 h-2 rounded-full bg-[#ff5f57]/50' />
                <div className='w-2 h-2 rounded-full bg-[#febc2e]/50' />
                <div className='w-2 h-2 rounded-full bg-[#28c840]/50' />
              </div>

              <div className='p-6 space-y-6'>
                <p className='text-gray-400 font-mono text-[11px]'>
                  Deploying project...
                </p>
                <div className='grid grid-cols-2 gap-6'>
                  <div className='space-y-3'>
                    {['Build', 'Configure', 'Deploy', 'Live'].map(
                      (step, idx) => (
                        <div key={step} className='flex items-center gap-2'>
                          <div
                            className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                              idx < 3
                                ? 'bg-[#a3e635]/10 border-[#a3e635]/50'
                                : 'border-white/10'
                            }`}
                          >
                            {idx < 3 && (
                              <div className='w-1.5 h-1.5 bg-[#a3e635] rounded-full' />
                            )}
                          </div>
                          <span
                            className={`text-[10px] font-mono ${
                              idx < 3 ? 'text-white' : 'text-gray-600'
                            }`}
                          >
                            {step}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                  <div className='border border-dashed border-white/10 rounded p-4 flex flex-col items-center justify-center text-center'>
                    <Link 
                      to="/dashboard"
                      className='px-2 py-1 bg-[#a3e635]/10 text-[#a3e635] border border-[#a3e635]/20 text-[8px] font-bold rounded uppercase'
                    >
                      Choose Repo
                    </Link>
                  </div>
                </div>
                <div className='h-1 w-full bg-white/5 rounded-full overflow-hidden'>
                  <div
                    className='h-full bg-[#a3e635] transition-all duration-500'
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
