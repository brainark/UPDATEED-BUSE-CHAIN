import React from 'react'
import { AirdropShaderBackground, EPOShaderBackground, ExplorerShaderBackground } from '../shaders'

interface EnhancedSectionWrapperProps {
  children: React.ReactNode
  variant: 'airdrop' | 'epo' | 'explorer' | 'default'
  className?: string
}

export const EnhancedSectionWrapper: React.FC<EnhancedSectionWrapperProps> = ({
  children,
  variant,
  className = ""
}) => {
  const ShaderComponent = {
    airdrop: AirdropShaderBackground,
    epo: EPOShaderBackground,
    explorer: ExplorerShaderBackground,
    default: () => null
  }[variant]

  return (
    <section className={`relative min-h-screen py-16 ${className}`}>
      {/* Shader Background */}
      {ShaderComponent && <ShaderComponent />}
      
      {/* Content Overlay */}
      <div className="relative z-10">
        {children}
      </div>
    </section>
  )
}
