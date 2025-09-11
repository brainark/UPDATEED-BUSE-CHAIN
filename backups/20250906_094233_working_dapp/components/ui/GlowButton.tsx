import { motion } from 'framer-motion';
import React from 'react';

interface GlowButtonProps {
  text: string;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  glow?: 'blue' | 'purple' | 'green' | 'multi';
  icon?: React.ReactNode;
}

export const GlowButton: React.FC<GlowButtonProps> = ({
  text,
  onClick,
  className = '',
  disabled = false,
  size = 'md',
  glow = 'blue',
  icon,
}) => {
  const sizeClasses = {
    sm: 'py-1.5 px-3 text-sm',
    md: 'py-2.5 px-5 text-base',
    lg: 'py-3 px-7 text-lg',
  };
  
  const glowClasses = {
    blue: 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600',
    purple: 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600',
    green: 'bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600',
    multi: 'bg-gradient-to-r from-purple-500 via-blue-500 to-green-500 hover:from-purple-600 hover:via-blue-600 hover:to-green-600',
  };
  
  // Generate matching glow shadow based on glow type
  const glowShadow = {
    blue: 'shadow-[0_0_15px_rgba(59,130,246,0.5)]',
    purple: 'shadow-[0_0_15px_rgba(168,85,247,0.5)]',
    green: 'shadow-[0_0_15px_rgba(16,185,129,0.5)]',
    multi: 'shadow-[0_0_15px_rgba(139,92,246,0.5)]',
  };
  
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className={`
        relative rounded-lg font-medium text-white
        ${sizeClasses[size]}
        ${glowClasses[glow]}
        ${glowShadow[glow]}
        transition-all duration-300
        flex items-center justify-center
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'transform hover:-translate-y-0.5 hover:shadow-lg'}
        ${className}
      `}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
    >
      {/* Subtle glow overlay effect */}
      <span className="absolute inset-0 rounded-lg overflow-hidden">
        <span className="absolute inset-0 rounded-lg opacity-0 hover:opacity-20 bg-white transition-opacity duration-300"></span>
      </span>
      
      {/* Icon and text */}
      <div className="flex items-center justify-center space-x-2">
        {icon && <span>{icon}</span>}
        <span>{text}</span>
      </div>
      
      {/* Focus ring for accessibility */}
      <span className="absolute inset-0 rounded-lg ring-offset-2 ring-offset-black focus-within:ring-2 ring-white opacity-0"></span>
    </motion.button>
  );
};

export default GlowButton;
