/**
 * Lā Kurumba — Editorial Experience
 * High-performance scroll animation engine, directional entrance/exit transitions,
 * smooth parallax touches and interactive features.
 */

document.documentElement.classList.add('js');

// Motion preference query
const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

// ---------------------------------------------------------------------------
// 1. DIRECTIONAL SCROLL & VIEWPORT INTERSECTION SYSTEM
// ---------------------------------------------------------------------------
const animSelectors = '.reveal, .scroll-up, .scroll-down, .fade-in, .stagger-reveal';
const animElements = [...document.querySelectorAll(animSelectors)];

// Assign alternating subtle offsets if not already configured
animElements.forEach((el, i) => {
  if (!el.dataset.motion) {
    el.dataset.motion = i % 3 === 1 ? 'down' : 'up';
  }
});

// Advanced IntersectionObserver with bidirectional exit/enter transitions
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    const el = entry.target;
    const rect = entry.boundingClientRect;

    if (entry.isIntersecting) {
      // Entering viewport -> Fade in and smoothly glide into position
      el.classList.remove('exit-top', 'exit-bottom', 'passed', 'fade-out');
      el.classList.add('visible', 'is-visible');
      el.setAttribute('data-in-view', 'true');
    } else {
      // Leaving viewport -> Graceful directional exit and fade out
      el.classList.remove('visible', 'is-visible');
      el.setAttribute('data-in-view', 'false');

      // Top exit vs Bottom exit detection
      if (rect.top <= 80 || rect.bottom <= 0) {
        // Exited above the viewport (scrolling down past it)
        el.classList.remove('exit-bottom');
        el.classList.add('exit-top', 'passed');
      } else {
        // Exited below the viewport (scrolling up past it)
        el.classList.remove('exit-top', 'passed');
        el.classList.add('exit-bottom');
      }
    }
  });
}, {
  threshold: [0, 0.12],
  rootMargin: '0px 0px -4% 0px'
});

animElements.forEach((el) => observer.observe(el));

// ---------------------------------------------------------------------------
// 2. SCROLL PROGRESS, DIRECTION TRACKER & PARALLAX DYNAMICS
// ---------------------------------------------------------------------------
const progressBar = document.querySelector('.scroll-progress');
const header = document.querySelector('header');
const heroImg = document.querySelector('.hero-img');
const heroContent = document.querySelector('.hero-content');
const heritageStory = document.querySelector('#story');
const heritageFood = document.querySelector('.heritage-food');
const pauseSection = document.querySelector('.pause');
const pauseImg = document.querySelector('.pause > img');
const gallerySection = document.querySelector('#gallery') || document.querySelector('#moments');
const galleryCards = [...document.querySelectorAll('.gallery-card')];

let lastScrollY = window.scrollY;
let currentDirection = 'down';
let scrollTicking = false;

function renderScroll() {
  const y = window.scrollY;
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;

  // 1. Scroll progress bar
  if (progressBar) {
    const progress = maxScroll > 0 ? y / maxScroll : 0;
    progressBar.style.transform = `scaleX(${progress})`;
  }

  // 2. Compact header on scroll
  if (header) {
    header.classList.toggle('scrolled', y > 55);
  }

  // 3. Scroll direction detection
  const delta = y - lastScrollY;
  if (Math.abs(delta) > 3) {
    const newDirection = delta > 0 ? 'down' : 'up';
    if (newDirection !== currentDirection) {
      currentDirection = newDirection;
      document.body.dataset.scrollDirection = newDirection;
      document.body.classList.toggle('scrolling-down', newDirection === 'down');
      document.body.classList.toggle('scrolling-up', newDirection === 'up');
    }
  }
  lastScrollY = Math.max(0, y);

  // 4. Parallax & floating depth layers (disabled if reduced motion requested)
  if (!motionQuery.matches) {
    const vh = window.innerHeight;

    // Hero parallax & soft fade-out
    if (heroImg && y < vh * 1.3) {
      const heroShift = Math.min(y * 0.22, 220);
      heroImg.style.transform = `translate3d(0, ${heroShift.toFixed(1)}px, 0) scale(1.08)`;
    }
    if (heroContent && y < vh * 1.3) {
      const contentShift = Math.min(y * 0.1, 95);
      const contentOpacity = Math.max(0, 1 - (y / (vh * 0.72)));
      heroContent.style.transform = `translate3d(0, ${contentShift.toFixed(1)}px, 0)`;
      heroContent.style.opacity = contentOpacity.toFixed(3);
    }

    // Heritage food card floating depth
    if (heritageStory && heritageFood) {
      const rect = heritageStory.getBoundingClientRect();
      if (rect.top < vh && rect.bottom > 0) {
        const foodRel = (rect.top - vh * 0.5) * 0.08;
        heritageFood.style.transform = `translate3d(0, ${(-foodRel).toFixed(1)}px, 0) rotate(-5deg)`;
      }
    }

    // Pause section ocean zoom & panning
    if (pauseSection && pauseImg) {
      const rect = pauseSection.getBoundingClientRect();
      if (rect.top < vh && rect.bottom > 0) {
        const pauseRel = (rect.top - vh * 0.5) * 0.11;
        pauseImg.style.transform = `scale(1.14) translate3d(0, ${pauseRel.toFixed(1)}px, 0)`;
      }
    }

    // Gallery cards organic magazine spread floating
    if (gallerySection && galleryCards.length) {
      const rect = gallerySection.getBoundingClientRect();
      if (rect.top < vh && rect.bottom > 0) {
        const galleryRel = rect.top - vh * 0.5;
        galleryCards.forEach((card, index) => {
          const factor = index === 1 ? -0.045 : (index === 2 ? 0.035 : 0.02);
          const img = card.querySelector('img');
          if (img) {
            img.style.transform = `translate3d(0, ${(galleryRel * factor).toFixed(1)}px, 0)`;
          }
        });
      }
    }
  }

  scrollTicking = false;
}

function scheduleScroll() {
  if (!scrollTicking) {
    requestAnimationFrame(renderScroll);
    scrollTicking = true;
  }
}

window.addEventListener('scroll', scheduleScroll, { passive: true });
window.addEventListener('resize', scheduleScroll, { passive: true });
renderScroll();

// ---------------------------------------------------------------------------
// 3. NAVIGATION & MOBILE MENU
// ---------------------------------------------------------------------------
const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('nav');

if (menuToggle && nav) {
  menuToggle.addEventListener('click', () => {
    const isOpen = menuToggle.getAttribute('aria-expanded') !== 'true';
    menuToggle.setAttribute('aria-expanded', String(isOpen));
    nav.classList.toggle('open', isOpen);
  });

  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      nav.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
    }
  });
}

// ---------------------------------------------------------------------------
// 4. AT THE TABLE — EDITORIAL FOOD TABS
// ---------------------------------------------------------------------------
const edits = {
  morning: {
    image: 'breakfast',
    alt: 'Illustrative breakfast with eggs and toast',
    kicker: 'THE MORNING EDIT',
    title: 'Wake up.<br>Take it easy.',
    description: 'Avo toast, a colourful fruit bowl, or a coffee worth slowing down for. Breakfast and brunch make a lovely beginning to an Unawatuna day.',
    items: ['Avo toast', 'Fruit bowls', 'Coffee & fresh juices'],
    tag: 'A GOOD DAY STARTS HERE'
  },
  lunch: {
    image: 'bowl',
    alt: 'Illustrative colourful vegetable bowl',
    kicker: 'THE LUNCH EDIT',
    title: 'A little colour.<br>A lot of flavour.',
    description: 'From fresh bowls to island-inspired plates, take a moment to explore something delicious. Public guest listings mention these dishes; call for today’s selection.',
    items: ['Chicken poke bowl', 'Coconut chilli prawns', 'Falafel'],
    tag: 'TAKE THE LONG LUNCH'
  },
  drinks: {
    image: 'drinks',
    alt: 'Illustrative citrus drink',
    kicker: 'THE DRINKS EDIT',
    title: 'Sip slowly.<br>Stay a while.',
    description: 'Make room for a refreshing pause. Coffee, fresh juices and island-inspired drinks bring a little sunshine to the table.',
    items: ['Carrot, ginger & beetroot juice', 'Coco colada', 'Curry leaf cocktail'],
    tag: 'HERE’S TO ISLAND TIME'
  }
};

const tabs = [...document.querySelectorAll('.tabs [role=tab]')];

function selectTab(tab) {
  const category = tab.dataset.category;
  const data = edits[category];
  if (!data) return;

  tabs.forEach((t) => {
    const isSelected = t === tab;
    t.setAttribute('aria-selected', String(isSelected));
    t.tabIndex = isSelected ? 0 : -1;
  });

  const panel = document.querySelector('#food-panel');
  if (panel) panel.setAttribute('aria-labelledby', tab.id);

  const img = document.querySelector('#food-image');
  if (img) {
    img.style.opacity = '0';
    setTimeout(() => {
      img.src = 'assets/' + data.image + '.jpg';
      img.alt = data.alt;
      img.style.opacity = '1';
    }, 180);
  }

  const kicker = document.querySelector('#food-kicker');
  if (kicker) kicker.textContent = data.kicker;

  const title = document.querySelector('#food-title');
  if (title) title.innerHTML = data.title;

  const desc = document.querySelector('#food-description');
  if (desc) desc.textContent = data.description;

  const list = document.querySelector('#food-list');
  if (list) {
    list.innerHTML = data.items.map((x) => `<li>${x}<span>↗</span></li>`).join('');
  }

  const photoTag = document.querySelector('.photo-tag');
  if (photoTag) photoTag.textContent = data.tag;
}

tabs.forEach((t, i) => {
  t.addEventListener('click', () => selectTab(t));
  t.addEventListener('keydown', (e) => {
    let nextIndex;
    if (e.key === 'ArrowRight') nextIndex = (i + 1) % tabs.length;
    if (e.key === 'ArrowLeft') nextIndex = (i + tabs.length - 1) % tabs.length;
    if (e.key === 'Home') nextIndex = 0;
    if (e.key === 'End') nextIndex = tabs.length - 1;
    if (nextIndex !== undefined) {
      e.preventDefault();
      tabs[nextIndex].focus();
      selectTab(tabs[nextIndex]);
    }
  });
});

// ---------------------------------------------------------------------------
// 5. INTERACTIVE GALLERY FILTERING & ENHANCED LIGHTBOX
// ---------------------------------------------------------------------------
const galleryFilterBtns = document.querySelectorAll('.filter-pill');
const allGalleryCards = [...document.querySelectorAll('.gallery-card')];
const galleryFilterStatus = document.querySelector('.gallery-filter-status');
const lightbox = document.querySelector('#lightbox');

function getVisibleGalleryCards() {
  return allGalleryCards.filter(card => !card.hasAttribute('hidden'));
}

// Category Filtering
if (galleryFilterBtns.length) {
  galleryFilterBtns.forEach((btn, idx) => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;
      galleryFilterBtns.forEach((b) => {
        const active = b === btn;
        b.classList.toggle('active', active);
        b.setAttribute('aria-selected', String(active));
        b.tabIndex = active ? 0 : -1;
      });

      let count = 0;
      allGalleryCards.forEach((card) => {
        const match = filter === 'all' || card.dataset.category === filter;
        if (match) {
          card.removeAttribute('hidden');
          card.classList.add('visible', 'is-visible');
          count++;
        } else {
          card.setAttribute('hidden', '');
        }
      });

      if (galleryFilterStatus) {
        const rawText = btn.childNodes[0].textContent.trim();
        const label = filter === 'all' ? 'all ' + count + ' moments' : count + ' moments in ' + rawText;
        galleryFilterStatus.textContent = 'Showing ' + label;
      }
    });

    btn.addEventListener('keydown', (e) => {
      let nextIdx;
      if (e.key === 'ArrowRight') nextIdx = (idx + 1) % galleryFilterBtns.length;
      if (e.key === 'ArrowLeft') nextIdx = (idx - 1 + galleryFilterBtns.length) % galleryFilterBtns.length;
      if (nextIdx !== undefined) {
        e.preventDefault();
        galleryFilterBtns[nextIdx].focus();
        galleryFilterBtns[nextIdx].click();
      }
    });
  });
}

// Lightbox state & controls
let currentLightboxIdx = 0;

function showLightboxCard(index) {
  const visible = getVisibleGalleryCards();
  if (!visible.length || !lightbox) return;
  currentLightboxIdx = (index + visible.length) % visible.length;
  const card = visible[currentLightboxIdx];
  const btn = card.querySelector('[data-photo]');
  if (!btn) return;

  const img = lightbox.querySelector('#lightbox-img') || lightbox.querySelector('img');
  const captionEl = lightbox.querySelector('#lightbox-caption') || lightbox.querySelector('p');
  const titleEl = lightbox.querySelector('#lightbox-title');
  const badgeEl = lightbox.querySelector('#lightbox-badge');
  const counterEl = lightbox.querySelector('#lightbox-counter');

  if (img) {
    img.src = btn.dataset.photo;
    img.alt = btn.dataset.caption;
  }
  if (captionEl) captionEl.textContent = btn.dataset.caption;
  if (titleEl) titleEl.textContent = btn.dataset.title || '';
  if (badgeEl) badgeEl.textContent = btn.dataset.category || '';
  if (counterEl) {
    const cur = String(currentLightboxIdx + 1).padStart(2, '0');
    const tot = String(visible.length).padStart(2, '0');
    counterEl.textContent = cur + ' / ' + tot;
  }
}

// Open lightbox on card click via event delegation
const galleryGrid = document.querySelector('#gallery-grid');
if (galleryGrid && lightbox) {
  galleryGrid.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-photo]');
    if (!btn) return;
    const card = btn.closest('.gallery-card');
    const visible = getVisibleGalleryCards();
    const idx = visible.indexOf(card);
    if (idx !== -1) {
      currentLightboxIdx = idx;
    }
    showLightboxCard(currentLightboxIdx);
    lightbox.showModal();
  });
}

// Support other data-photo buttons if any
document.querySelectorAll('[data-photo]').forEach((btn) => {
  if (btn.closest('#gallery-grid')) return;
  btn.addEventListener('click', () => {
    if (!lightbox) return;
    const img = lightbox.querySelector('img');
    const cap = lightbox.querySelector('p');
    if (img) {
      img.src = btn.dataset.photo;
      img.alt = btn.dataset.caption;
    }
    if (cap) cap.textContent = btn.dataset.caption;
    lightbox.showModal();
  });
});

// Lightbox Prev & Next button handlers
if (lightbox) {
  const prevBtn = lightbox.querySelector('.lightbox-prev');
  const nextBtn = lightbox.querySelector('.lightbox-next');
  if (prevBtn) {
    prevBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      showLightboxCard(currentLightboxIdx - 1);
    });
  }
  if (nextBtn) {
    nextBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      showLightboxCard(currentLightboxIdx + 1);
    });
  }

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (!lightbox.open) return;
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      showLightboxCard(currentLightboxIdx - 1);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      showLightboxCard(currentLightboxIdx + 1);
    }
  });

  // Touch swipe support for mobile
  let touchStartX = 0;
  let touchEndX = 0;
  lightbox.addEventListener('touchstart', (e) => {
    if (e.changedTouches && e.changedTouches[0]) {
      touchStartX = e.changedTouches[0].screenX;
    }
  }, { passive: true });
  lightbox.addEventListener('touchend', (e) => {
    if (e.changedTouches && e.changedTouches[0]) {
      touchEndX = e.changedTouches[0].screenX;
      const diff = touchEndX - touchStartX;
      if (Math.abs(diff) > 40) {
        if (diff < 0) showLightboxCard(currentLightboxIdx + 1);
        else showLightboxCard(currentLightboxIdx - 1);
      }
    }
  }, { passive: true });
}

// Credits modal
const creditsOpenBtn = document.querySelector('#credits-open');
const creditsModal = document.querySelector('#credits');
if (creditsOpenBtn && creditsModal) {
  creditsOpenBtn.addEventListener('click', () => creditsModal.showModal());
}

// Dialog close handlers
document.querySelectorAll('dialog').forEach((dialog) => {
  const closeBtn = dialog.querySelector('.close');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => dialog.close());
  }
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) {
      const r = dialog.getBoundingClientRect();
      if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) {
        dialog.close();
      }
    }
  });
});


// ---------------------------------------------------------------------------
// 6. GOOGLE REVIEWS CATEGORY FILTERING & ACCESSIBILITY
// ---------------------------------------------------------------------------
const reviewFilterBtns = document.querySelectorAll('.review-filter-pill');
const reviewCards = [...document.querySelectorAll('.review-card')];
const reviewsStatus = document.querySelector('.reviews-status');

if (reviewFilterBtns.length && reviewCards.length) {
  reviewFilterBtns.forEach((btn, idx) => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;

      // Update button active state & ARIA attributes
      reviewFilterBtns.forEach((b) => {
        const active = b === btn;
        b.classList.toggle('active', active);
        b.setAttribute('aria-selected', String(active));
        b.tabIndex = active ? 0 : -1;
      });

      let count = 0;
      reviewCards.forEach((card) => {
        const categories = (card.dataset.categories || '').split(' ');
        const match = filter === 'all' || categories.includes(filter);

        if (match) {
          card.removeAttribute('hidden');
          // Ensure entering animation states are cleanly reset for display
          card.classList.remove('exit-top', 'exit-bottom', 'passed');
          card.classList.add('visible', 'is-visible');
          count++;
        } else {
          card.setAttribute('hidden', '');
        }
      });

      if (reviewsStatus) {
        const rawText = btn.childNodes[0].textContent.trim();
        const label = filter === 'all'
          ? 'all ' + count + ' authentic reviews'
          : count + ' reviews in ' + rawText;
        reviewsStatus.textContent = 'Showing ' + label;
      }
    });

    // Keyboard navigation (Arrow keys, Home, End)
    btn.addEventListener('keydown', (e) => {
      let nextIdx;
      if (e.key === 'ArrowRight') nextIdx = (idx + 1) % reviewFilterBtns.length;
      if (e.key === 'ArrowLeft') nextIdx = (idx - 1 + reviewFilterBtns.length) % reviewFilterBtns.length;
      if (e.key === 'Home') nextIdx = 0;
      if (e.key === 'End') nextIdx = reviewFilterBtns.length - 1;
      if (nextIdx !== undefined) {
        e.preventDefault();
        reviewFilterBtns[nextIdx].focus();
        reviewFilterBtns[nextIdx].click();
      }
    });
  });
}
