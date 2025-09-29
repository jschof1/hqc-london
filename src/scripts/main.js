// Main JavaScript functionality for HQC website
import { initializeCaseStudies } from './gallery.js';

// Enhanced page transitions and navigation
document.addEventListener('DOMContentLoaded', function() {
  // Prevent duplicate initialization
  if (window.hqcInitialized) {
    return;
  }
  window.hqcInitialized = true;
  // Throttled scroll animations to prevent flashing
  const observerOptions = {
    threshold: 0.2, // Require more of element to be visible
    rootMargin: '0px 0px -100px 0px' // Start animation later
  };

  // Throttle to prevent excessive triggering
  let isAnimating = false;
  
  const staggerObserver = new IntersectionObserver((entries) => {
    if (isAnimating) return;
    
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.classList.contains('stagger-children')) {
        isAnimating = true;
        requestAnimationFrame(() => {
          entry.target.classList.add('stagger-children');
          staggerObserver.unobserve(entry.target);
          setTimeout(() => { isAnimating = false; }, 100);
        });
      }
    });
  }, observerOptions);

  // Observe elements that should have staggered animations
  const staggerTargets = document.querySelectorAll('.grid, .gallery-grid, .area-grid, .service-grid');
  staggerTargets.forEach(target => {
    staggerObserver.observe(target);
  });

  // Fade-in scroll animations
  const fadeInObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.classList.contains('visible')) {
        entry.target.classList.add('visible');
        fadeInObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.2,
    rootMargin: '0px 0px -50px 0px'
  });

  // Observe all fade-in elements
  const fadeInTargets = document.querySelectorAll('.fade-in');
  fadeInTargets.forEach(target => {
    fadeInObserver.observe(target);
  });

  // Enhanced navigation with transition preparation
  const navLinks = document.querySelectorAll('a[href^="/"], a[href^="./"], a[href^="../"]');
  
  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      // Don't interfere with Astro's view transitions
      // Just add smooth hover effects and loading states
      this.style.transition = 'all 0.2s ease';
    });
  });

  // View transition debugging and error handling
  let loadingTimeout;
  
  document.addEventListener('astro:before-preparation', () => {
    console.log('🚀 Preparing page transition...');
    clearTimeout(loadingTimeout);
    
    // Pause scroll animations during page transitions
    staggerObserver.disconnect();
    fadeInObserver.disconnect();
    isAnimating = true;
    
    loadingTimeout = setTimeout(() => {
      document.body.style.cursor = 'wait';
    }, 200);
  });

  document.addEventListener('astro:after-swap', () => {
    console.log('✅ Page transition complete');
    clearTimeout(loadingTimeout);
    document.body.style.cursor = 'auto';
    
    // Re-enable scroll animations after a delay
    setTimeout(() => {
      isAnimating = false;
    }, 300);
    
    // Re-initialize components
    try {
      reinitializeComponents();
    } catch (error) {
      console.warn('⚠️ Component reinitialization error:', error);
    }
  });

  // Additional view transition event handlers
  document.addEventListener('astro:before-swap', () => {
    console.log('🔄 Starting DOM swap...');
  });

  document.addEventListener('astro:page-load', () => {
    console.log('📄 Page load complete');
  });

  // Handle transition errors gracefully
  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason && event.reason.toString().includes('transition')) {
      console.warn('🚫 View transition error handled:', event.reason);
      event.preventDefault();
    }
  });

  function reinitializeComponents() {
    // Clean up existing gallery before reinitializing
    if (window.galleryCleanup) {
      window.galleryCleanup();
    }
    
    // Re-observe stagger targets on new page (after delay to avoid conflicts)
    setTimeout(() => {
      const newStaggerTargets = document.querySelectorAll('.grid:not(.stagger-children), .gallery-grid:not(.stagger-children), .area-grid:not(.stagger-children), .service-grid:not(.stagger-children)');
      newStaggerTargets.forEach(target => {
        staggerObserver.observe(target);
      });

      // Re-observe fade-in elements on new page
      const newFadeInTargets = document.querySelectorAll('.fade-in:not(.visible)');
      newFadeInTargets.forEach(target => {
        fadeInObserver.observe(target);
      });
    }, 500);
    
    // Re-initialize before/after sliders
    initializeBeforeAfter();
    
    // Re-initialize anchor links
    initializeAnchorLinks();
    
    // Re-initialize accordions
    initializeAccordions();
    
    // Re-initialize forms
    initializeForms();
    
    // Initialize case studies functionality if on that page
    if (window.location.pathname.includes('/case-studies')) {
      initializeCaseStudies();
    }
  }

  // Separate initialization functions for reuse
  function initializeAnchorLinks() {
    // Remove existing listeners to prevent duplicates
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    
    anchorLinks.forEach(link => {
      // Clone node to remove all event listeners
      const newLink = link.cloneNode(true);
      link.parentNode?.replaceChild(newLink, link);
      
      newLink.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href === '#') return;
        
        e.preventDefault();
        const target = document.querySelector(href);
        
        if (target) {
          const headerHeight = 80;
          const targetPosition = target.offsetTop - headerHeight;
          
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
        }
      });
    });
  }

  function initializeAccordions() {
    const accordionButtons = document.querySelectorAll('.accordion-toggle, .faq-toggle');
    
    accordionButtons.forEach(button => {
      // Clone to remove existing listeners
      const newButton = button.cloneNode(true);
      button.parentNode?.replaceChild(newButton, button);
      
      newButton.addEventListener('click', function() {
        const accordion = this.closest('.accordion, .faq-item');
        const content = accordion?.querySelector('.accordion-content, .faq-answer');
        
        if (!accordion || !content) return;
        
        // Close all other accordions
        accordionButtons.forEach(otherButton => {
          const otherAccordion = otherButton.closest('.accordion, .faq-item');
          if (otherAccordion !== accordion && otherAccordion.classList.contains('open')) {
            otherAccordion.classList.remove('open');
            const otherContent = otherAccordion.querySelector('.accordion-content, .faq-answer');
            otherContent?.classList.remove('open');
          }
        });
        
        // Toggle current accordion
        accordion.classList.toggle('open');
        content.classList.toggle('open');
        
        // Handle icon rotation for FAQs
        const icon = this.querySelector('i');
        if (icon) {
          icon.style.transform = content.classList.contains('open') ? 'rotate(180deg)' : 'rotate(0deg)';
        }
      });
    });
  }

  function initializeForms() {
    const forms = document.querySelectorAll('form[data-hqc-form]');
    
    forms.forEach(form => {
      // Clone to remove existing listeners
      const newForm = form.cloneNode(true);
      form.parentNode?.replaceChild(newForm, form);
      
      newForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const requiredFields = this.querySelectorAll('[required]');
        let isValid = true;
        
        requiredFields.forEach(field => {
          if (!field.value.trim()) {
            isValid = false;
            field.classList.add('border-red-500');
          } else {
            field.classList.remove('border-red-500');
          }
        });
        
        if (isValid) {
          console.log('Form is valid and ready to submit');
          alert('Thank you for your inquiry! We will contact you soon.');
        }
      });
    });
  }

  // Initialize all components on first load
  initializeAnchorLinks();
  initializeAccordions();
  initializeForms();

  // Initialize before/after functionality
  initializeBeforeAfter();
  
  // Initialize case studies functionality if on that page
  if (window.location.pathname.includes('/case-studies')) {
    initializeCaseStudies();
  }

  function initializeBeforeAfter() {
    // Basic before/after image comparison (if element exists)
    const beforeAfterContainers = document.querySelectorAll('.ba-container');
  
  beforeAfterContainers.forEach(container => {
    const handle = container.querySelector('.ba-handle');
    const afterWrap = container.querySelector('.ba-after-wrap');
    
    if (handle && afterWrap) {
      let isDragging = false;
      
      function updatePosition(clientX) {
        const rect = container.getBoundingClientRect();
        const percentage = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
        
        handle.style.left = percentage + '%';
        afterWrap.style.clipPath = `inset(0 ${100 - percentage}% 0 0)`;
      }
      
      handle.addEventListener('mousedown', () => isDragging = true);
      
      document.addEventListener('mousemove', (e) => {
        if (isDragging) {
          updatePosition(e.clientX);
        }
      });
      
      document.addEventListener('mouseup', () => isDragging = false);
      
      // Touch events for mobile
      handle.addEventListener('touchstart', (e) => {
        isDragging = true;
        e.preventDefault();
      });
      
      document.addEventListener('touchmove', (e) => {
        if (isDragging) {
          updatePosition(e.touches[0].clientX);
          e.preventDefault();
        }
      });
      
      document.addEventListener('touchend', () => isDragging = false);
    }
  });
  }
});

// Export for potential use in other scripts
export { };
