// Gallery functionality for case studies page
// Handles modal carousel, filtering, and before/after comparisons

export function initializeGallery() {
  // Prevent duplicate initialization
  if (window.galleryInitialized) {
    return;
  }
  
  console.log('🖼️ Initializing gallery...');
  
  // Clean up any conflicting modal systems
  const conflictingModals = document.querySelectorAll('#imageModal, .modal:not(#galleryModal), .basic-modal');
  conflictingModals.forEach(modal => {
    if (modal.id !== 'galleryModal') {
      modal.remove();
      console.log('🧹 Removed conflicting modal:', modal.id || modal.className || 'unnamed');
    }
  });
  
  // Remove any existing event listeners on gallery items to prevent conflicts
  document.querySelectorAll('.masonry-item').forEach(item => {
    // Clone to remove all existing event listeners
    const newItem = item.cloneNode(true);
    const parent = item.parentNode;
    if (parent) {
      parent.replaceChild(newItem, item);
    }
  });

  // Gallery data structure
  const galleryItems = Array.from(document.querySelectorAll('.masonry-item')).map((item, index) => {
    const img = item.querySelector('img');
    const overlayContent = item.querySelector('.gallery-overlay-content');
    const titleEl = overlayContent?.querySelector('h3');
    const descEl = overlayContent?.querySelector('p');
    const badgeEl = overlayContent?.querySelector('.badge');
    const locationEl = overlayContent?.querySelector('.location');
    
    return {
      element: item,
      index: index,
      src: img?.src || '',
      alt: img?.alt || '',
      title: titleEl?.textContent || '',
      description: descEl?.textContent || '',
      category: item.getAttribute('data-category') || '',
      badge: badgeEl?.textContent || '',
      location: locationEl?.textContent || ''
    };
  });

  if (galleryItems.length === 0) {
    console.log('⚠️ No gallery items found, skipping gallery initialization');
    return;
  }

  let currentImageIndex = 0;
  let filteredItems = [...galleryItems];

  // Initialize all items as visible
  galleryItems.forEach(item => {
    const htmlItem = item.element;
    htmlItem.classList.add('filtered-in');
  });

  // Gallery filtering
  const filterButtons = document.querySelectorAll('.filter-btn');

  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Update active button
      filterButtons.forEach(btn => {
        btn.classList.remove('active', 'bg-gold', 'text-navy');
        btn.classList.add('bg-white', 'text-gold');
      });
      button.classList.add('active', 'bg-gold', 'text-navy');
      button.classList.remove('bg-white', 'text-gold');

      // Filter items
      const filter = button.getAttribute('data-filter');
      
      galleryItems.forEach(item => {
        const htmlItem = item.element;
        
        if (filter === 'all' || item.category === filter) {
          // Show item with smooth transition
          htmlItem.classList.remove('filtered-out');
          htmlItem.classList.add('filtered-in');
          htmlItem.style.display = 'block';
        } else {
          // Hide item with smooth transition
          htmlItem.classList.remove('filtered-in');
          htmlItem.classList.add('filtered-out');
          
          // Wait for transition to complete before hiding
          setTimeout(() => {
            if (htmlItem.classList.contains('filtered-out')) {
              htmlItem.style.display = 'none';
            }
          }, 300);
        }
      });

      // Update filtered items for carousel
      if (filter === 'all') {
        filteredItems = [...galleryItems];
      } else {
        filteredItems = galleryItems.filter(item => item.category === filter);
      }
    });
  });

  // Modal elements
  const modal = document.getElementById('galleryModal');
  const modalImg = document.getElementById('modalImage');
  const modalTitle = document.getElementById('modalTitle');
  const modalDescription = document.getElementById('modalDescription');
  const modalBadge = document.getElementById('modalBadge');
  const modalLocation = document.getElementById('modalLocation');
  const modalCurrentIndex = document.getElementById('modalCurrentIndex');
  const modalTotalCount = document.getElementById('modalTotalCount');
  const modalClose = document.querySelector('.modal-close');
  const carouselPrev = document.querySelector('.carousel-prev');
  const carouselNext = document.querySelector('.carousel-next');
  const thumbnailContainer = document.getElementById('thumbnailContainer');

  if (!modal || !modalImg || !modalTitle || !modalDescription) {
    console.log('⚠️ Modal elements not found, skipping modal functionality');
    return;
  }

  // Update modal content
  function updateModalContent(index) {
    const item = filteredItems[index];
    if (!item) return;

    modalImg.src = item.src;
    modalImg.alt = item.alt;
    modalTitle.textContent = item.title;
    modalDescription.textContent = item.description;
    
    if (modalBadge) modalBadge.textContent = item.badge;
    if (modalLocation) modalLocation.textContent = item.location;
    if (modalCurrentIndex) modalCurrentIndex.textContent = (index + 1).toString();
    if (modalTotalCount) modalTotalCount.textContent = filteredItems.length.toString();

    // Show/hide navigation based on number of items
    const hasMultipleItems = filteredItems.length > 1;
    if (carouselPrev) {
      carouselPrev.style.display = hasMultipleItems ? 'flex' : 'none';
    }
    if (carouselNext) {
      carouselNext.style.display = hasMultipleItems ? 'flex' : 'none';
    }

    // Update thumbnails
    updateThumbnails();
    
    // Ensure modal elements are properly visible
    requestAnimationFrame(() => {
      if (modal.classList.contains('active')) {
        // Force layout recalculation to prevent hiding issues
        modal.style.display = 'flex';
        
        // Ensure navigation arrows are visible
        if (carouselPrev && hasMultipleItems) carouselPrev.style.visibility = 'visible';
        if (carouselNext && hasMultipleItems) carouselNext.style.visibility = 'visible';
      }
    });
  }

  // Create and update thumbnails
  function updateThumbnails() {
    if (!thumbnailContainer) return;
    
    thumbnailContainer.innerHTML = '';
    
    filteredItems.forEach((item, index) => {
      const thumbnail = document.createElement('img');
      thumbnail.src = item.src;
      thumbnail.alt = item.alt;
      thumbnail.className = `thumbnail ${index === currentImageIndex ? 'active' : ''}`;
      thumbnail.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        currentImageIndex = index;
        updateModalContent(currentImageIndex);
        console.log('📸 Thumbnail clicked:', index);
      });
      thumbnailContainer.appendChild(thumbnail);
    });

    // Scroll active thumbnail into view
    const activeThumbnail = thumbnailContainer.querySelector('.thumbnail.active');
    if (activeThumbnail) {
      activeThumbnail.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }

  // Navigation functions
  function nextImage() {
    currentImageIndex = (currentImageIndex + 1) % filteredItems.length;
    updateModalContent(currentImageIndex);
  }

  function prevImage() {
    currentImageIndex = (currentImageIndex - 1 + filteredItems.length) % filteredItems.length;
    updateModalContent(currentImageIndex);
  }

  // Gallery item click handlers
  galleryItems.forEach((item, index) => {
    // Make gallery items focusable
    item.element.setAttribute('tabindex', '0');
    item.element.setAttribute('role', 'button');
    item.element.setAttribute('aria-label', `View ${item.title} in gallery`);
    
    item.element.addEventListener('click', () => {
      // Find the index in the current filtered items
      const filteredIndex = filteredItems.findIndex(filteredItem => filteredItem.index === index);
      if (filteredIndex !== -1) {
        currentImageIndex = filteredIndex;
        updateModalContent(currentImageIndex);
        openModal();
      }
    });
    
    // Keyboard support for gallery items
    item.element.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const filteredIndex = filteredItems.findIndex(filteredItem => filteredItem.index === index);
        if (filteredIndex !== -1) {
          currentImageIndex = filteredIndex;
          updateModalContent(currentImageIndex);
          openModal();
        }
      }
    });
  });

  // Modal controls
  function openModal() {
    // Ensure we're the only modal open - check both modal types
    document.querySelectorAll('.modal.active, .basic-modal.active').forEach(m => {
      if (m !== modal) {
        m.classList.remove('active');
      }
    });
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Ensure navigation arrows are visible
    setTimeout(() => {
      if (carouselPrev) carouselPrev.style.display = 'flex';
      if (carouselNext) carouselNext.style.display = 'flex';
    }, 50);
    
    // Focus management for accessibility
    if (modalClose) {
      modalClose.focus();
    }
    
    console.log('📷 Gallery modal opened');
  }

  function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
    
    // Return focus to the clicked gallery item
    const currentItem = filteredItems[currentImageIndex];
    if (currentItem && currentItem.element) {
      currentItem.element.focus();
    }
    
    console.log('📷 Gallery modal closed');
  }

  // Event listeners
  if (modalClose) modalClose.addEventListener('click', closeModal);
  if (carouselPrev) carouselPrev.addEventListener('click', prevImage);
  if (carouselNext) carouselNext.addEventListener('click', nextImage);

  // Click outside modal to close (but not on navigation elements)
  modal.addEventListener('click', (e) => {
    // Don't close if clicking on navigation arrows, info panel, or thumbnails
    const clickedElement = e.target;
    const isModalBackground = clickedElement === modal;
    const isInsideCarouselNav = clickedElement.closest('.carousel-nav');
    const isInsideCarouselInfo = clickedElement.closest('.carousel-info');
    const isInsideThumbnailStrip = clickedElement.closest('.thumbnail-strip');
    const isInsideCarouselMain = clickedElement.closest('.carousel-main');
    
    if (isModalBackground && 
        !isInsideCarouselNav && 
        !isInsideCarouselInfo && 
        !isInsideThumbnailStrip &&
        !isInsideCarouselMain) {
      closeModal();
    }
  });

  // Keyboard navigation
  function handleKeydown(e) {
    if (!modal.classList.contains('active')) return;
    
    switch(e.key) {
      case 'Escape':
        closeModal();
        break;
      case 'ArrowLeft':
        e.preventDefault();
        prevImage();
        break;
      case 'ArrowRight':
        e.preventDefault();
        nextImage();
        break;
    }
  }

  // Touch/swipe support for mobile
  let touchStartX = 0;
  let touchEndX = 0;

  function handleTouchStart(e) {
    touchStartX = e.changedTouches[0].screenX;
  }

  function handleTouchEnd(e) {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  }

  function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;
    
    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        nextImage(); // Swipe left = next image
      } else {
        prevImage(); // Swipe right = previous image
      }
    }
  }

  // Add event listeners
  document.addEventListener('keydown', handleKeydown);
  modal.addEventListener('touchstart', handleTouchStart);
  modal.addEventListener('touchend', handleTouchEnd);
  
  // Prevent thumbnail strip from closing modal
  if (thumbnailContainer) {
    thumbnailContainer.addEventListener('click', (e) => {
      e.stopPropagation();
    });
  }

  // Store cleanup function for later use
  window.galleryCleanup = function() {
    document.removeEventListener('keydown', handleKeydown);
    modal.removeEventListener('touchstart', handleTouchStart);
    modal.removeEventListener('touchend', handleTouchEnd);
    window.galleryInitialized = false;
    window.galleryCleanup = null;
    console.log('🧹 Gallery cleaned up');
  };

  window.galleryInitialized = true;
  console.log('✅ Gallery initialized successfully');
}

// Before/After functionality
export function initializeBeforeAfter() {
  console.log('↔️ Initializing before/after comparisons...');
  
  function initBA(container) {
    const afterWrap = container.querySelector(".ba-after-wrap");
    const handle = container.querySelector(".ba-handle");
    const dot = container.querySelector(".ba-dot");
    
    if (!afterWrap || !handle || !dot) return;
    
    let dragging = false;

    function setX(clientX) {
      const rect = container.getBoundingClientRect();
      let x = clientX - rect.left;
      x = Math.max(0, Math.min(x, rect.width));
      const pct = (x / rect.width) * 100;
      afterWrap.style.width = pct + "%";
      handle.style.left = pct + "%";
    }

    const onMove = (e) => {
      if (!dragging) return;
      e.preventDefault();
      if ('touches' in e && e.touches[0]) {
        setX(e.touches[0].clientX);
      } else if ('clientX' in e) {
        setX(e.clientX);
      }
    };

    // Mouse events
    handle.addEventListener("mousedown", (e) => {
      dragging = true;
      e.preventDefault();
    });
    
    window.addEventListener("mouseup", () => (dragging = false));
    window.addEventListener("mousemove", onMove);

    // Touch events
    handle.addEventListener("touchstart", (e) => {
      dragging = true;
      e.preventDefault();
    }, { passive: false });
    
    window.addEventListener("touchend", () => (dragging = false));
    window.addEventListener("touchmove", onMove, { passive: false });

    // Click to set position
    container.addEventListener("click", (e) => {
      if (e.target !== handle && e.target !== dot) {
        setX(e.clientX);
      }
    });

    // Keyboard accessibility
    handle.setAttribute('tabindex', '0');
    handle.setAttribute('role', 'slider');
    handle.setAttribute('aria-label', 'Before and after comparison slider');
    handle.setAttribute('aria-valuemin', '0');
    handle.setAttribute('aria-valuemax', '100');
    handle.setAttribute('aria-valuenow', '50');

    handle.addEventListener('keydown', (e) => {
      const currentPct = parseFloat(handle.style.left) || 50;
      let newPct = currentPct;

      switch(e.key) {
        case 'ArrowLeft':
          newPct = Math.max(0, currentPct - 5);
          break;
        case 'ArrowRight':
          newPct = Math.min(100, currentPct + 5);
          break;
        case 'Home':
          newPct = 0;
          break;
        case 'End':
          newPct = 100;
          break;
        default:
          return;
      }

      e.preventDefault();
      afterWrap.style.width = newPct + "%";
      handle.style.left = newPct + "%";
      handle.setAttribute('aria-valuenow', String(Math.round(newPct)));
    });
  }

  // Initialize all before/after containers
  const containers = document.querySelectorAll(".ba-container");
  containers.forEach((c) => initBA(c));
  
  console.log(`✅ Initialized ${containers.length} before/after comparisons`);
}

// Main initialization function
export function initializeCaseStudies() {
  console.log('📚 Initializing case studies functionality...');
  initializeGallery();
  initializeBeforeAfter();
}
