import React, { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

interface BrazilianShaderBackgroundProps {
  variant?: 'classic' | 'carnival' | 'tropical' | 'sunset' | 'ocean'
  intensity?: 'low' | 'medium' | 'high'
  animated?: boolean
  className?: string
}

export function BrazilianShaderBackground({ 
  variant = 'classic',
  intensity = 'medium',
  animated = true,
  className = ''
}: BrazilianShaderBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const frameRef = useRef<number>()
  
  const variants = {
    classic: {
      colors: ['#C0C0C0', '#808080', '#404040', '#000000'], // Silver to black gradients
      gradientStops: [0, 0.33, 0.66, 1],
    },
    carnival: {
      colors: ['#C0C0C0', '#A0A0A0', '#808080', '#404040', '#000000'],
      gradientStops: [0, 0.25, 0.5, 0.75, 1],
    },
    tropical: {
      colors: ['#E8E8E8', '#C0C0C0', '#808080', '#202020'],
      gradientStops: [0, 0.33, 0.66, 1],
    },
    sunset: {
      colors: ['#D3D3D3', '#A9A9A9', '#696969', '#000000'],
      gradientStops: [0, 0.33, 0.66, 1],
    },
    ocean: {
      colors: ['#DCDCDC', '#B0B0B0', '#708090', '#2F2F2F'],
      gradientStops: [0, 0.33, 0.66, 1],
    }
  }

  const intensityConfig = {
    low: { opacity: 0.3, speed: 0.5, scale: 0.8 },
    medium: { opacity: 0.5, speed: 1, scale: 1 },
    high: { opacity: 0.7, speed: 1.5, scale: 1.2 }
  }

  useEffect(() => {
    // Detect mobile devices and reduce performance impact
    const isMobile = () => {
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
             window.innerWidth <= 768 ||
             'ontouchstart' in window ||
             navigator.maxTouchPoints > 0
    }

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let time = 0
    const config = intensityConfig[intensity]
    const colorScheme = variants[variant]

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    const drawShader = () => {
      if (!animated && time > 0) return

      const { width, height } = canvas
      const imageData = ctx.createImageData(width, height)
      const data = imageData.data

      // Mobile optimization: reduce quality for better performance
      const pixelStep = isMobile() ? 8 : 4
      
      for (let x = 0; x < width; x += pixelStep) {
        for (let y = 0; y < height; y += pixelStep) {
          const index = (y * width + x) * 4

          // Brazilian-inspired shader calculations
          const normalizedX = x / width
          const normalizedY = y / height
          
          // Multiple wave patterns for complex Brazilian vibes
          const wave1 = Math.sin(normalizedX * Math.PI * 4 + time * config.speed) * 0.5 + 0.5
          const wave2 = Math.cos(normalizedY * Math.PI * 3 + time * config.speed * 0.7) * 0.5 + 0.5
          const wave3 = Math.sin((normalizedX + normalizedY) * Math.PI * 2 + time * config.speed * 1.2) * 0.5 + 0.5
          
          // Carnival-style spiral effect
          const centerX = 0.5
          const centerY = 0.5
          const distance = Math.sqrt(Math.pow(normalizedX - centerX, 2) + Math.pow(normalizedY - centerY, 2))
          const angle = Math.atan2(normalizedY - centerY, normalizedX - centerX)
          const spiral = Math.sin(distance * 10 + angle * 3 + time * config.speed) * 0.3 + 0.7

          // Combine waves for complex patterns
          const pattern = (wave1 * 0.4 + wave2 * 0.3 + wave3 * 0.3) * spiral

          // Map pattern to Brazilian color scheme
          const colorIndex = Math.floor(pattern * (colorScheme.colors.length - 1))
          const nextColorIndex = Math.min(colorIndex + 1, colorScheme.colors.length - 1)
          const blend = (pattern * (colorScheme.colors.length - 1)) - colorIndex

          const color1 = hexToRgb(colorScheme.colors[colorIndex])
          const color2 = hexToRgb(colorScheme.colors[nextColorIndex])

          const r = Math.floor(color1.r * (1 - blend) + color2.r * blend)
          const g = Math.floor(color1.g * (1 - blend) + color2.g * blend)
          const b = Math.floor(color1.b * (1 - blend) + color2.b * blend)
          const a = Math.floor(255 * config.opacity * pattern)

          // Set pixel data
          data[index] = r
          data[index + 1] = g
          data[index + 2] = b
          data[index + 3] = a

          // Fill pixel block for better performance (larger blocks on mobile)
          const blockSize = isMobile() ? 8 : 4
          for (let dx = 0; dx < blockSize && x + dx < width; dx++) {
            for (let dy = 0; dy < blockSize && y + dy < height; dy++) {
              const blockIndex = ((y + dy) * width + (x + dx)) * 4
              data[blockIndex] = r
              data[blockIndex + 1] = g
              data[blockIndex + 2] = b
              data[blockIndex + 3] = a
            }
          }
        }
      }

      ctx.putImageData(imageData, 0, 0)
      
      if (animated) {
        // Reduce animation speed on mobile for better performance
        time += isMobile() ? 0.005 : 0.01
        frameRef.current = requestAnimationFrame(drawShader)
      }
    }

    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : { r: 0, g: 0, b: 0 }
    }

    resizeCanvas()
    drawShader()

    const handleResize = () => {
      resizeCanvas()
      if (!animated) drawShader()
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current)
      }
    }
  }, [variant, intensity, animated])

  return (
    <div className={`fixed inset-0 -z-10 ${className}`}>
      {/* Canvas shader background */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ mixBlendMode: 'overlay' }}
      />
      
      {/* Additional CSS gradient overlay for depth */}
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2 }}
        style={{
          background: variant === 'classic' 
            ? 'radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.8) 70%)'
            : variant === 'carnival'
            ? 'radial-gradient(ellipse at center, transparent 0%, rgba(10,10,10,0.8) 70%)'
            : variant === 'tropical'
            ? 'radial-gradient(ellipse at center, transparent 0%, rgba(20,20,20,0.6) 70%)'
            : variant === 'sunset'
            ? 'radial-gradient(ellipse at center, transparent 0%, rgba(15,15,15,0.7) 70%)'
            : 'radial-gradient(ellipse at center, transparent 0%, rgba(25,25,25,0.7) 70%)',
          mixBlendMode: 'multiply'
        }}
      />

      {/* Animated particle effects */}
      {animated && (
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full opacity-20"
              style={{
                background: variants[variant].colors[i % variants[variant].colors.length],
                filter: 'blur(1px)'
              }}
              animate={{
                x: ['-10vw', '110vw'],
                y: [
                  Math.random() * window.innerHeight,
                  Math.random() * window.innerHeight,
                ],
                scale: [0, 1, 0],
                rotate: [0, 360],
              }}
              transition={{
                duration: 15 + Math.random() * 10,
                repeat: Infinity,
                delay: Math.random() * 5,
                ease: 'linear',
              }}
            />
          ))}
        </div>
      )}

      {/* Brazilian flag inspired floating elements */}
      <motion.div
        className="absolute inset-0 overflow-hidden pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.1 }}
        transition={{ duration: 3 }}
      >
        {/* Silver diamond shapes */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-32 h-32 rotate-45 bg-gray-400/10"
          animate={{
            rotate: [45, 405],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
        <motion.div
          className="absolute bottom-1/3 right-1/3 w-24 h-24 rotate-45 bg-gray-300/10"
          animate={{
            rotate: [45, -315],
            scale: [1, 0.8, 1],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
        
        {/* Dark circular elements */}
        <motion.div
          className="absolute top-1/2 right-1/4 w-40 h-40 rounded-full bg-gray-600/10"
          animate={{
            scale: [1, 1.3, 1],
            x: [0, 50, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        
        {/* Black wave elements */}
        <motion.div
          className="absolute bottom-1/4 left-1/2 w-64 h-8 bg-gray-800/10 rounded-full"
          animate={{
            scaleX: [1, 1.5, 1],
            x: [-100, 100, -100],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </motion.div>
    </div>
  )
}

export default BrazilianShaderBackground