'use client'

import { cn } from '@/lib/utils'

interface LogoProps {
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showText?: boolean
}

const sizeMap = {
  sm: { icon: 32, text: 'text-lg' },
  md: { icon: 40, text: 'text-xl' },
  lg: { icon: 48, text: 'text-2xl' },
  xl: { icon: 64, text: 'text-3xl' },
}

export function Logo({ className, size = 'md', showText = true }: LogoProps) {
  const { icon, text } = sizeMap[size]

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {/* Vibrant Logo Icon */}
      <svg
        width={icon}
        height={icon}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-md"
      >
        {/* Magnifying glass outer ring with gradient */}
        <defs>
          <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0EA5E9" />
            <stop offset="50%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#1D4ED8" />
          </linearGradient>
          <linearGradient id="handleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#EF4444" />
          </linearGradient>
          <linearGradient id="bar1Gradient" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#34D399" />
          </linearGradient>
          <linearGradient id="bar2Gradient" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#FBBF24" />
          </linearGradient>
          <linearGradient id="bar3Gradient" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#EF4444" />
            <stop offset="100%" stopColor="#F87171" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="1" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Magnifying glass circle - outer */}
        <circle
          cx="26"
          cy="26"
          r="22"
          stroke="url(#ringGradient)"
          strokeWidth="5"
          fill="white"
          filter="url(#glow)"
        />
        
        {/* Bar chart inside magnifying glass */}
        <rect x="14" y="30" width="7" height="12" rx="1" fill="url(#bar1Gradient)" />
        <rect x="23" y="22" width="7" height="20" rx="1" fill="url(#bar2Gradient)" />
        <rect x="32" y="14" width="7" height="28" rx="1" fill="url(#bar3Gradient)" />
        
        {/* Trend line */}
        <path
          d="M16 35 L26 25 L36 18"
          stroke="#1D4ED8"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        
        {/* Trend arrow */}
        <path
          d="M33 16 L38 16 L38 21"
          stroke="#1D4ED8"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        
        {/* Magnifying glass handle */}
        <rect
          x="42"
          y="42"
          width="18"
          height="8"
          rx="4"
          transform="rotate(45 42 42)"
          fill="url(#handleGradient)"
          filter="url(#glow)"
        />
      </svg>

      {/* Text */}
      {showText && (
        <div className="flex flex-col leading-none">
          <span className={cn('font-bold tracking-tight', text)}>
            <span className="bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 bg-clip-text text-transparent">
              Talent
            </span>
            <span className="bg-gradient-to-r from-amber-500 to-red-500 bg-clip-text text-transparent">
              Track
            </span>
          </span>
          <span className="text-[0.6em] font-semibold tracking-[0.2em] text-blue-600 uppercase">
            ATS
          </span>
        </div>
      )}
    </div>
  )
}
