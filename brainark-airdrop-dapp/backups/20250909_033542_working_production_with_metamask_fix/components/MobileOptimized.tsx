import React, { useState, useEffect } from 'react'

interface MobileOptimizedProps {
  children: React.ReactNode
  className?: string
}

export const MobileOptimized: React.FC<MobileOptimizedProps> = ({ children, className = '' }) => {
  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)

  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth
      setIsMobile(width < 768)
      setIsTablet(width >= 768 && width < 1024)
    }

    checkDevice()
    window.addEventListener('resize', checkDevice)
    return () => window.removeEventListener('resize', checkDevice)
  }, [])

  const mobileClasses = isMobile ? 'mobile-optimized' : ''
  const tabletClasses = isTablet ? 'tablet-optimized' : ''

  return (
    <div className={`${className} ${mobileClasses} ${tabletClasses}`}>
      {children}
    </div>
  )
}

export const MobileGrid: React.FC<{
  children: React.ReactNode
  cols?: { mobile?: number; tablet?: number; desktop?: number }
  gap?: { mobile?: number; tablet?: number; desktop?: number }
  className?: string
}> = ({ 
  children, 
  cols = { mobile: 1, tablet: 2, desktop: 3 },
  gap = { mobile: 2, tablet: 4, desktop: 6 },
  className = ''
}) => {
  const gridClasses = `
    grid 
    grid-cols-${cols.mobile} 
    sm:grid-cols-${cols.tablet} 
    lg:grid-cols-${cols.desktop}
    gap-${gap.mobile}
    sm:gap-${gap.tablet}
    lg:gap-${gap.desktop}
    ${className}
  `

  return (
    <div className={gridClasses}>
      {children}
    </div>
  )
}

export const MobileCard: React.FC<{
  children: React.ReactNode
  variant?: 'brilliant' | 'dark'
  padding?: 'small' | 'medium' | 'large'
  className?: string
}> = ({ 
  children, 
  variant = 'brilliant',
  padding = 'medium',
  className = ''
}) => {
  const baseClasses = variant === 'brilliant' ? 'card-brilliant' : 'card-dark'
  const paddingClasses = {
    small: 'p-3 sm:p-4',
    medium: 'p-4 sm:p-6',
    large: 'p-6 sm:p-8'
  }

  return (
    <div className={`${baseClasses} ${paddingClasses[padding]} ${className}`}>
      {children}
    </div>
  )
}

export const MobileButton: React.FC<{
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger'
  size?: 'small' | 'medium' | 'large'
  fullWidth?: boolean
  onClick?: () => void
  disabled?: boolean
  className?: string
}> = ({ 
  children, 
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  onClick,
  disabled = false,
  className = ''
}) => {
  const variantClasses = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    success: 'btn-success',
    warning: 'btn-warning',
    danger: 'btn-danger'
  }

  const sizeClasses = {
    small: 'px-3 py-2 text-sm',
    medium: 'px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base',
    large: 'px-6 py-3 sm:px-8 sm:py-4 text-base sm:text-lg'
  }

  const widthClasses = fullWidth ? 'w-full' : ''

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${widthClasses}
        ${className}
        min-h-[44px]
        touch-manipulation
      `}
    >
      {children}
    </button>
  )
}

export const MobileInput: React.FC<{
  type?: string
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}> = ({ 
  type = 'text',
  value,
  onChange,
  placeholder,
  className = '',
  disabled = false
}) => {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      className={`
        w-full
        px-3 py-2 sm:px-4 sm:py-3
        text-base
        border border-gray-300 rounded-lg
        focus:ring-2 focus:ring-blue-500 focus:border-blue-500
        min-h-[44px]
        ${className}
      `}
    />
  )
}

export const MobileSelect: React.FC<{
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void
  children: React.ReactNode
  className?: string
  disabled?: boolean
}> = ({ 
  value,
  onChange,
  children,
  className = '',
  disabled = false
}) => {
  return (
    <select
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={`
        w-full
        px-3 py-2 sm:px-4 sm:py-3
        text-base
        border border-gray-300 rounded-lg
        focus:ring-2 focus:ring-blue-500 focus:border-blue-500
        min-h-[44px]
        ${className}
      `}
    >
      {children}
    </select>
  )
}

export const MobileText: React.FC<{
  children: React.ReactNode
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl'
  weight?: 'normal' | 'medium' | 'semibold' | 'bold'
  color?: string
  className?: string
}> = ({ 
  children, 
  size = 'base',
  weight = 'normal',
  color = '',
  className = ''
}) => {
  const sizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    base: 'text-sm sm:text-base',
    lg: 'text-base sm:text-lg',
    xl: 'text-lg sm:text-xl',
    '2xl': 'text-xl sm:text-2xl',
    '3xl': 'text-2xl sm:text-3xl',
    '4xl': 'text-3xl sm:text-4xl',
    '5xl': 'text-4xl sm:text-5xl'
  }

  const weightClasses = {
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold'
  }

  return (
    <span className={`${sizeClasses[size]} ${weightClasses[weight]} ${color} ${className}`}>
      {children}
    </span>
  )
}

export const MobileContainer: React.FC<{
  children: React.ReactNode
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '7xl'
  padding?: boolean
  className?: string
}> = ({ 
  children, 
  maxWidth = '7xl',
  padding = true,
  className = ''
}) => {
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '7xl': 'max-w-7xl'
  }

  const paddingClasses = padding ? 'px-2 sm:px-4 lg:px-8' : ''

  return (
    <div className={`${maxWidthClasses[maxWidth]} mx-auto ${paddingClasses} ${className}`}>
      {children}
    </div>
  )
}

export default MobileOptimized