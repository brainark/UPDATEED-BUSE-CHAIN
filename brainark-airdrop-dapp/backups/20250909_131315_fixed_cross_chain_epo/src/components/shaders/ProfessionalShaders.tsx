// src/components/shaders/ProfessionalShaders.tsx
// ALTERNATIVE SOLUTION: Pure CSS + Canvas-based shaders that will definitely work
import React, { useState, useEffect, useRef, useMemo } from 'react'

// Custom hook for performance settings
export function useShaderSettings() {
  const [settings, setSettings] = useState({
    enabled: true,
    quality: 'high' as 'low' | 'medium' | 'high',
    reducedMotion: false,
    isMobile: false,
    isVisible: true,
    performanceMode: false
  })

  useEffect(() => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                    window.innerWidth < 768
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const deviceMemory = (navigator as any).deviceMemory
    const hardwareConcurrency = (navigator as any).hardwareConcurrency
    const isLowPower = (deviceMemory && deviceMemory < 4) || 
                      (hardwareConcurrency && hardwareConcurrency < 4) || 
                      isMobile

    let quality: 'low' | 'medium' | 'high' = 'high'
    if (isMobile || isLowPower) quality = 'medium'
    if (isMobile && isLowPower) quality = 'low'

    setSettings(prev => ({
      ...prev,
      isMobile,
      reducedMotion,
      quality,
      performanceMode: isLowPower
    }))

    const handleVisibilityChange = () => {
      setSettings(prev => ({ ...prev, isVisible: !document.hidden }))
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [])

  return settings
}

// Professional CSS-based mesh gradient
export const CSSMeshGradient: React.FC<{
  colors: string[]
  speed?: number
  className?: string
  opacity?: number
}> = ({ colors, speed = 0.02, className = "", opacity = 1 }) => {
  const settings = useShaderSettings()
  
  const animationDuration = settings.reducedMotion ? 0 : Math.max(10, 50 / (speed * 100))
  
  return (
    <div className={`absolute inset-0 ${className}`} style={{ opacity }}>
      <div 
        className="absolute inset-0 mesh-gradient"
        style={{
          background: `
            radial-gradient(circle at 20% 80%, ${colors[0]}40 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, ${colors[1]}40 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, ${colors[2] || colors[0]}30 0%, transparent 50%),
            radial-gradient(circle at 60% 80%, ${colors[3] || colors[1]}30 0%, transparent 50%),
            radial-gradient(circle at 90% 60%, ${colors[0]}20 0%, transparent 50%)
          `,
          animationDuration: `${animationDuration}s`,
          animationTimingFunction: 'ease-in-out',
          animationIterationCount: 'infinite',
          animationPlayState: settings.reducedMotion ? 'paused' : 'running'
        }}
      />
      
      <style jsx>{`
        @keyframes mesh-gradient {
          0%, 100% {
            background: 
              radial-gradient(circle at 20% 80%, ${colors[0]}40 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, ${colors[1]}40 0%, transparent 50%),
              radial-gradient(circle at 40% 40%, ${colors[2] || colors[0]}30 0%, transparent 50%),
              radial-gradient(circle at 60% 80%, ${colors[3] || colors[1]}30 0%, transparent 50%),
              radial-gradient(circle at 90% 60%, ${colors[0]}20 0%, transparent 50%);
          }
          25% {
            background:
              radial-gradient(circle at 25% 75%, ${colors[1]}40 0%, transparent 50%),
              radial-gradient(circle at 85% 25%, ${colors[2] || colors[0]}40 0%, transparent 50%),
              radial-gradient(circle at 45% 45%, ${colors[3] || colors[1]}30 0%, transparent 50%),
              radial-gradient(circle at 55% 85%, ${colors[0]}30 0%, transparent 50%),
              radial-gradient(circle at 85% 65%, ${colors[1]}20 0%, transparent 50%);
          }
          50% {
            background:
              radial-gradient(circle at 30% 70%, ${colors[2] || colors[0]}40 0%, transparent 50%),
              radial-gradient(circle at 70% 30%, ${colors[3] || colors[1]}40 0%, transparent 50%),
              radial-gradient(circle at 50% 50%, ${colors[0]}30 0%, transparent 50%),
              radial-gradient(circle at 50% 90%, ${colors[1]}30 0%, transparent 50%),
              radial-gradient(circle at 80% 70%, ${colors[2] || colors[0]}20 0%, transparent 50%);
          }
          75% {
            background:
              radial-gradient(circle at 35% 65%, ${colors[3] || colors[1]}40 0%, transparent 50%),
              radial-gradient(circle at 75% 35%, ${colors[0]}40 0%, transparent 50%),
              radial-gradient(circle at 35% 55%, ${colors[1]}30 0%, transparent 50%),
              radial-gradient(circle at 65% 75%, ${colors[2] || colors[0]}30 0%, transparent 50%),
              radial-gradient(circle at 75% 75%, ${colors[3] || colors[1]}20 0%, transparent 50%);
          }
        }
        .mesh-gradient {
          animation-name: mesh-gradient;
        }
      `}</style>
    </div>
  )
}

// Floating particles effect
export const FloatingParticles: React.FC<{
  count?: number
  speed?: number
  color?: string
  opacity?: number
  className?: string
}> = ({ count = 50, speed = 1, color = "#ffffff", opacity = 0.1, className = "" }) => {
  const settings = useShaderSettings()
  
  const particles = useMemo(() => {
    return Array.from({ length: settings.isMobile ? Math.min(count, 30) : count }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: 1 + Math.random() * 3,
      animationDelay: Math.random() * 20,
      animationDuration: 15 + Math.random() * 15,
      direction: Math.random() > 0.5 ? 1 : -1
    }))
  }, [count, settings.isMobile])

  if (settings.reducedMotion) return null

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute rounded-full animate-float-particle"
          style={{
            left: `${particle.left}%`,
            top: `${particle.top}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: color,
            opacity: opacity,
            animationDelay: `${particle.animationDelay}s`,
            animationDuration: `${particle.animationDuration / speed}s`,
            transform: `scale(${0.5 + Math.random() * 0.5})`
          }}
        />
      ))}
      <style jsx>{`
        @keyframes float-particle {
          0% { 
            transform: translateY(0) translateX(0) rotate(0deg); 
            opacity: 0;
          }
          10% { opacity: ${opacity}; }
          90% { opacity: ${opacity}; }
          100% { 
            transform: translateY(-100vh) translateX(${Math.random() * 200 - 100}px) rotate(360deg); 
            opacity: 0;
          }
        }
        .animate-float-particle {
          animation: float-particle linear infinite;
        }
      `}</style>
    </div>
  )
}

// Wave-like motion effect
export const WaveMotion: React.FC<{
  colors: string[]
  speed?: number
  opacity?: number
  className?: string
}> = ({ colors, speed = 0.02, opacity = 0.3, className = "" }) => {
  const settings = useShaderSettings()
  const animationDuration = settings.reducedMotion ? 0 : Math.max(8, 30 / (speed * 100))

  return (
    <div className={`absolute inset-0 ${className}`}>
      {colors.map((color, index) => (
        <div
          key={index}
          className="absolute inset-0 wave-motion"
          style={{
            background: `radial-gradient(ellipse 150% 100% at 50% ${100 + index * 20}%, transparent 30%, ${color}${Math.floor(opacity * 100)} 60%, transparent 90%)`,
            animationDelay: `${index * 2}s`,
            animationDuration: `${animationDuration}s`,
            animationPlayState: settings.reducedMotion ? 'paused' : 'running'
          }}
        />
      ))}
      <style jsx>{`
        @keyframes wave-motion {
          0%, 100% { 
            transform: translateX(0) translateY(0) scale(1);
            filter: hue-rotate(0deg);
          }
          25% { 
            transform: translateX(-5%) translateY(-3%) scale(1.05);
            filter: hue-rotate(10deg);
          }
          50% { 
            transform: translateX(5%) translateY(-5%) scale(0.95);
            filter: hue-rotate(20deg);
          }
          75% { 
            transform: translateX(-2%) translateY(-2%) scale(1.02);
            filter: hue-rotate(5deg);
          }
        }
        .wave-motion {
          animation-name: wave-motion;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
        }
      `}</style>
    </div>
  )
}

// Fluid-like organic motion
export const FluidMotion: React.FC<{
  colors: string[]
  speed?: number
  opacity?: number
  className?: string
}> = ({ colors, speed = 0.02, opacity = 0.2, className = "" }) => {
  const settings = useShaderSettings()
  const animationDuration = settings.reducedMotion ? 0 : Math.max(12, 40 / (speed * 100))

  return (
    <div className={`absolute inset-0 ${className}`}>
      {colors.map((color, index) => (
        <div
          key={index}
          className="absolute inset-0 fluid-motion"
          style={{
            background: `radial-gradient(circle at ${30 + index * 15}% ${40 + index * 10}%, ${color}${Math.floor(opacity * 255).toString(16).padStart(2, '0')} 0%, transparent 60%)`,
            animationDelay: `${index * 1.8}s`,
            animationDuration: `${animationDuration}s`,
            animationPlayState: settings.reducedMotion ? 'paused' : 'running'
          }}
        />
      ))}
      <style jsx>{`
        @keyframes fluid-motion {
          0% { 
            transform: scale(1) rotate(0deg) translate(0, 0);
            border-radius: 50% 40% 60% 30%;
          }
          25% { 
            transform: scale(1.1) rotate(5deg) translate(2%, -2%);
            border-radius: 40% 60% 30% 70%;
          }
          50% { 
            transform: scale(0.9) rotate(-3deg) translate(-2%, 3%);
            border-radius: 60% 30% 70% 40%;
          }
          75% { 
            transform: scale(1.05) rotate(2deg) translate(1%, -1%);
            border-radius: 30% 70% 40% 60%;
          }
          100% { 
            transform: scale(1) rotate(0deg) translate(0, 0);
            border-radius: 50% 40% 60% 30%;
          }
        }
        .fluid-motion {
          animation-name: fluid-motion;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
        }
      `}</style>
    </div>
  )
}

// Professional shader configurations
export const shaderConfigs = {
  hero: {
    high: {
      colors: ['#6366f1', '#8b5cf6', '#3b82f6', '#06b6d4', '#10b981'],
      speed: 0.02,
      opacity: 1,
      particles: true
    },
    medium: {
      colors: ['#6366f1', '#8b5cf6', '#3b82f6'],
      speed: 0.015,
      opacity: 0.8,
      particles: false
    },
    low: {
      colors: ['#6366f1', '#3b82f6'],
      speed: 0.01,
      opacity: 0.6,
      particles: false
    }
  },
  airdrop: {
    high: {
      colors: ['#059669', '#10b981', '#34d399', '#6ee7b7'],
      speed: 0.025,
      opacity: 0.4
    },
    medium: {
      colors: ['#059669', '#10b981', '#34d399'],
      speed: 0.02,
      opacity: 0.3
    },
    low: {
      colors: ['#059669', '#10b981'],
      speed: 0.015,
      opacity: 0.2
    }
  },
  epo: {
    high: {
      colors: ['#000000', '#1e3a8a', '#3b82f6', '#60a5fa'],
      speed: 0.03,
      opacity: 0.35
    },
    medium: {
      colors: ['#000000', '#1e3a8a', '#3b82f6'],
      speed: 0.025,
      opacity: 0.25
    },
    low: {
      colors: ['#000000', '#1e3a8a'],
      speed: 0.02,
      opacity: 0.2
    }
  },
  explorer: {
    high: {
      colors: ['#7c3aed', '#a855f7', '#c084fc', '#ddd6fe'],
      speed: 0.02,
      opacity: 0.3
    },
    medium: {
      colors: ['#7c3aed', '#a855f7', '#c084fc'],
      speed: 0.015,
      opacity: 0.25
    },
    low: {
      colors: ['#7c3aed', '#a855f7'],
      speed: 0.01,
      opacity: 0.2
    }
  }
}

// Main shader background components
export const HeroShaderBackground: React.FC<{ className?: string }> = ({ className = "" }) => {
  const settings = useShaderSettings()
  const config = shaderConfigs.hero[settings.quality]

  if (!settings.enabled || !settings.isVisible) {
    return <div className={`absolute inset-0 bg-gradient-to-br from-gray-900 to-black ${className}`} />
  }

  return (
    <div className={`absolute inset-0 ${className}`}>
      <CSSMeshGradient
        colors={config.colors}
        speed={config.speed}
        opacity={config.opacity}
      />
      {config.particles && settings.quality === 'high' && (
        <FloatingParticles
          count={settings.isMobile ? 30 : 60}
          speed={0.5}
          color="#ffffff"
          opacity={0.1}
        />
      )}
    </div>
  )
}

export const AirdropShaderBackground: React.FC<{ className?: string }> = ({ className = "" }) => {
  const settings = useShaderSettings()
  const config = shaderConfigs.airdrop[settings.quality]

  return (
    <div className={`absolute inset-0 ${className}`}>
      <CSSMeshGradient
        colors={config.colors}
        speed={config.speed}
        opacity={config.opacity}
      />
    </div>
  )
}

export const EPOShaderBackground: React.FC<{ className?: string }> = ({ className = "" }) => {
  const settings = useShaderSettings()
  const config = shaderConfigs.epo[settings.quality]

  return (
    <div className={`absolute inset-0 ${className}`}>
      <CSSMeshGradient
        colors={config.colors}
        speed={config.speed}
        opacity={config.opacity * 0.7}
      />
      <WaveMotion
        colors={config.colors}
        speed={config.speed}
        opacity={config.opacity * 0.5}
      />
    </div>
  )
}

export const ExplorerShaderBackground: React.FC<{ className?: string }> = ({ className = "" }) => {
  const settings = useShaderSettings()
  const config = shaderConfigs.explorer[settings.quality]

  return (
    <div className={`absolute inset-0 ${className}`}>
      <CSSMeshGradient
        colors={config.colors}
        speed={config.speed}
        opacity={config.opacity * 0.6}
      />
      <FluidMotion
        colors={config.colors}
        speed={config.speed}
        opacity={config.opacity * 0.8}
      />
    </div>
  )
}

// Interactive Button with Shader Effects
export const ShaderButton: React.FC<{
  children: React.ReactNode
  onClick?: () => void
  variant?: 'primary' | 'airdrop' | 'epo' | 'explorer'
  className?: string
  disabled?: boolean
}> = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  className = "", 
  disabled = false 
}) => {
  const [isHovered, setIsHovered] = useState(false)
  const settings = useShaderSettings()

  const variantConfigs = {
    primary: { colors: ['#6366f1', '#8b5cf6'], baseClass: 'bg-indigo-600 hover:bg-indigo-700' },
    airdrop: { colors: ['#059669', '#10b981'], baseClass: 'bg-green-600 hover:bg-green-700' },
    epo: { colors: ['#dc2626', '#ef4444'], baseClass: 'bg-red-600 hover:bg-red-700' },
    explorer: { colors: ['#7c3aed', '#a855f7'], baseClass: 'bg-purple-600 hover:bg-purple-700' }
  }

  const config = variantConfigs[variant]

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        relative overflow-hidden px-6 py-3 rounded-lg font-semibold text-white 
        transition-all duration-300 transform hover:scale-105 disabled:opacity-50 
        disabled:cursor-not-allowed shadow-lg hover:shadow-xl
        ${config.baseClass} ${className}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Enhanced hover effect */}
      {isHovered && settings.quality !== 'low' && !settings.reducedMotion && (
        <div className="absolute inset-0">
          <CSSMeshGradient
            colors={config.colors}
            speed={0.05}
            opacity={0.4}
          />
        </div>
      )}
      
      {/* Subtle glow effect */}
      <div 
        className="absolute inset-0 rounded-lg transition-opacity duration-300"
        style={{
          background: `linear-gradient(45deg, ${config.colors[0]}20, ${config.colors[1]}20)`,
          opacity: isHovered ? 1 : 0
        }}
      />
      
      <span className="relative z-10">{children}</span>
    </button>
  )
}

// Navigation Shader Backdrop
export const NavigationShader: React.FC<{ className?: string }> = ({ className = "" }) => {
  const settings = useShaderSettings()

  return (
    <div className={`absolute inset-0 ${className}`}>
      <CSSMeshGradient
        colors={['#1f2937', '#374151', '#4b5563']}
        speed={0.01}
        opacity={0.5}
      />
    </div>
  )
}
