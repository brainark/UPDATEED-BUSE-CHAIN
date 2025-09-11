import React from 'react'
import { HeroShaderBackground, ShaderButton } from '../shaders'

interface EnhancedHeroProps {
  onNavigateToSection: (section: string) => void
}

export const EnhancedHero: React.FC<EnhancedHeroProps> = ({ onNavigateToSection }) => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Professional Shader Background */}
      <HeroShaderBackground />
      
      {/* Gradient Overlay for Better Text Readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Main Hero Content */}
        <div className="space-y-8">
          {/* Logo/Brand */}
          <div className="flex justify-center mb-8">
            <div className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              🧠
            </div>
          </div>
          
          {/* Main Headline */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight">
            Welcome to{' '}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              BrainArk
            </span>
          </h1>
          
          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            The future of decentralized intelligence. Join our ecosystem and claim your place in the next generation of blockchain innovation.
          </p>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
            <ShaderButton
              variant="airdrop"
              onClick={() => onNavigateToSection('airdrop')}
              className="w-full sm:w-auto min-w-[200px] text-lg py-4"
            >
              🎁 Claim Airdrop
            </ShaderButton>
            
            <ShaderButton
              variant="epo"
              onClick={() => onNavigateToSection('epo')}
              className="w-full sm:w-auto min-w-[200px] text-lg py-4"
            >
              🦄 Join EPO
            </ShaderButton>
            
            <ShaderButton
              variant="explorer"
              onClick={() => onNavigateToSection('explorer')}
              className="w-full sm:w-auto min-w-[200px] text-lg py-4"
            >
              🔍 Explore
            </ShaderButton>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 max-w-4xl mx-auto">
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10">
              <div className="text-3xl font-bold text-indigo-400">10M+</div>
              <div className="text-gray-300 mt-2">Tokens Distributed</div>
            </div>
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10">
              <div className="text-3xl font-bold text-green-400">50K+</div>
              <div className="text-gray-300 mt-2">Active Users</div>
            </div>
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10">
              <div className="text-3xl font-bold text-purple-400">99.9%</div>
              <div className="text-gray-300 mt-2">Uptime</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/30 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  )
}
