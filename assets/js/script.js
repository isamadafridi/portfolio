/* 
  Portfolio Interactions
  - Smooth anchor scrolling (enhanced behavior + mobile menu close)
  - Active nav link highlight on section intersection
  - Mobile hamburger toggle with ARIA state
  - Light/Dark theme toggle with localStorage and system preference
  - Reveal-on-scroll animations with IntersectionObserver
*/
(function () {
  const docEl = document.documentElement;
  const body = document.body;
  const header = document.getElementById('site-header');
  const menuToggle = document.getElementById('menu-toggle');
  const navLinks = document.querySelectorAll('.nav-link');
  const themeToggle = document.getElementById('theme-toggle');

  // ------------------------------
  // Theme: initial load from localStorage or system
  // ------------------------------
  const storageKey = 'theme-pref';
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

  function applyTheme(theme) {
    docEl.setAttribute('data-theme', theme);
    if (themeToggle) themeToggle.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
  }

  function initTheme() {
    const saved = localStorage.getItem(storageKey);
    if (saved === 'light' || saved === 'dark') {
      applyTheme(saved);
    } else {
      applyTheme(prefersDark ? 'dark' : 'light');
    }
  }

  function toggleTheme() {
    const current = docEl.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    localStorage.setItem(storageKey, next);
    applyTheme(next);
  }

  initTheme();
  themeToggle?.addEventListener('click', toggleTheme);

  // Update theme if OS preference changes (when no explicit pref saved)
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    const saved = localStorage.getItem(storageKey);
    if (!saved) {
      applyTheme(e.matches ? 'dark' : 'light');
    }
  });

  // ------------------------------
  // Mobile menu toggle
  // ------------------------------
  if (menuToggle) {
    menuToggle.addEventListener('click', () => {
      const isOpen = body.getAttribute('data-nav-open') === 'true';
      body.setAttribute('data-nav-open', String(!isOpen));
      menuToggle.setAttribute('aria-expanded', String(!isOpen));
    });
  }

  // Close mobile menu after clicking a link
  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      if (body.getAttribute('data-nav-open') === 'true') {
        body.setAttribute('data-nav-open', 'false');
        menuToggle?.setAttribute('aria-expanded', 'false');
      }
    });
  });

  // ------------------------------
  // Smooth scroll enhancement + focus management
  // ------------------------------
  function smoothScrollTo(hash) {
    const target = document.querySelector(hash);
    if (!target) return;
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    // Move focus for accessibility after scrolling
    setTimeout(() => target.setAttribute('tabindex', '-1'), 0);
    setTimeout(() => target.focus({ preventScroll: true }), 400);
  }

  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const href = a.getAttribute('href');
    if (href && href.length > 1) {
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        smoothScrollTo(href);
      }
    }
  });

  // ------------------------------
  // Active section highlighting in navbar
  // ------------------------------
  const sections = Array.from(document.querySelectorAll('main section[id]'));
  const linkMap = new Map();
  navLinks.forEach((a) => {
    const hash = a.getAttribute('href');
    if (hash && hash.startsWith('#')) linkMap.set(hash.slice(1), a);
  });

  function setActiveLink(id) {
    navLinks.forEach((a) => a.classList.remove('active'));
    const link = linkMap.get(id);
    if (link) link.classList.add('active');
  }

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveLink(entry.target.id);
        }
      });
    },
    {
      root: null,
      rootMargin: '0px 0px -40% 0px',
      threshold: 0.6,
    }
  );

  sections.forEach((sec) => sectionObserver.observe(sec));

  // ------------------------------
  // Reveal-on-scroll animations
  // ------------------------------
  const revealEls = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          obs.unobserve(entry.target);
        }
      });
    },
    { rootMargin: '0px 0px -10% 0px', threshold: 0.1 }
  );
  revealEls.forEach((el) => revealObserver.observe(el));

  // ------------------------------
  // Dynamic year in footer
  // ------------------------------
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // ------------------------------
  // Reduce motion respect
  // ------------------------------
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    // If user prefers reduced motion, disable smooth scroll JS (CSS already handled)
    document.documentElement.style.scrollBehavior = 'auto';
  }
})();