import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface ExodusButtonProps {
  onOpenMigration: () => void
  className?: string
}

const ExodusButton: React.FC<ExodusButtonProps> = ({ onOpenMigration, className = '' }) => {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.button
      onClick={onOpenMigration}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        relative overflow-hidden px-8 py-4 rounded-xl font-bold text-lg
        bg-gradient-to-r from-purple-600 via-blue-600 to-green-500
        text-white shadow-2xl border-2 border-white/20
        transition-all duration-300 hover:shadow-purple-500/25 hover:scale-105
        ${className}
      `}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Animated Background */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-green-500 via-blue-600 to-purple-600"
        animate={{
          x: isHovered ? [0, 100, 0] : 0,
        }}
        transition={{
          duration: 2,
          repeat: isHovered ? Infinity : 0,
          ease: "easeInOut"
        }}
      />
      
      {/* Shine Effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12"
        animate={{
          x: isHovered ? [-100, 200] : -200,
        }}
        transition={{
          duration: 0.8,
          repeat: isHovered ? Infinity : 0,
          repeatDelay: 1.5,
          ease: "easeInOut"
        }}
      />

      {/* Button Content */}
      <div className="relative z-10 flex items-center gap-3">
        <motion.span
          className="text-2xl"
          animate={{
            rotate: isHovered ? [0, 360] : 0,
          }}
          transition={{
            duration: 1,
            repeat: isHovered ? Infinity : 0,
            ease: "easeInOut"
          }}
        >
          🚀
        </motion.span>
        <span className="font-extrabold tracking-wide">EXODUS</span>
        <motion.span
          className="text-xl"
          animate={{
            scale: isHovered ? [1, 1.2, 1] : 1,
          }}
          transition={{
            duration: 0.6,
            repeat: isHovered ? Infinity : 0,
            ease: "easeInOut"
          }}
        >
          ⛵
        </motion.span>
      </div>

      {/* Subtitle */}
      <div className="relative z-10 text-xs mt-1 opacity-90 font-medium">
        Migrate to BrainArk
      </div>

      {/* Glow Effect */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute -inset-1 bg-gradient-to-r from-purple-500 via-blue-500 to-green-500 rounded-xl blur opacity-30"
          />
        )}
      </AnimatePresence>
    </motion.button>
  )
}

export default ExodusButton