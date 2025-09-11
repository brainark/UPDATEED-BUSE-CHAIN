import { useState, useCallback } from 'react'
import Image from 'next/image'

interface ResponsiveImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
  fill?: boolean
  sizes?: string
  quality?: number
  placeholder?: 'blur' | 'empty'
  blurDataURL?: string
}

export default function ResponsiveImage({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  fill = false,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  quality = 75,
  placeholder = 'empty',
  blurDataURL
}: ResponsiveImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  const handleLoad = useCallback(() => {
    setIsLoading(false)
  }, [])

  const handleError = useCallback(() => {
    setIsLoading(false)
    setHasError(true)
  }, [])

  const imageProps = {
    src,
    alt,
    quality,
    priority,
    placeholder,
    ...(blurDataURL && { blurDataURL }),
    onLoad: handleLoad,
    onError: handleError,
    className: `
      transition-opacity duration-300 ease-in-out
      ${isLoading ? 'opacity-0' : 'opacity-100'}
      ${className}
    `.trim(),
    ...(fill ? { fill: true, sizes } : { width, height })
  }

  if (hasError) {
    return (
      <div className={`
        bg-gray-200 dark:bg-gray-800 
        flex items-center justify-center
        text-gray-500 dark:text-gray-400
        ${fill ? 'w-full h-full' : `w-[${width}px] h-[${height}px]`}
        ${className}
      `.trim()}>
        <span className="text-sm">Image failed to load</span>
      </div>
    )
  }

  return (
    <div className={`relative ${fill ? 'w-full h-full' : ''}`}>
      {isLoading && (
        <div className={`
          absolute inset-0 bg-gray-200 dark:bg-gray-800 
          animate-pulse rounded
          ${fill ? 'w-full h-full' : `w-[${width}px] h-[${height}px]`}
        `.trim()} />
      )}
      <Image {...imageProps} />
    </div>
  )
}

// Utility component for hero images
export function ResponsiveHeroImage({ 
  src, 
  alt, 
  className = '',
  ...props 
}: Omit<ResponsiveImageProps, 'sizes'>) {
  return (
    <ResponsiveImage
      src={src}
      alt={alt}
      fill
      sizes="100vw"
      priority
      quality={85}
      className={`object-cover ${className}`}
      {...props}
    />
  )
}

// Utility component for card images
export function ResponsiveCardImage({ 
  src, 
  alt, 
  className = '',
  ...props 
}: Omit<ResponsiveImageProps, 'sizes'>) {
  return (
    <ResponsiveImage
      src={src}
      alt={alt}
      fill
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      quality={75}
      className={`object-cover ${className}`}
      {...props}
    />
  )
}

// Utility component for avatar images
export function ResponsiveAvatar({ 
  src, 
  alt, 
  size = 40,
  className = '',
  ...props 
}: ResponsiveImageProps & { size?: number }) {
  return (
    <ResponsiveImage
      src={src}
      alt={alt}
      width={size}
      height={size}
      quality={90}
      className={`rounded-full ${className}`}
      {...props}
    />
  )
}