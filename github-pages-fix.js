/**
 * RIFIM ERP — GitHub Pages Asset Loader Fix
 * Memastikan semua asset (images, fonts, scripts) dimuat dengan path yang benar
 * Tidak mengubah fungsi utama aplikasi
 */

(function() {
  'use strict';
  
  // Deteksi jika running di GitHub Pages subdirectory
  const isGitHubPages = window.location.hostname === 'rifim01.github.io';
  const basePath = isGitHubPages ? '/rifim-attendance' : '';
  
  // Simpan di window object untuk digunakan script lain jika perlu
  window.RIFIM_BASE_PATH = basePath;
  
  /**
   * Helper function untuk resolve asset paths
   * Gunakan: assetPath('assets/logo.png') → '/rifim-attendance/assets/logo.png' atau 'assets/logo.png'
   */
  window.assetPath = function(path) {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    if (path.startsWith('/')) return basePath + path;
    return basePath + '/' + path;
  };
  
  /**
   * Fix semua img src yang relatif
   * Berjalan setelah DOM siap
   */
  function fixImagePaths() {
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      const src = img.getAttribute('src');
      if (src && !src.startsWith('http') && !src.startsWith('data:')) {
        const correctSrc = assetPath(src.startsWith('/') ? src.substring(1) : src);
        if (img.src !== correctSrc) {
          img.src = correctSrc;
        }
      }
    });
  }
  
  /**
   * Fix CSS background URLs yang relatif
   */
  function fixCSSBackgrounds() {
    const styleSheets = document.styleSheets;
    try {
      for (let sheet of styleSheets) {
        try {
          const rules = sheet.cssRules || sheet.rules;
          for (let rule of rules) {
            if (rule.style && rule.style.backgroundImage) {
              const bgImg = rule.style.backgroundImage;
              if (bgImg && bgImg.includes('url(') && !bgImg.includes('http')) {
                // Parse URL dari backgroundImage
                const match = bgImg.match(/url\(['"]?([^'"()]+)['"]?\)/);
                if (match && match[1]) {
                  const originalPath = match[1];
                  if (!originalPath.startsWith('http') && !originalPath.startsWith('data:')) {
                    const correctPath = assetPath(originalPath);
                    rule.style.backgroundImage = `url('${correctPath}')`;
                  }
                }
              }
            }
          }
        } catch (e) {
          // Skip CORS-protected stylesheets
          continue;
        }
      }
    } catch (e) {
      console.warn('Could not fix CSS backgrounds:', e.message);
    }
  }
  
  /**
   * Monitor dan fix dynamically added elements
   */
  function observeDynamicChanges() {
    const observer = new MutationObserver(function(mutations) {
      let needsImageFix = false;
      
      mutations.forEach(function(mutation) {
        if (mutation.addedNodes.length) {
          mutation.addedNodes.forEach(function(node) {
            if (node.nodeType === 1) { // Element node
              // Check jika element adalah img atau punya img children
              if (node.tagName === 'IMG') {
                needsImageFix = true;
              } else if (node.querySelectorAll) {
                if (node.querySelectorAll('img').length > 0) {
                  needsImageFix = true;
                }
              }
            }
          });
        }
      });
      
      if (needsImageFix) {
        fixImagePaths();
      }
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
  
  // Run pada DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      fixImagePaths();
      fixCSSBackgrounds();
      observeDynamicChanges();
    });
  } else {
    // Already loaded
    fixImagePaths();
    fixCSSBackgrounds();
    observeDynamicChanges();
  }
  
  // Also run on window load untuk memastikan semua resource loaded
  window.addEventListener('load', function() {
    fixImagePaths();
  });
  
})();
