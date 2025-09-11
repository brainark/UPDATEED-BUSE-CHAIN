import React, { useState, useEffect } from 'react'
import { NavigationShader } from '../shaders'

interface EnhancedNavigationFixedProps {
  activeSection?: string
  onNavigate?: (section: string) => void
}

export const EnhancedNavigationFixed: React.FC<EnhancedNavigationFixedProps> = ({
  activeSection = 'hero',
  onNavigate
}) => {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navigationItems = [
    { id: 'hero', label: 'Home', icon: '🏠', gradient: 'from-indigo-500 to-indigo-700' },
    { id: 'airdrop', label: 'Airdrop', icon: '🎁', gradient: 'from-green-500 to-green-700' },
    { id: 'epo', label: 'EPO', icon: '🦄', gradient: 'from-red-500 to-red-700' },
    { id: 'usecases', label: 'Use Cases', icon: '🚀', gradient: 'from-cyan-500 to-purple-700' },
    { id: 'explorer', label: 'Explorer', icon: '🔍', gradient: 'from-purple-500 to-purple-700' },
    { id: 'whitepaper', label: 'Whitepaper', icon: '📄', gradient: 'from-blue-500 to-indigo-700' },
    { id: 'benchmark', label: 'Benchmark', icon: '⚡', gradient: 'from-yellow-400 to-red-600' }
  ]

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-black/95 backdrop-blur-md shadow-xl' : 'bg-transparent'
    }`}>
      {/* Shader Background */}
      {isScrolled && <NavigationShader className="opacity-30" />}
      
      <div className="relative z-10">
        {/* Brand/Logo Section */}
        <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">🧠</div>
            <span className="text-xl font-bold text-white">BrainArk</span>
          </div>
          
          {/* Mobile Menu Button */}
          <button className="md:hidden text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
        
        {/* Navigation Tabs */}
        <div className="border-t border-white/10">
          <div className="px-2 sm:px-4 lg:px-8">
            <div className="flex justify-start sm:justify-center space-x-1 sm:space-x-2 py-3 sm:py-4 overflow-x-auto scrollbar-hide">
              {navigationItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onNavigate?.(item.id)}
                  className={`px-3 sm:px-4 py-2 sm:py-3 rounded-full font-semibold transition-all duration-300 whitespace-nowrap text-xs sm:text-sm md:text-base min-h-[44px] flex items-center justify-center transform hover:scale-105 ${
                    activeSection === item.id
                      ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg scale-105`
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <span className="hidden sm:inline">{item.icon} {item.label}</span>
                  <span className="sm:hidden">{item.icon}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
