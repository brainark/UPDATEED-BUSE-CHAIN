// src/components/shaders/ShaderBackground.tsx
// OPTIMIZED VERSION: Uses dynamic imports and CSS fallbacks
import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import * as CSS from './ProfessionalShaders';

// Constants for shader configurations
const SHADER_ENABLED_KEY = 'shader-enabled';

// Device capability detection function
const detectCapabilities = () => {
  // Check if we're on the client side
  if (typeof window === 'undefined') {
    return {
      hasWebGL: false,
      isMobile: false,
      isLowPower: false,
      reducedMotion: false,
      memoryConstraints: false,
    };
  }

  // WebGL detection
  const canvas = document.createElement('canvas');
  const hasWebGL = !!(
    window.WebGLRenderingContext &&
    (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
  );

  // Mobile detection
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  ) || window.innerWidth < 768;

  // Reduced motion preference
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Hardware detection
  const deviceMemory = (navigator as any).deviceMemory;
  const hardwareConcurrency = (navigator as any).hardwareConcurrency;
  const isLowPower = 
    (deviceMemory && deviceMemory < 4) || 
    (hardwareConcurrency && hardwareConcurrency < 4);
  
  // Memory constraints
  const memoryConstraints = deviceMemory && deviceMemory <= 2;

  return {
    hasWebGL,
    isMobile,
    isLowPower,
    reducedMotion,
    memoryConstraints,
  };
};

// Dynamically import shader components with fallbacks
const MeshGradient = dynamic(
  () => import('@paper-design/shaders-react').then((mod) => mod.MeshGradient),
  { 
    ssr: false,
    loading: () => <CSS.CSSMeshGradient colors={['#4b5563', '#6b7280', '#9ca3af']} />
  }
);

// Context provider for shader settings
export const ShaderSettingsContext = React.createContext({
  enabled: true,
  setEnabled: (enabled: boolean) => {},
  quality: 'high' as 'low' | 'medium' | 'high',
  isMobile: false,
  hasWebGL: false,
  reducedMotion: false,
  isVisible: true,
});

// Provider component
export const ShaderSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [capabilities] = useState(detectCapabilities());
  const [enabled, setEnabled] = useState(() => {
    // Check if we're on client-side and get stored preference
    if (typeof window !== 'undefined') {
      const storedPref = localStorage.getItem(SHADER_ENABLED_KEY);
      return storedPref === null ? true : storedPref === 'true';
    }
    return true;
  });
  
  const [isVisible, setIsVisible] = useState(true);
  
  // Determine quality based on device capabilities
  let quality: 'low' | 'medium' | 'high' = 'high';
  if (capabilities.isMobile || capabilities.isLowPower) quality = 'medium';
  if (capabilities.memoryConstraints || (capabilities.isMobile && capabilities.isLowPower)) quality = 'low';
  
  // Handle visibility changes for performance optimization
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);
  
  // Store user preference
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(SHADER_ENABLED_KEY, String(enabled));
    }
  }, [enabled]);
  
  return (
    <ShaderSettingsContext.Provider
      value={{
        enabled,
        setEnabled,
        quality,
        isMobile: capabilities.isMobile,
        hasWebGL: capabilities.hasWebGL,
        reducedMotion: capabilities.reducedMotion,
        isVisible,
      }}
    >
      {children}
    </ShaderSettingsContext.Provider>
  );
};

// Hook for using shader settings
export const useShaderSettings = () => React.useContext(ShaderSettingsContext);

// Base shader components
type ShaderProps = {
  className?: string;
  colors?: string[];
  speed?: number;
  opacity?: number;
  intensity?: number;
};

// Hero section shader
export const HeroBackground: React.FC<ShaderProps> = ({
  className = '',
  colors = ['#6366f1', '#8b5cf6', '#3b82f6', '#06b6d4', '#10b981'],
  speed = 0.02,
  opacity = 0.7,
}) => {
  const { enabled, hasWebGL, quality, reducedMotion, isVisible } = useShaderSettings();
  
  // If shaders are disabled, return a simple gradient
  if (!enabled || !isVisible) {
    return <div className={`absolute inset-0 bg-gradient-to-br from-gray-900 to-black ${className}`} />;
  }
  
  // If WebGL is available, use the WebGL shader
  if (hasWebGL && !reducedMotion) {
    // Adjust quality based on device capabilities
    const qualityMultiplier = quality === 'high' ? 1 : quality === 'medium' ? 0.5 : 0.25;
    const blurRadius = quality === 'high' ? 64 : quality === 'medium' ? 32 : 16;
    
    return (
      <div className={`absolute inset-0 overflow-hidden ${className}`}>
        <MeshGradient
          className="absolute inset-0"
          colors={colors}
          speed={speed * qualityMultiplier}
          blur={blurRadius}
          opacity={opacity}
          scale={1.2}
        />
      </div>
    );
  }
  
  // Otherwise, use the CSS fallback
  return <CSS.HeroShaderBackground className={className} />;
};

// Airdrop section shader
export const AirdropBackground: React.FC<ShaderProps> = ({
  className = '',
  colors = ['#059669', '#10b981', '#34d399', '#6ee7b7'],
  speed = 0.025,
  opacity = 0.4,
}) => {
  const { enabled, hasWebGL, quality, reducedMotion, isVisible } = useShaderSettings();
  
  if (!enabled || !isVisible) {
    return <div className={`absolute inset-0 bg-gradient-to-br from-green-900 to-green-800 opacity-30 ${className}`} />;
  }
  
  if (hasWebGL && !reducedMotion) {
    const qualityMultiplier = quality === 'high' ? 1 : quality === 'medium' ? 0.5 : 0.25;
    const blurRadius = quality === 'high' ? 64 : quality === 'medium' ? 32 : 16;
    
    return (
      <div className={`absolute inset-0 overflow-hidden ${className}`}>
        <MeshGradient
          className="absolute inset-0"
          colors={colors}
          speed={speed * qualityMultiplier}
          blur={blurRadius}
          opacity={opacity}
          scale={1.2}
        />
      </div>
    );
  }
  
  return <CSS.AirdropShaderBackground className={className} />;
};

// EPO section shader
export const EPOBackground: React.FC<ShaderProps> = ({
  className = '',
  colors = ['#dc2626', '#ef4444', '#f87171', '#fca5a5'],
  speed = 0.03,
  opacity = 0.35,
}) => {
  const { enabled, hasWebGL, quality, reducedMotion, isVisible } = useShaderSettings();
  
  if (!enabled || !isVisible) {
    return <div className={`absolute inset-0 bg-gradient-to-br from-red-900 to-red-800 opacity-30 ${className}`} />;
  }
  
  if (hasWebGL && !reducedMotion) {
    const qualityMultiplier = quality === 'high' ? 1 : quality === 'medium' ? 0.5 : 0.25;
    const blurRadius = quality === 'high' ? 64 : quality === 'medium' ? 32 : 16;
    
    return (
      <div className={`absolute inset-0 overflow-hidden ${className}`}>
        <MeshGradient
          className="absolute inset-0"
          colors={colors}
          speed={speed * qualityMultiplier}
          blur={blurRadius}
          opacity={opacity}
          scale={1.2}
        />
      </div>
    );
  }
  
  return <CSS.EPOShaderBackground className={className} />;
};

// Explorer section shader
export const ExplorerBackground: React.FC<ShaderProps> = ({
  className = '',
  colors = ['#7c3aed', '#a855f7', '#c084fc', '#ddd6fe'],
  speed = 0.02,
  opacity = 0.3,
}) => {
  const { enabled, hasWebGL, quality, reducedMotion, isVisible } = useShaderSettings();
  
  if (!enabled || !isVisible) {
    return <div className={`absolute inset-0 bg-gradient-to-br from-purple-900 to-purple-800 opacity-30 ${className}`} />;
  }
  
  if (hasWebGL && !reducedMotion) {
    const qualityMultiplier = quality === 'high' ? 1 : quality === 'medium' ? 0.5 : 0.25;
    const blurRadius = quality === 'high' ? 64 : quality === 'medium' ? 32 : 16;
    
    return (
      <div className={`absolute inset-0 overflow-hidden ${className}`}>
        <MeshGradient
          className="absolute inset-0"
          colors={colors}
          speed={speed * qualityMultiplier}
          blur={blurRadius}
          opacity={opacity}
          scale={1.2}
        />
      </div>
    );
  }
  
  return <CSS.ExplorerShaderBackground className={className} />;
};

// Shader Button component with hover effects
export const ShaderButton = CSS.ShaderButton;

// Exports for backward compatibility
export { MeshGradient };
