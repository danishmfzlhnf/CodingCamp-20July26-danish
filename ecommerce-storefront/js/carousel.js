/**
 * Hero Banner Carousel with Auto-rotation, Touch Swipe, and Pause-on-Hover
 */

class HeroCarousel {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.slidesWrapper = this.container.querySelector('.carousel-slides');
    this.dotsWrapper = this.container.querySelector('.carousel-dots');
    this.prevBtn = this.container.querySelector('.carousel-arrow-prev');
    this.nextBtn = this.container.querySelector('.carousel-arrow-next');

    this.currentIndex = 0;
    this.banners = options.banners || [];
    this.autoRotateInterval = options.interval || 4500;
    this.timer = null;
    this.touchStartX = 0;
    this.touchEndX = 0;

    this.init();
  }

  init() {
    this.renderSlides();
    this.renderDots();
    this.bindEvents();
    this.startAutoRotate();
  }

  renderSlides() {
    this.slidesWrapper.innerHTML = this.banners.map((b, idx) => `
      <div class="carousel-slide ${idx === 0 ? 'active' : ''}" style="background: ${b.bgGradient}" role="group" aria-roledescription="slide" aria-label="${idx + 1} dari ${this.banners.length}">
        <div class="slide-content">
          <span class="slide-badge" style="background-color: ${b.badgeColor}">${b.tag}</span>
          <h2 class="slide-title">${b.title}</h2>
          <p class="slide-subtitle">${b.subtitle}</p>
          <a href="${b.ctaLink}" class="slide-cta-btn">${b.ctaText} &rarr;</a>
        </div>
        <div class="slide-visual">
          <img src="${b.image}" alt="${b.title}" loading="${idx === 0 ? 'eager' : 'lazy'}" class="slide-img" />
        </div>
      </div>
    `).join('');
  }

  renderDots() {
    this.dotsWrapper.innerHTML = this.banners.map((_, idx) => `
      <button class="carousel-dot ${idx === 0 ? 'active' : ''}" aria-label="Slide ${idx + 1}" data-index="${idx}"></button>
    `).join('');
  }

  goToSlide(index) {
    const slides = this.slidesWrapper.querySelectorAll('.carousel-slide');
    const dots = this.dotsWrapper.querySelectorAll('.carousel-dot');

    if (index < 0) {
      this.currentIndex = slides.length - 1;
    } else if (index >= slides.length) {
      this.currentIndex = 0;
    } else {
      this.currentIndex = index;
    }

    slides.forEach((slide, idx) => {
      slide.classList.toggle('active', idx === this.currentIndex);
    });

    dots.forEach((dot, idx) => {
      dot.classList.toggle('active', idx === this.currentIndex);
    });
  }

  next() {
    this.goToSlide(this.currentIndex + 1);
  }

  prev() {
    this.goToSlide(this.currentIndex - 1);
  }

  startAutoRotate() {
    this.stopAutoRotate();
    this.timer = setInterval(() => {
      this.next();
    }, this.autoRotateInterval);
  }

  stopAutoRotate() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  bindEvents() {
    if (this.prevBtn) {
      this.prevBtn.addEventListener('click', () => {
        this.prev();
        this.startAutoRotate();
      });
    }

    if (this.nextBtn) {
      this.nextBtn.addEventListener('click', () => {
        this.next();
        this.startAutoRotate();
      });
    }

    this.dotsWrapper.addEventListener('click', (e) => {
      if (e.target.classList.contains('carousel-dot')) {
        const index = parseInt(e.target.dataset.index, 10);
        this.goToSlide(index);
        this.startAutoRotate();
      }
    });

    // Pause on hover
    this.container.addEventListener('mouseenter', () => this.stopAutoRotate());
    this.container.addEventListener('mouseleave', () => this.startAutoRotate());

    // Touch Swipe Support for Mobile
    this.container.addEventListener('touchstart', (e) => {
      this.touchStartX = e.changedTouches[0].screenX;
      this.stopAutoRotate();
    }, { passive: true });

    this.container.addEventListener('touchend', (e) => {
      this.touchEndX = e.changedTouches[0].screenX;
      this.handleSwipe();
      this.startAutoRotate();
    }, { passive: true });
  }

  handleSwipe() {
    const diff = this.touchStartX - this.touchEndX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        this.next(); // swipe left
      } else {
        this.prev(); // swipe right
      }
    }
  }
}
