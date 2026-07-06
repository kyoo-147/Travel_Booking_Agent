// Font loading utilities
export const loadFonts = () => {
  // Check if Inter font is loaded
  if (document.fonts) {
    document.fonts.ready.then(() => {
      console.log('Fonts loaded successfully');
      document.body.classList.add('fonts-loaded');
    }).catch((error) => {
      console.warn('Font loading failed:', error);
      // Fallback to system fonts
      document.body.classList.add('fonts-fallback');
    });
  } else {
    // Fallback for older browsers
    setTimeout(() => {
      document.body.classList.add('fonts-fallback');
    }, 1000);
  }
};

// Force refresh font rendering
export const refreshFontRendering = () => {
  // Force browser to recalculate font rendering
  document.body.style.fontFamily = '';
  setTimeout(() => {
    document.body.style.fontFamily = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif";
  }, 10);
};

// Check if Inter font is available
export const isInterFontAvailable = (): boolean => {
  if (!document.fonts) return false;
  
  const inter = document.fonts.check("1rem Inter");
  return inter;
};

// Preload font
export const preloadInterFont = () => {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap';
  link.as = 'style';
  link.onload = () => {
    link.rel = 'stylesheet';
  };
  document.head.appendChild(link);
};