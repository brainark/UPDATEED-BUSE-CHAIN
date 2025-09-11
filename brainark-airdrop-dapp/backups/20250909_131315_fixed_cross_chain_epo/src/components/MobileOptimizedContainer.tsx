import { ReactNode } from 'react'

interface MobileOptimizedContainerProps {
  children: ReactNode
  className?: string
  padding?: 'none' | 'sm' | 'md' | 'lg'
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | '6xl' | '7xl'
}

export default function MobileOptimizedContainer({ 
  children, 
  className = '', 
  padding = 'md',
  maxWidth = '4xl'
}: MobileOptimizedContainerProps) {
  const paddingClasses = {
    none: '',
    sm: 'px-3 sm:px-4 lg:px-6',
    md: 'px-4 sm:px-6 lg:px-8',
    lg: 'px-6 sm:px-8 lg:px-12'
  }

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '4xl': 'max-w-4xl',
    '6xl': 'max-w-6xl',
    '7xl': 'max-w-7xl'
  }

  return (
    <div className={`${maxWidthClasses[maxWidth]} mx-auto ${paddingClasses[padding]} ${className}`}>
      {children}
    </div>
  )
}

// Mobile-optimized grid component
interface MobileGridProps {
  children: ReactNode
  cols?: {
    mobile: number
    tablet: number
    desktop: number
  }
  gap?: {
    mobile: number
    tablet: number
    desktop: number
  }
  className?: string
}

export function MobileGrid({ 
  children, 
  cols = { mobile: 1, tablet: 2, desktop: 3 },
  gap = { mobile: 3, tablet: 4, desktop: 6 },
  className = ''
}: MobileGridProps) {
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

// Mobile-optimized text component
interface MobileTextProps {
  children: ReactNode
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl'
  className?: string
}

export function MobileText({ children, size = 'base', className = '' }: MobileTextProps) {
  const sizeClasses = {
    xs: 'text-xs sm:text-sm',
    sm: 'text-sm sm:text-base',
    base: 'text-sm sm:text-base',
    lg: 'text-base sm:text-lg',
    xl: 'text-lg sm:text-xl',
    '2xl': 'text-xl sm:text-2xl',
    '3xl': 'text-2xl sm:text-3xl',
    '4xl': 'text-3xl sm:text-4xl',
    '5xl': 'text-4xl sm:text-5xl'
  }

  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      {children}
    </div>
  )
}

// Mobile-optimized button component
interface MobileButtonProps {
  children: ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
  disabled?: boolean
  className?: string
}

export function MobileButton({ 
  children, 
  onClick, 
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  className = ''
}: MobileButtonProps) {
  const baseClasses = 'font-semibold rounded-full transition-all duration-300 touch-manipulation'
  
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm min-h-[40px]',
    md: 'px-4 py-3 text-sm sm:text-base min-h-[48px]',
    lg: 'px-6 py-4 text-base sm:text-lg min-h-[52px]'
  }

  const variantClasses = {
    primary: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700',
    success: 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700',
    warning: 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white hover:from-yellow-600 hover:to-yellow-700',
    danger: 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700'
  }

  const widthClass = fullWidth ? 'w-full' : ''
  const disabledClass = disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${widthClass} ${disabledClass} ${className}`}
    >
      {children}
    </button>
  )
}