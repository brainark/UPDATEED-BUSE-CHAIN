import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export interface TabItem {
  id: string
  label: string
  icon?: React.ReactNode
  content: React.ReactNode
  emoji?: string
}

interface BrazilianAnimatedTabsProps {
  tabs: TabItem[]
  defaultTabId?: string
  variant?: 'brazilian' | 'carnival' | 'tropical' | 'gold' | 'forest'
  onChange?: (tabId: string) => void
  className?: string
}

const variants = {
  brazilian: {
    active: 'bg-gradient-to-r from-yellow-400 via-green-500 to-blue-600 text-white shadow-[0_0_30px_rgba(255,215,0,0.4)]',
    inactive: 'text-gray-300 hover:text-white hover:bg-yellow-500/20',
    background: 'bg-gray-900/50 backdrop-blur-sm border border-yellow-500/20'
  },
  carnival: {
    active: 'bg-gradient-to-r from-pink-500 via-purple-500 to-orange-500 text-white shadow-[0_0_30px_rgba(236,72,153,0.4)]',
    inactive: 'text-gray-300 hover:text-white hover:bg-pink-500/20',
    background: 'bg-gray-900/50 backdrop-blur-sm border border-pink-500/20'
  },
  tropical: {
    active: 'bg-gradient-to-r from-lime-400 via-green-500 to-emerald-600 text-black shadow-[0_0_30px_rgba(132,204,22,0.4)]',
    inactive: 'text-gray-300 hover:text-white hover:bg-lime-500/20',
    background: 'bg-gray-900/50 backdrop-blur-sm border border-lime-500/20'
  },
  gold: {
    active: 'bg-gradient-to-r from-amber-400 via-yellow-500 to-orange-500 text-black shadow-[0_0_30px_rgba(245,158,11,0.4)]',
    inactive: 'text-gray-300 hover:text-white hover:bg-amber-500/20',
    background: 'bg-gray-900/50 backdrop-blur-sm border border-amber-500/20'
  },
  forest: {
    active: 'bg-gradient-to-r from-emerald-600 via-green-700 to-teal-600 text-white shadow-[0_0_30px_rgba(16,185,129,0.4)]',
    inactive: 'text-gray-300 hover:text-white hover:bg-emerald-500/20',
    background: 'bg-gray-900/50 backdrop-blur-sm border border-emerald-500/20'
  }
}

export function BrazilianAnimatedTabs({
  tabs,
  defaultTabId,
  variant = 'brazilian',
  onChange,
  className = '',
}: BrazilianAnimatedTabsProps) {
  const [activeTabId, setActiveTabId] = useState(defaultTabId || tabs[0]?.id || '')
  
  // Sync with external defaultTabId changes
  useEffect(() => {
    if (defaultTabId && defaultTabId !== activeTabId) {
      setActiveTabId(defaultTabId)
    }
  }, [defaultTabId, activeTabId])
  
  const handleTabChange = (tabId: string) => {
    setActiveTabId(tabId)
    onChange?.(tabId)
  }
  
  const activeTab = tabs.find(tab => tab.id === activeTabId)
  const currentVariant = variants[variant]
  
  // Content transition variants
  const contentVariants = {
    hidden: { 
      opacity: 0, 
      y: 20,
      scale: 0.95,
      rotateX: -10
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      rotateX: 0
    },
    exit: {
      opacity: 0,
      y: -20,
      scale: 0.95,
      rotateX: 10
    }
  }

  const tabVariants = {
    inactive: {
      scale: 1,
      rotateY: 0,
      z: 0
    },
    active: {
      scale: 1.05,
      rotateY: 0,
      z: 10
    },
    hover: {
      scale: 1.02,
      rotateY: 5,
      z: 5
    }
  }

  return (
    <div className={`w-full ${className}`}>
      {/* Brazilian Black themed container */}
      <div className={`relative rounded-2xl p-1 ${currentVariant.background}`}>
        {/* Animated background glow */}
        <motion.div
          className="absolute inset-0 rounded-2xl opacity-20"
          animate={{
            background: [
              'radial-gradient(circle at 25% 25%, #fbbf24 0%, transparent 50%)',
              'radial-gradient(circle at 75% 25%, #10b981 0%, transparent 50%)',
              'radial-gradient(circle at 75% 75%, #3b82f6 0%, transparent 50%)',
              'radial-gradient(circle at 25% 75%, #f59e0b 0%, transparent 50%)',
              'radial-gradient(circle at 25% 25%, #fbbf24 0%, transparent 50%)'
            ]
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "linear"
          }}
        />

        {/* Tab buttons */}
        <div className="relative flex flex-wrap gap-2 p-2">
          {tabs.map((tab, index) => (
            <motion.button
              key={tab.id}
              className={`
                relative flex items-center px-6 py-4 rounded-xl font-bold text-sm
                transition-all duration-500 backdrop-blur-sm
                ${tab.id === activeTabId ? currentVariant.active : currentVariant.inactive}
              `}
              onClick={() => handleTabChange(tab.id)}
              variants={tabVariants}
              initial="inactive"
              animate={tab.id === activeTabId ? "active" : "inactive"}
              whileHover="hover"
              style={{ perspective: '1000px' }}
              layout
            >
              {/* Shimmer effect */}
              {tab.id === activeTabId && (
                <motion.div
                  className="absolute inset-0 rounded-xl overflow-hidden"
                  initial={{ x: '-100%' }}
                  animate={{ x: '100%' }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "linear",
                    delay: index * 0.2
                  }}
                >
                  <div className="h-full w-20 bg-gradient-to-r from-transparent via-white/30 to-transparent transform skew-x-12" />
                </motion.div>
              )}

              {/* Tab content */}
              <div className="relative z-10 flex items-center">
                {tab.emoji && (
                  <motion.span 
                    className="mr-3 text-lg"
                    animate={tab.id === activeTabId ? {
                      scale: [1, 1.2, 1],
                      rotate: [0, 10, -10, 0]
                    } : {}}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    {tab.emoji}
                  </motion.span>
                )}
                {tab.icon && (
                  <motion.span 
                    className="mr-3"
                    animate={tab.id === activeTabId ? {
                      rotate: [0, 360]
                    } : {}}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                  >
                    {tab.icon}
                  </motion.span>
                )}
                <span className="tracking-wide">{tab.label}</span>
              </div>

              {/* Active tab glow */}
              {tab.id === activeTabId && (
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
          ))}
        </div>
      </div>

      {/* Content area with enhanced animations */}
      <div className="relative mt-6">
        <AnimatePresence mode="wait">
          {activeTab && (
            <motion.div
              key={activeTabId}
              variants={contentVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
                duration: 0.6
              }}
              style={{
                perspective: '1000px',
                transformStyle: 'preserve-3d'
              }}
              className="rounded-2xl overflow-hidden"
            >
              {/* Content background with Brazilian theme */}
              <div className="relative bg-gray-900/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6">
                {/* Animated border gradient */}
                <motion.div
                  className="absolute inset-0 rounded-2xl opacity-30"
                  animate={{
                    background: [
                      'linear-gradient(45deg, #fbbf24, #10b981, #3b82f6, #fbbf24)',
                      'linear-gradient(90deg, #10b981, #3b82f6, #fbbf24, #10b981)',
                      'linear-gradient(135deg, #3b82f6, #fbbf24, #10b981, #3b82f6)',
                      'linear-gradient(45deg, #fbbf24, #10b981, #3b82f6, #fbbf24)'
                    ]
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                  style={{
                    maskImage: 'linear-gradient(black, black) content-box, linear-gradient(black, black) border-box',
                    maskComposite: 'xor',
                    maskSize: 'cover',
                    padding: '2px'
                  }}
                />
                
                {/* Content */}
                <div className="relative z-10">
                  {activeTab.content}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default BrazilianAnimatedTabs;
export { BrazilianAnimatedTabs as AnimatedTabs };
