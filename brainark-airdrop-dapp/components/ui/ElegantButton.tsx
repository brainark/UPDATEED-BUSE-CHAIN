import React from 'react'
import { motion, HTMLMotionProps } from 'framer-motion'

interface ElegantButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  children: React.ReactNode
  variant?: 'brazil' | 'gold' | 'emerald' | 'royal' | 'sunset' | 'ocean' | 'ghost' | 'neon'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  loading?: boolean
  disabled?: boolean
  fullWidth?: boolean
  glow?: boolean
  shimmer?: boolean
}

const variants = {
  brazil: 'bg-gradient-to-r from-yellow-400 via-green-500 to-blue-600 hover:from-yellow-300 hover:via-green-400 hover:to-blue-500 text-white',
  gold: 'bg-gradient-to-r from-amber-400 via-yellow-500 to-orange-500 hover:from-amber-300 hover:via-yellow-400 hover:to-orange-400 text-black',
  emerald: 'bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:via-teal-400 hover:to-cyan-400 text-white',
  royal: 'bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-700 hover:from-purple-500 hover:via-blue-500 hover:to-indigo-600 text-white',
  sunset: 'bg-gradient-to-r from-pink-500 via-orange-500 to-red-500 hover:from-pink-400 hover:via-orange-400 hover:to-red-400 text-white',
  ocean: 'bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 hover:from-cyan-400 hover:via-blue-400 hover:to-indigo-500 text-white',
  ghost: 'bg-transparent border-2 border-gray-600 hover:border-yellow-500 text-gray-300 hover:text-white hover:bg-yellow-500/20 backdrop-blur-sm',
  neon: 'bg-gradient-to-r from-lime-400 via-green-500 to-emerald-600 hover:from-lime-300 hover:via-green-400 hover:to-emerald-500 text-black shadow-[0_0_40px_rgba(132,204,22,0.6)]'
}

const sizes = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
  xl: 'px-10 py-5 text-xl font-bold'
}

const glowEffects = {
  brazil: 'shadow-[0_0_30px_rgba(255,215,0,0.4)] hover:shadow-[0_0_50px_rgba(255,215,0,0.8)]',
  gold: 'shadow-[0_0_30px_rgba(245,158,11,0.4)] hover:shadow-[0_0_50px_rgba(245,158,11,0.8)]',
  emerald: 'shadow-[0_0_30px_rgba(16,185,129,0.4)] hover:shadow-[0_0_50px_rgba(16,185,129,0.8)]',
  royal: 'shadow-[0_0_30px_rgba(79,70,229,0.4)] hover:shadow-[0_0_50px_rgba(79,70,229,0.8)]',
  sunset: 'shadow-[0_0_30px_rgba(236,72,153,0.4)] hover:shadow-[0_0_50px_rgba(236,72,153,0.8)]',
  ocean: 'shadow-[0_0_30px_rgba(59,130,246,0.4)] hover:shadow-[0_0_50px_rgba(59,130,246,0.8)]',
  ghost: 'shadow-[0_0_30px_rgba(255,215,0,0.3)] hover:shadow-[0_0_50px_rgba(255,215,0,0.6)]',
  neon: 'shadow-[0_0_50px_rgba(132,204,22,0.8)] hover:shadow-[0_0_80px_rgba(132,204,22,1)]'
}

export function ElegantButton({
  children,
  variant = 'brazil',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  glow = true,
  shimmer = true,
  className = '',
  ...props
}: ElegantButtonProps) {
  const isDisabled = disabled || loading

  const buttonClasses = [
    // Base styles with Brazilian black theme
    'relative overflow-hidden rounded-xl font-semibold transition-all duration-500',
    'transform-gpu will-change-transform',
    'border-0 outline-none focus:outline-none',
    'backdrop-blur-sm',
    
    // Variant styles
    variants[variant],
    
    // Size styles
    sizes[size],
    
    // Glow effects
    glow && glowEffects[variant],
    
    // Width
    fullWidth && 'w-full',
    
    // Disabled state
    isDisabled && 'opacity-50 cursor-not-allowed',
    
    // Custom className
    className
  ].filter(Boolean).join(' ')

  return (
    <motion.button
      className={buttonClasses}
      disabled={isDisabled}
      whileHover={!isDisabled ? { 
        scale: 1.05,
        y: -3,
        rotateX: 5,
      } : {}}
      whileTap={!isDisabled ? { 
        scale: 0.95,
        y: 0,
      } : {}}
      initial={{ opacity: 0, y: 20, rotateX: 0 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 20,
        duration: 0.6
      }}
      style={{
        perspective: '1000px',
        transformStyle: 'preserve-3d'
      }}
      {...props}
    >
      {/* Animated Brazilian-inspired gradient overlay */}
      <motion.div
        className="absolute inset-0 opacity-0 bg-gradient-to-r from-yellow-300/30 via-green-400/30 to-blue-500/30"
        whileHover={{ opacity: 1, x: '100%' }}
        initial={{ x: '-100%' }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
      />
      
      {/* Shimmer effect with Brazilian colors */}
      {shimmer && (
        <div className="absolute inset-0 -top-px overflow-hidden rounded-xl">
          <div className="absolute inset-0 rounded-xl border border-white/20" />
          <motion.div
            className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-yellow-400/60 via-green-500/60 via-blue-600/60 to-transparent"
            animate={{
              x: ['-300%', '300%'],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'linear',
              delay: Math.random() * 2
            }}
          />
        </div>
      )}
      
      {/* Content with enhanced typography */}
      <span className="relative z-10 flex items-center justify-center font-bold tracking-wide">
        {loading ? (
          <>
            <motion.div
              className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full mr-3"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
            <span className="animate-pulse">Loading...</span>
          </>
        ) : (
          children
        )}
      </span>
      
      {/* Enhanced ripple effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 via-green-500/20 to-blue-600/20 rounded-xl"
        initial={{ scale: 0, opacity: 1 }}
        whileTap={{ scale: 2, opacity: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      />
      
      {/* Particle effects for enhanced visual appeal */}
      {glow && (
        <motion.div
          className="absolute inset-0 rounded-xl"
          animate={{
            boxShadow: [
              '0 0 20px rgba(255,215,0,0.3)',
              '0 0 40px rgba(34,197,94,0.4)', 
              '0 0 20px rgba(59,130,246,0.3)',
              '0 0 20px rgba(255,215,0,0.3)'
            ]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      )}
    </motion.button>
  )
}

export default ElegantButton;
