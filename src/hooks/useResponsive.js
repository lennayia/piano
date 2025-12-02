import { useState, useEffect } from 'react';

/**
 * Hook pro detekci responzivních breakpointů
 * @returns {Object} { isMobile, isTablet, isDesktop, isCompact }
 */
export function useResponsive() {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth <= 640;
  const isTablet = windowWidth > 640 && windowWidth <= 1024;
  const isDesktop = windowWidth > 1024;

  return {
    isMobile,
    isTablet,
    isDesktop,
    isCompact: isMobile || isTablet, // 0-1024px = kompaktní layout
    width: windowWidth
  };
}
