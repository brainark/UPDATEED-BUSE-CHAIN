import { useEffect } from 'react';

/**
 * A hook that sets and updates the CSS custom property --vh
 * to deal with mobile browser viewport height issues
 */
export function useViewportHeight() {
  useEffect(() => {
    // Set viewport height
    function setViewportHeight() {
      // Get the viewport height and multiply by 1%
      let vh = window.innerHeight * 0.01;
      // Set the CSS custom property to the viewport height
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    }

    // Set on load
    setViewportHeight();

    // Update on resize and orientation change
    window.addEventListener('resize', setViewportHeight);
    window.addEventListener('orientationchange', setViewportHeight);

    // For mobile browsers, also update on scroll (iOS Safari fix)
    let ticking = false;
    function updateOnScroll() {
      if (!ticking) {
        requestAnimationFrame(() => {
          setViewportHeight();
          ticking = false;
        });
        ticking = true;
      }
    }
    window.addEventListener('scroll', updateOnScroll, { passive: true });

    // Clean up event listeners
    return () => {
      window.removeEventListener('resize', setViewportHeight);
      window.removeEventListener('orientationchange', setViewportHeight);
      window.removeEventListener('scroll', updateOnScroll);
    };
  }, []);
}

/**
 * A hook that provides responsive breakpoints
 * @returns {Object} - isMobile, isTablet, isDesktop booleans
 */
export function useResponsiveBreakpoints() {
  const [breakpoints, setBreakpoints] = useState({
    isMobile: false,
    isTablet: false, 
    isDesktop: false
  });

  useEffect(() => {
    function handleResize() {
      const width = window.innerWidth;
      setBreakpoints({
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1024,
        isDesktop: width >= 1024
      });
    }

    // Set initial values
    handleResize();
    
    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Clean up
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return breakpoints;
}

// Don't forget the import
import { useState } from 'react';
